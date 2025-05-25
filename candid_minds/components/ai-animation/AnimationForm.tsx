"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(10, "Please enter a more detailed description (at least 10 characters)")
});

type AnimationFormProps = {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
};

export function AnimationForm({ onSubmit, isLoading }: AnimationFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values.prompt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Visualization Generator</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What would you like to visualize?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., Visualize the binary search algorithm with step-by-step animation showing how it finds an element in a sorted array"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Generating...
                </>
              ) : (
                "Generate Animation"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}