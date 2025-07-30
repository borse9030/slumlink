'use server';

/**
 * @fileOverview A flow to suggest the most urgent needs for a zone based on AI analysis.
 *
 * - suggestUrgentNeeds - A function that suggests the most urgent needs for a given zone.
 * - SuggestUrgentNeedsInput - The input type for the suggestUrgentNeeds function.
 * - SuggestUrgentNeedsOutput - The output type for the suggestUrgentNeeds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestUrgentNeedsInputSchema = z.object({
  zone: z.string().describe('The name of the zone to analyze.'),
  reports: z.array(
    z.object({
      type: z.string(),
      severity: z.string(),
      description: z.string(),
    })
  ).describe('A list of reports for the zone, including type and severity.'),
});
export type SuggestUrgentNeedsInput = z.infer<typeof SuggestUrgentNeedsInputSchema>;

const SuggestUrgentNeedsOutputSchema = z.object({
  summary: z.string().describe('A summary of the infrastructure issues in the zone.'),
  urgentNeeds: z.string().describe('A list of the most urgent needs in the zone.'),
  developmentSuggestions: z.string().describe('Suggestions for development based on the patterns in the reports.'),
});
export type SuggestUrgentNeedsOutput = z.infer<typeof SuggestUrgentNeedsOutputSchema>;

export async function suggestUrgentNeeds(input: SuggestUrgentNeedsInput): Promise<SuggestUrgentNeedsOutput> {
  return suggestUrgentNeedsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestUrgentNeedsPrompt',
  input: {schema: SuggestUrgentNeedsInputSchema},
  output: {schema: SuggestUrgentNeedsOutputSchema},
  prompt: `You are helping an NGO analyze infrastructure reports for a specific zone in an urban settlement. Based on the provided reports, you will summarize the situation, identify the most urgent needs, and suggest development actions.

Zone: {{{zone}}}
Reports:
{{#each reports}}
- Type: {{{type}}}, Severity: {{{severity}}}, Description: {{{description}}}
{{/each}}

Summarize the infrastructure issues in the zone, identify the most urgent needs, and suggest development actions based on the patterns in the reports. Provide a concise summary, a list of urgent needs, and actionable development suggestions.

Output:
Summary: 
Urgent Needs: 
Development Suggestions: `,
});

const suggestUrgentNeedsFlow = ai.defineFlow(
  {
    name: 'suggestUrgentNeedsFlow',
    inputSchema: SuggestUrgentNeedsInputSchema,
    outputSchema: SuggestUrgentNeedsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
