"use server";

import { auth } from "@/lib/auth"; // Your Better Auth instance
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";
import { CreateLinkSchema, type CreateLinkFormValues } from "@/lib/schemas/link";

const prisma = new PrismaClient();

export async function createLinkAction(values: CreateLinkFormValues) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "User not authenticated." };
    }

    // Validate input against Zod schema (already done client-side, but good practice for server actions)
    const validationResult = CreateLinkSchema.safeParse(values);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.errors.map(e => e.message).join(", ") };
    }

    const { slug, label } = validationResult.data;

    // Check for slug uniqueness (case-insensitive check is often a good idea for slugs)
    const existingLink = await prisma.link.findUnique({
      where: { slug: slug.toLowerCase() }, // Store/check slugs in a consistent case
    });

    if (existingLink) {
      return { success: false, error: "This link slug is already taken. Please choose another." };
    }

    // Create the new link
    const newLink = await prisma.link.create({
      data: {
        slug: slug.toLowerCase(), // Store slug in lowercase
        label: label || null, // Prisma expects null for optional fields if not provided
        userId: session.user.id,
      },
    });

    return { success: true, message: "Link created successfully!", link: newLink };

  } catch (error) {
    console.error("Error in createLinkAction:", error);
    let errorMessage = "An unexpected error occurred while creating the link.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
} 