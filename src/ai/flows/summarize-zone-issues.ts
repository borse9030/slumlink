'use server';

/**
 * @fileOverview A flow that summarizes infrastructure issues for a given zone using AI.
 *
 * - summarizeZoneIssues - A function that takes a zone ID and a list of reports, and returns a summary of the issues.
 * - SummarizeZoneIssuesInput - The input type for the summarizeZoneIssues function.
 * - SummarizeZoneIssuesOutput - The return type for the summarizeZoneIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeZoneIssuesInputSchema = z.object({
  zone: z.string().describe('The zone to summarize issues for, for example, `Dharavi-Mumbai`.'),
  reports: z.string().describe('A list of reports for the zone, for example, `5 for water, 3 for toilets, 2 for schools`.'),
});

export type SummarizeZoneIssuesInput = z.infer<typeof SummarizeZoneIssuesInputSchema>;

const SummarizeZoneIssuesOutputSchema = z.object({
  summary: z.string().describe('A summary of the infrastructure issues in the zone.'),
  recommendation: z.string().describe('A recommendation for what to do based on the issues.'),
});

export type SummarizeZoneIssuesOutput = z.infer<typeof SummarizeZoneIssuesOutputSchema>;

export async function summarizeZoneIssues(input: SummarizeZoneIssuesInput): Promise<SummarizeZoneIssuesOutput> {
  return summarizeZoneIssuesFlow(input);
}

const summarizeZoneIssuesPrompt = ai.definePrompt({
  name: 'summarizeZoneIssuesPrompt',
  input: {schema: SummarizeZoneIssuesInputSchema},
  output: {schema: SummarizeZoneIssuesOutputSchema},
  prompt: `You are helping an NGO analyze reports about infrastructure issues in urban settlements. Given the following information about a specific zone, please provide a concise summary of the situation and a recommendation for addressing the most urgent needs. The summary should be no more than 100 words.

- Zone: {{{zone}}}
- Reports: {{{reports}}}
`,
});

const summarizeZoneIssuesFlow = ai.defineFlow(
  {
    name: 'summarizeZoneIssuesFlow',
    inputSchema: SummarizeZoneIssuesInputSchema,
    outputSchema: SummarizeZoneIssuesOutputSchema,
  },
  async input => {
    const {output} = await summarizeZoneIssuesPrompt(input);
    return output!;
  }
);
