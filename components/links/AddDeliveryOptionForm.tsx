"use client";

import { useState } from "react";
import { useForm, type ControllerRenderProps, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddDeliveryOptionSchema,
  type AddDeliveryOptionFormValues,
  DeliveryOptionTypeEnum,
} from "@/lib/schemas/link";
import { addDeliveryOptionAction } from "@/actions/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // ShadCN RadioGroup
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AddDeliveryOptionFormProps {
  linkId: string;
  onDeliveryOptionAdded: () => void; // Callback to refresh the list or give feedback
}

export default function AddDeliveryOptionForm({
  linkId,
  onDeliveryOptionAdded,
}: AddDeliveryOptionFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddDeliveryOptionFormValues>({
    resolver: zodResolver(AddDeliveryOptionSchema),
    defaultValues: {
      linkId: linkId,
      type: DeliveryOptionTypeEnum.Enum.EMAIL, // Default to EMAIL
      destination: "",
      active: true, // Zod schema has .default(true), so this matches the output type
    },
  });

  const onSubmit: SubmitHandler<AddDeliveryOptionFormValues> = async (values) => {
    setServerError(null);
    setServerMessage(null);
    setNewWebhookSecret(null);
    setIsLoading(true);

    try {
      const result = await addDeliveryOptionAction(values);
      if (result.success) {
        setServerMessage(
          result.message || "Delivery option added successfully!"
        );
        if (result.newWebhookSecret) {
          setNewWebhookSecret(result.newWebhookSecret);
        }
        form.reset({
          linkId: linkId, // Keep linkId
          type: DeliveryOptionTypeEnum.Enum.EMAIL, // Reset type to default
          destination: "", // Clear destination
          active: true, // Reset active to default
        });
        onDeliveryOptionAdded(); // Call callback
      } else {
        setServerError(result.error || "Failed to add delivery option.");
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({
            field,
          }: {
            field: ControllerRenderProps<AddDeliveryOptionFormValues, "type">;
          }) => (
            <FormItem className="space-y-3">
              <FormLabel>Delivery Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem
                        value={DeliveryOptionTypeEnum.Enum.EMAIL}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Email</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem
                        value={DeliveryOptionTypeEnum.Enum.WEBHOOK}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Webhook</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destination"
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              AddDeliveryOptionFormValues,
              "destination"
            >;
          }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    form.watch("type") === DeliveryOptionTypeEnum.Enum.EMAIL
                      ? "your.email@example.com"
                      : "https://your-webhook-url.com"
                  }
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Optional: Field for 'active' status if you want users to set it on creation */}
        {/* <FormField ... name="active" ... /> */}

        {serverError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        {serverMessage && !newWebhookSecret && (
          <Alert variant="default">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{serverMessage}</AlertDescription>
          </Alert>
        )}
        {newWebhookSecret && (
          <Alert variant="default">
            <AlertTitle className="text-green-700">Webhook Added - IMPORTANT!</AlertTitle>
            <AlertDescription>
              Your webhook has been added. Here is your unique secret key.
              <strong>Copy it now, as it will not be shown again:</strong>
              <Input
                readOnly
                value={newWebhookSecret}
                className="mt-2 font-mono bg-green-50 border-green-200"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  if (newWebhookSecret) { // Guard against null, though state should ensure it exists here
                    navigator.clipboard.writeText(newWebhookSecret);
                  }
                }}
              >
                Copy Secret
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Delivery Option"}
        </Button>
      </form>
    </Form>
  );
}
