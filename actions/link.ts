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
  UpdateDeliveryOptionSchema,
  type UpdateDeliveryOptionFormValues,
} from "@/lib/schemas/link";
import type { DeliveryType } from "@prisma/client";

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

export async function deleteDeliveryOptionAction(deliveryOptionId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "User not authenticated." };
    }

    if (!deliveryOptionId || typeof deliveryOptionId !== "string") {
      return { success: false, error: "Invalid Delivery Option ID provided." };
    }

    // Verify user owns the link to which this delivery option belongs
    const optionToDelete = await prisma.deliveryOption.findUnique({
      where: { id: deliveryOptionId },
      select: {
        link: {
          select: { userId: true, id: true },
        },
      },
    });

    if (!optionToDelete) {
      return { success: false, error: "Delivery option not found." };
    }

    if (optionToDelete.link.userId !== session.user.id) {
      return {
        success: false,
        error: "User does not have permission to delete this delivery option.",
      };
    }

    // Proceed with deletion
    await prisma.deliveryOption.delete({
      where: { id: deliveryOptionId },
    });

    return { success: true, message: "Delivery option deleted successfully." };
  } catch (error) {
    console.error("Error in deleteDeliveryOptionAction:", error);
    let errorMessage =
      "An unexpected error occurred while deleting the delivery option.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateDeliveryOptionAction(
  payload: UpdateDeliveryOptionFormValues
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "User not authenticated." };
    }

    // Validate input against Zod schema
    const validationResult = UpdateDeliveryOptionSchema.safeParse(payload);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { deliveryOptionId, type, destination, active } =
      validationResult.data;

    // Verify user owns the link to which this delivery option belongs
    const optionToUpdate = await prisma.deliveryOption.findUnique({
      where: { id: deliveryOptionId },
      select: { link: { select: { userId: true } } },
    });

    if (!optionToUpdate) {
      return { success: false, error: "Delivery option not found." };
    }

    if (optionToUpdate.link.userId !== session.user.id) {
      return {
        success: false,
        error: "User does not have permission to update this delivery option.",
      };
    }

    const updatedDeliveryOption = await prisma.deliveryOption.update({
      where: { id: deliveryOptionId },
      data: {
        type: type as DeliveryType,
        destination: destination,
        active: active,
        // webhookSecret is not updated here intentionally
      },
    });

    return {
      success: true,
      message: "Delivery option updated successfully.",
      deliveryOption: updatedDeliveryOption,
    };
  } catch (error) {
    console.error("Error in updateDeliveryOptionAction:", error);
    let errorMessage =
      "An unexpected error occurred while updating the delivery option.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function updateLinkLabelAction(
  linkId: string,
  newLabel: string | null
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "User not authenticated." };
    }

    if (!linkId || typeof linkId !== "string") {
      return { success: false, error: "Invalid Link ID provided." };
    }

    // Validate label (optional, can be empty string or null to clear)
    // Zod schema for this would be: z.string().nullable().optional()
    // For now, direct check:
    if (newLabel !== null && typeof newLabel !== "string") {
      return { success: false, error: "Invalid label provided." };
    }

    const labelToSave = newLabel === "" ? null : newLabel; // Store empty string as null

    // Verify user owns the link
    const linkToUpdate = await prisma.link.findUnique({
      where: { id: linkId },
      select: { userId: true },
    });

    if (!linkToUpdate) {
      return { success: false, error: "Link not found." };
    }

    if (linkToUpdate.userId !== session.user.id) {
      return {
        success: false,
        error: "User does not have permission to update this link's label.",
      };
    }

    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: { label: labelToSave },
    });

    return {
      success: true,
      message: "Link label updated successfully.",
      link: updatedLink,
    };
  } catch (error) {
    console.error("Error in updateLinkLabelAction:", error);
    let errorMessage =
      "An unexpected error occurred while updating the link label.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteLinkAction(linkId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "User not authenticated." };
    }

    if (!linkId || typeof linkId !== "string") {
      return { success: false, error: "Invalid Link ID provided." };
    }

    // Verify user owns the link
    const linkToDelete = await prisma.link.findUnique({
      where: { id: linkId },
      select: { userId: true },
    });

    if (!linkToDelete) {
      return { success: false, error: "Link not found." };
    }

    if (linkToDelete.userId !== session.user.id) {
      return {
        success: false,
        error: "User does not have permission to delete this link.",
      };
    }

    // Proceed with deletion
    // Prisma's cascade delete on the relation should handle associated DeliveryOptions
    await prisma.link.delete({
      where: { id: linkId },
    });

    return { success: true, message: "Link deleted successfully." };
  } catch (error) {
    console.error("Error in deleteLinkAction:", error);
    let errorMessage = "An unexpected error occurred while deleting the link.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
