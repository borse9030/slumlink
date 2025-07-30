'use server';

/**
 * @fileOverview AI-powered development suggestion generator for NGO admins.
 *
 * - generateDevelopmentSuggestions - A function that generates development suggestions based on patterns identified by AI across multiple zones.
 * - GenerateDevelopmentSuggestionsInput - The input type for the generateDevelopmentSuggestions function.
 * - GenerateDevelopmentSuggestionsOutput - The return type for the generateDevelopmentSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDevelopmentSuggestionsInputSchema = z.object({
  zonesData: z.array(
    z.object({
      zone: z.string().describe('The name or identifier of the zone.'),
      reports: z
        .array(z.object({
          type: z.string().describe('The type of need reported (e.g., water, electricity, education).'),
          count: z.number().describe('The number of reports for this need type.'),
        }))
        .describe('An array of reports for this zone.'),
    })
  ).describe('An array of zone data, each containing zone name and its reports.'),
});

export type GenerateDevelopmentSuggestionsInput = z.infer<
  typeof GenerateDevelopmentSuggestionsInputSchema
>;

const GenerateDevelopmentSuggestionsOutputSchema = z.object({
  summary: z.string().describe('A summary of the infrastructure issues across all zones.'),
  urgentNeeds: z.string().describe('The most urgent needs across all zones.'),
  developmentSuggestions: z.string().describe('AI-powered development suggestions based on patterns across zones.'),
});

export type GenerateDevelopmentSuggestionsOutput = z.infer<
  typeof GenerateDevelopmentSuggestionsOutputSchema
>;

export async function generateDevelopmentSuggestions(
  input: GenerateDevelopmentSuggestionsInput
): Promise<GenerateDevelopmentSuggestionsOutput> {
  return generateDevelopmentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDevelopmentSuggestionsPrompt',
  input: {schema: GenerateDevelopmentSuggestionsInputSchema},
  output: {schema: GenerateDevelopmentSuggestionsOutputSchema},
  prompt: `You are an AI assistant helping an NGO analyze infrastructure needs across multiple urban slum zones. You will receive data about multiple zones, including the types and counts of infrastructure-related reports for each zone. Your goal is to:

1.  Summarize the overall infrastructure situation across all zones.
2.  Identify the most urgent needs that require immediate attention.
3.  Generate development suggestions based on patterns observed across these zones. For example, if multiple adjacent zones report a lack of clean water, suggest deploying a mobile water tank.

Here is the zone data:

{{#each zonesData}}
Zone: {{this.zone}}
  {{#each this.reports}}
  - {{this.count}} reports for {{this.type}}
  {{/each}}
{{/each}}


Respond with a JSON object with the following keys:

-   summary: A brief summary (max 150 words) of the infrastructure issues across all zones.
-   urgentNeeds: A concise description of the most pressing needs that demand immediate action.
-   developmentSuggestions: Specific, actionable development suggestions based on the identified patterns. Provide at least 3 distinct suggestions.

Adhere to the requested JSON object format, it will be parsed by a program.
`,
});

const generateDevelopmentSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateDevelopmentSuggestionsFlow',
    inputSchema: GenerateDevelopmentSuggestionsInputSchema,
    outputSchema: GenerateDevelopmentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
