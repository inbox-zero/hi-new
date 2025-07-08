import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export interface CreatePaymentLinkParams {
  amount: number; // in cents
  recipientUsername: string;
  messageId: string;
  senderEmail: string;
  senderName?: string;
}

/**
 * Creates a Stripe payment link for a message
 */
export async function createPaymentLink({
  amount,
  recipientUsername,
  messageId,
  senderEmail,
  senderName,
}: CreatePaymentLinkParams) {
  try {
    // Create a price for the payment
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: amount,
      product_data: {
        name: `Message to @${recipientUsername}`,
        description: `Payment to deliver message from ${senderName || senderEmail}`,
      },
    });

    // Create the payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        messageId,
        recipientUsername,
        senderEmail,
        senderName: senderName || "",
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: process.env.STRIPE_PAYMENT_SUCCESS_URL || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        },
      },
      // Payment link expires after 24 hours
      expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    });

    return {
      id: paymentLink.id,
      url: paymentLink.url,
      expiresAt: new Date(paymentLink.expires_at * 1000),
    };
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw new Error("Failed to create payment link");
  }
}

/**
 * Creates or retrieves a Stripe customer for a user
 */
export async function createOrRetrieveCustomer(
  userId: string,
  email: string,
  name?: string
) {
  try {
    // First, try to retrieve existing customer by metadata
    const existingCustomers = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    return customer;
  } catch (error) {
    console.error("Error creating/retrieving customer:", error);
    throw new Error("Failed to create or retrieve customer");
  }
}

/**
 * Verifies a Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    throw new Error("Invalid webhook signature");
  }
}

/**
 * Retrieves a payment link by ID
 */
export async function getPaymentLink(paymentLinkId: string) {
  try {
    const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
    return paymentLink;
  } catch (error) {
    console.error("Error retrieving payment link:", error);
    throw new Error("Failed to retrieve payment link");
  }
}

/**
 * Deactivates a payment link
 */
export async function deactivatePaymentLink(paymentLinkId: string) {
  try {
    const paymentLink = await stripe.paymentLinks.update(paymentLinkId, {
      active: false,
    });
    return paymentLink;
  } catch (error) {
    console.error("Error deactivating payment link:", error);
    throw new Error("Failed to deactivate payment link");
  }
}