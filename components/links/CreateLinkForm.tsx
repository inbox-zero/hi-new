"use client";

import { useState } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateLinkSchema, type CreateLinkFormValues } from "@/lib/schemas/link";
import { createLinkAction } from "@/actions/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CreateLinkForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateLinkFormValues>({
    resolver: zodResolver(CreateLinkSchema),
    defaultValues: {
      slug: "",
      label: "",
    },
  });

  const onSubmit = async (values: CreateLinkFormValues) => {
    setServerError(null);
    setServerMessage(null);
    setIsLoading(true);

    try {
      const result = await createLinkAction(values);
      if (result.success) {
        setServerMessage(result.message || "Link created successfully!");
        form.reset(); // Reset form on successful creation
        // Optionally, redirect or trigger a refresh of a link list
      } else {
        setServerError(result.error || "Failed to create link.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message || "An unexpected error occurred.");
      } else {
        setServerError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create a new Link</CardTitle>
        <CardDescription>Choose a unique slug for your public link (e.g., hi.new/your-slug).</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }: { field: ControllerRenderProps<CreateLinkFormValues, "slug"> }) => (
                <FormItem>
                  <FormLabel>Link Slug</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground p-2 rounded-l-md bg-gray-100 border border-r-0 border-gray-300">hi.new/</span>
                        <Input placeholder="your-unique-slug" {...field} disabled={isLoading} className="rounded-l-none"/>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }: { field: ControllerRenderProps<CreateLinkFormValues, "label"> }) => (
                <FormItem>
                  <FormLabel>Label (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Personal Contact, Project Feedback" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {serverError && (
              <p className="text-sm text-red-600 text-center">{serverError}</p>
            )}
            {serverMessage && (
              <p className="text-sm text-green-600 text-center">{serverMessage}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Link..." : "Create Link"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 