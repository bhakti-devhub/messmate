// Summarizes student feedback on meals using AI, highlighting key areas for improvement and positive aspects.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FeedbackEntrySchema = z.object({
  rating: z.number().describe('The rating given by the student (1-5).'),
  comment: z.string().describe('The comment provided by the student.'),
});

const SummarizeFeedbackInputSchema = z.object({
  feedback: z.array(FeedbackEntrySchema).describe('An array of feedback entries for a specific meal.'),
  mealName: z.string().describe('Name of the meal feedback is about')
});

export type SummarizeFeedbackInput = z.infer<typeof SummarizeFeedbackInputSchema>;

const SummarizeFeedbackOutputSchema = z.object({
  summary: z.string().describe('A summary of the feedback, including key areas for improvement and positive aspects.'),
  averageRating: z.number().describe('The average rating for the meal (1-5).'),
  negativeComments: z.array(z.string()).describe('List of negative comments about the meal.'),
  improvementSuggestions: z.string().describe('Suggestions for improving the meal based on the feedback.'),
});

export type SummarizeFeedbackOutput = z.infer<typeof SummarizeFeedbackOutputSchema>;

export async function summarizeFeedback(input: SummarizeFeedbackInput): Promise<SummarizeFeedbackOutput> {
  return summarizeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFeedbackPrompt',
  input: {schema: SummarizeFeedbackInputSchema},
  output: {schema: SummarizeFeedbackOutputSchema},
  prompt: `You are a mess hall manager, and need to understand feedback about {{mealName}}.

  Analyze the following student feedback to provide a concise summary, highlight areas for improvement, and note any positive aspects. Also identify negative comments, calculate the average rating, and suggest improvements.

  Feedback:
  {{#each feedback}}
  - Rating: {{this.rating}}, Comment: {{this.comment}}
  {{/each}}

  Ensure that the summary includes the average rating, a list of negative comments, and clear suggestions for improvement.
  Follow this format:
  Summary: <summary>
  Average Rating: <average_rating>
  Negative Comments: <negative_comments>
  Improvement Suggestions: <improvement_suggestions>
  `,
});

const summarizeFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackFlow',
    inputSchema: SummarizeFeedbackInputSchema,
    outputSchema: SummarizeFeedbackOutputSchema,
  },
  async input => {
    // Calculate average rating
    const totalRating = input.feedback.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = input.feedback.length > 0 ? totalRating / input.feedback.length : 0;

    const {output} = await prompt(input);

    //console.log("Raw LLM Output:", output);

    return {
      ...output!,
      averageRating: averageRating,
    };
  }
);
