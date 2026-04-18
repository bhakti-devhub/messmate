'use client';

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import type { Feedback } from "@/lib/types";

const feedbackFormSchema = z.object({
  studentName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  meal: z.enum(["Breakfast", "Lunch", "Dinner"], {
    required_error: "You need to select a meal.",
  }),
  rating: z.string({
    required_error: "Please select a rating.",
  }),
  comment: z.string().min(10, {
    message: "Comment must be at least 10 characters.",
  }).max(500, {
    message: "Comment must not be longer than 500 characters."
  }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

type FeedbackFormProps = {
  addFeedback: (feedback: Omit<Feedback, 'id'>) => Promise<void>;
  preselectedMeal?: 'Breakfast' | 'Lunch' | 'Dinner' | null;
};

export default function FeedbackForm({ addFeedback, preselectedMeal }: FeedbackFormProps) {
    const { toast } = useToast();
    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackFormSchema),
        defaultValues: {
            studentName: "Valued Student", // Pre-fill student name
            comment: "",
            meal: preselectedMeal || undefined,
        }
    });

    useEffect(() => {
        if (preselectedMeal) {
            form.setValue('meal', preselectedMeal);
        }
    }, [preselectedMeal, form]);

    async function onSubmit(data: FeedbackFormValues) {
        await addFeedback({
          ...data,
          rating: Number(data.rating),
        });
        toast({
            title: "Feedback Submitted!",
            description: "Thank you for your valuable feedback.",
        });
        form.reset({
            studentName: "Valued Student",
            comment: "",
            meal: undefined,
            rating: undefined
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-center font-headline">Share Your Feedback</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid gap-8 md:grid-cols-2">
                           <FormField
                              control={form.control}
                              name="studentName"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Your Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter your name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="meal"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Which meal are you reviewing?</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                          <FormControl>
                                              <SelectTrigger>
                                                  <SelectValue placeholder="Select a meal" />
                                              </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                              <SelectItem value="Breakfast">Breakfast</SelectItem>
                                              <SelectItem value="Lunch">Lunch</SelectItem>
                                              <SelectItem value="Dinner">Dinner</SelectItem>
                                          </SelectContent>
                                      </Select>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Your Rating</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex flex-wrap items-center pt-2 gap-x-1 sm:gap-x-2"
                                        >
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <FormItem key={rating} className="flex items-center space-x-1 space-y-0">
                                                    <FormControl>
                                                      <RadioGroupItem value={String(rating)} id={`r${rating}`} className="sr-only" />
                                                    </FormControl>
                                                    <FormLabel htmlFor={`r${rating}`}>
                                                        <Star className={`w-8 h-8 cursor-pointer transition-colors ${Number(field.value) >= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50 hover:text-yellow-300'}`} />
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        </div>
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Comments</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us more about your experience..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Your feedback helps us improve our service.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                           {form.formState.isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
