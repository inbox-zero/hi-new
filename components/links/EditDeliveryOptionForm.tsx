"use client";

import { useState } from "react";
import { useForm, type ControllerRenderProps, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DeliveryOption as PrismaDeliveryOption } from "@/generated/prisma";
import {
  UpdateDeliveryOptionSchema,
  type UpdateDeliveryOptionFormValues,
  DeliveryOptionTypeEnum
} from "@/lib/schemas/link";
import { updateDeliveryOptionAction } from "@/actions/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch"; // For active toggle
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EditDeliveryOptionFormProps {
  option: PrismaDeliveryOption;
  onSaved: () => void; // Callback after successful save
  onCancel: () => void; // Callback to cancel editing
}

export default function EditDeliveryOptionForm({
  option,
  onSaved,
  onCancel,
}: EditDeliveryOptionFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateDeliveryOptionFormValues>({
    resolver: zodResolver(UpdateDeliveryOptionSchema),
    defaultValues: {
      deliveryOptionId: option.id,
      type: option.type as UpdateDeliveryOptionFormValues['type'], // Cast if Prisma enum matches Zod enum values
      destination: option.destination,
      active: option.active,
    },
  });

  const onSubmit: SubmitHandler<UpdateDeliveryOptionFormValues> = async (values) => {
    setServerError(null);
    setIsLoading(true);
    try {
      const result = await updateDeliveryOptionAction(values);
      if (result.success) {
        onSaved();
      } else {
        setServerError(result.error || "Failed to update delivery option.");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        <FormField
          control={form.control}
          name="type"
          render={({ field }: { field: ControllerRenderProps<UpdateDeliveryOptionFormValues, "type">}) => (
            <FormItem className="space-y-2">
              <FormLabel>Delivery Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl><RadioGroupItem value={DeliveryOptionTypeEnum.Enum.EMAIL} /></FormControl>
                    <FormLabel className="font-normal">Email</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl><RadioGroupItem value={DeliveryOptionTypeEnum.Enum.WEBHOOK} /></FormControl>
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
          render={({ field }: { field: ControllerRenderProps<UpdateDeliveryOptionFormValues, "destination">}) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Input 
                  placeholder={form.watch("type") === DeliveryOptionTypeEnum.Enum.EMAIL ? "your.email@example.com" : "https://your-webhook-url.com"} 
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
          name="active"
          render={({ field }: { field: ControllerRenderProps<UpdateDeliveryOptionFormValues, "active">}) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription className="text-xs">
                  Receive messages with this delivery option.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {serverError && (
          <Alert variant="destructive" className="mt-2">
            <AlertTitle>Update Failed</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 