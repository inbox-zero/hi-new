"use server";

import { auth } from "@/lib/auth"; // Your Better Auth instance
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import {
  CreateLinkSchema,
  type CreateLinkFormValues,
} from "@/lib/schemas/link";
import crypto from "node:crypto"; // For generating webhook secrets. Used node: protocol.
import {
  AddDeliveryOptionSchema,
  type AddDeliveryOptionFormValues,
} from "@/lib/schemas/link";
import type { DeliveryType } from "@/generated/prisma"; // Import DeliveryType enum if needed for casting

export async function createLinkAction(values: CreateLinkFormValues) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "User not authenticated." };
    }

    // Validate input against Zod schema (already done client-side, but good practice for server actions)
    const validationResult = CreateLinkSchema.safeParse(values);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { slug, label } = validationResult.data;

    // Check for slug uniqueness (case-insensitive check is often a good idea for slugs)
    const existingLink = await prisma.link.findUnique({
      where: { slug: slug.toLowerCase() }, // Store/check slugs in a consistent case
    });

    if (existingLink) {
      return {
        success: false,
        error: "This link slug is already taken. Please choose another.",
      };
    }

    // Create the new link
    const newLink = await prisma.link.create({
      data: {
        slug: slug.toLowerCase(), // Store slug in lowercase
        label: label || null, // Prisma expects null for optional fields if not provided
        userId: session.user.id,
      },
    });

    return {
      success: true,
      message: "Link created successfully!",
      link: newLink,
    };
  } catch (error) {
    console.error("Error in createLinkAction:", error);
    let errorMessage = "An unexpected error occurred while creating the link.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function addDeliveryOptionAction(
  values: AddDeliveryOptionFormValues
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "User not authenticated." };
    }

    // Validate input against Zod schema
    const validationResult = AddDeliveryOptionSchema.safeParse(values);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { linkId, type, destination, active } = validationResult.data;

    // Verify user owns the link
    const linkOwnerCheck = await prisma.link.findFirst({
      where: {
        id: linkId,
        userId: session.user.id,
      },
    });

    if (!linkOwnerCheck) {
      return {
        success: false,
        error: "Link not found or user does not have permission.",
      };
    }

    let webhookSecret: string | null = null;
    if (type === "WEBHOOK") {
      webhookSecret = crypto.randomBytes(16).toString("hex");
    }

    const newDeliveryOption = await prisma.deliveryOption.create({
      data: {
        linkId: linkId,
        type: type as DeliveryType, // Cast type to Prisma enum if Zod enum matches
        destination: destination,
        active: active,
        webhookSecret: webhookSecret, // Will be null if not a webhook
      },
    });

    return {
      success: true,
      message: "Delivery option added successfully!",
      deliveryOption: newDeliveryOption,
      // Return the secret ONLY if it was just generated for a webhook, so it can be shown once.
      newWebhookSecret: type === "WEBHOOK" ? webhookSecret : null,
    };
  } catch (error) {
    console.error("Error in addDeliveryOptionAction:", error);
    let errorMessage =
      "An unexpected error occurred while adding the delivery option.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
