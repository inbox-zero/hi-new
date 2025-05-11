import * as z from "zod";

export const CreateLinkSchema = z.object({
  slug: z.string()
    .min(3, { message: "Link slug must be at least 3 characters long." })
    .max(50, { message: "Link slug cannot be more than 50 characters long." })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Link slug can only contain letters, numbers, underscores, and hyphens." }),
  label: z.string().optional(), // Optional internal label for the user
});

export type CreateLinkFormValues = z.infer<typeof CreateLinkSchema>;

export const DeliveryOptionTypeEnum = z.enum(["EMAIL", "WEBHOOK"], {
  required_error: "Delivery type is required.",
  invalid_type_error: "Invalid delivery type. Must be EMAIL or WEBHOOK."
});

export const AddDeliveryOptionSchema = z.object({
  linkId: z.string().cuid({ message: "Invalid Link ID." }),
  type: DeliveryOptionTypeEnum,
  destination: z.string().min(1, { message: "Destination is required." }),
  active: z.boolean(),
});

export type AddDeliveryOptionFormValues = z.infer<typeof AddDeliveryOptionSchema>;

// Schema for updating a delivery option
export const UpdateDeliveryOptionSchema = z.object({
  deliveryOptionId: z.string().cuid({ message: "Invalid Delivery Option ID." }),
  type: DeliveryOptionTypeEnum, 
  destination: z.string().min(1, { message: "Destination is required." }),
  active: z.boolean(),
});
export type UpdateDeliveryOptionFormValues = z.infer<typeof UpdateDeliveryOptionSchema>;

// We can refine validation for destination based on type if needed (e.g., email format for EMAIL, URL for WEBHOOK)
// For example, using a superRefine or discriminated union:
// export const AddDeliveryOptionSchema = z.discriminatedUnion("type", [
//   z.object({
//     type: z.literal(DeliveryOptionTypeEnum.Enum.EMAIL),
//     linkId: z.string().cuid(),
//     destination: z.string().email({ message: "Invalid email address for EMAIL type." }),
//     active: z.boolean().optional().default(true),
//   }),
//   z.object({
//     type: z.literal(DeliveryOptionTypeEnum.Enum.WEBHOOK),
//     linkId: z.string().cuid(),
//     destination: z.string().url({ message: "Invalid URL for WEBHOOK type." }),
//     active: z.boolean().optional().default(true),
//   }),
// ]); 