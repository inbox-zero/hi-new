import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyWebhookSignature, stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = verifyWebhookSignature(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "payment_link.created": {
        const paymentLink = event.data.object as Stripe.PaymentLink;
        console.log("Payment link created:", paymentLink.id);
        break;
      }

      case "payment_link.updated": {
        const paymentLink = event.data.object as Stripe.PaymentLink;
        console.log("Payment link updated:", paymentLink.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Extract metadata from the session
  const { messageId, recipientUsername, senderEmail, senderName } = session.metadata || {};

  if (!messageId) {
    console.error("No messageId in session metadata");
    return;
  }

  try {
    // TODO: Update the payment link status in database
    // This requires the database schema to be updated first (Task 100)
    
    // For now, log the successful payment
    console.log("Payment completed for message:", {
      messageId,
      recipientUsername,
      senderEmail,
      senderName,
      amountPaid: session.amount_total,
      currency: session.currency,
    });

    // TODO: Trigger message delivery to recipient
    // This will be implemented after the database schema is updated
    
    // TODO: Send confirmation email to sender
    // This will use the existing Resend integration

  } catch (error) {
    console.error("Error handling checkout session completion:", error);
    throw error;
  }
}