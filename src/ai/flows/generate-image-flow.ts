'use server';
/**
 * @fileOverview An AI flow to generate an image for a meal.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  mealName: z.string().describe("The name of the meal (e.g., 'Breakfast', 'Lunch')."),
  items: z.array(z.string()).describe('A list of food items included in the meal.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a photorealistic image of a complete meal for a college mess hall. The meal is ${input.mealName} and it includes the following items: ${input.items.join(', ')}. The food should look appealing and be presented neatly on a standard-issue mess hall tray. The style should be vibrant and well-lit.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
        throw new Error("Image generation failed to produce a valid URL.");
    }

    return {imageUrl: media.url};
  }
);
