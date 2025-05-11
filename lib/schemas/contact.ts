import * as z from "zod";

export const ContactFormSchema = z.object({
  senderName: z.string().min(1, { message: "Your name is required." }).max(100),
  senderEmail: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(1, { message: "Message cannot be empty." }).max(5000),
  // We might add a honeypot field or captcha later for spam prevention
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>; 