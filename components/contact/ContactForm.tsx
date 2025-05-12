"use client";

import { useState } from "react";
import {
  useForm,
  type ControllerRenderProps,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ContactFormSchema,
  type ContactFormValues,
} from "@/lib/schemas/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // ShadCN Textarea
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ContactFormProps {
  linkId: string;
  linkSlug: string; // Will be used for the POST request URL
}

export default function ContactForm({ linkId, linkSlug }: ContactFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      senderName: "",
      senderEmail: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setServerError(null);
    setServerMessage(null);
    setIsLoading(true);

    try {
      // POST to the current slug\'s path, to be handled by app/[slug]/route.ts
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/${linkSlug}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            linkId, // Include linkId if your POST handler needs it
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setServerMessage(result.message || "Message sent successfully!");
        form.reset();
      } else {
        setServerError(result.error || "Failed to send message.");
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

  // Add this error handler function
  const onError = (errors: FieldErrors<ContactFormValues>) => {
    console.error("Form validation failed:", errors);
    // Optionally, you could set a general error state here too
    // setServerError("Please check the form for errors.");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="senderName"
          render={({
            field,
          }: {
            field: ControllerRenderProps<ContactFormValues, "senderName">;
          }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your Name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senderEmail"
          render={({
            field,
          }: {
            field: ControllerRenderProps<ContactFormValues, "senderEmail">;
          }) => (
            <FormItem>
              <FormLabel>Your Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({
            field,
          }: {
            field: ControllerRenderProps<ContactFormValues, "message">;
          }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your message..."
                  rows={5}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm font-medium text-destructive text-center">
            {serverError}
          </p>
        )}
        {serverMessage && (
          <p className="text-sm font-medium text-emerald-600 text-center">
            {serverMessage}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Form>
  );
}
