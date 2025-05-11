import * as z from "zod";

export const CreateLinkSchema = z.object({
  slug: z.string()
    .min(3, { message: "Link slug must be at least 3 characters long." })
    .max(50, { message: "Link slug cannot be more than 50 characters long." })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Link slug can only contain letters, numbers, underscores, and hyphens." }),
  label: z.string().optional(), // Optional internal label for the user
});

export type CreateLinkFormValues = z.infer<typeof CreateLinkSchema>; 