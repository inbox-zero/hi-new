import { NextRequest, NextResponse } from "next/server";
import { createPaymentLink } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientUsername, senderEmail, senderName, message, amount } = body;

    // Validate required fields
    if (!recipientUsername || !senderEmail || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a temporary message ID for testing
    const messageId = `test_msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create the payment link
    const paymentLink = await createPaymentLink({
      amount: amount || 500, // Default to $5.00
      recipientUsername,
      messageId,
      senderEmail,
      senderName,
    });

    // In a real implementation, we would:
    // 1. Store the message in the database with PENDING_PAYMENT status
    // 2. Store the payment link details
    // 3. Send an auto-response email with the payment link

    return NextResponse.json({
      success: true,
      paymentUrl: paymentLink.url,
      paymentLinkId: paymentLink.id,
      expiresAt: paymentLink.expiresAt,
      messageId,
    });
  } catch (error) {
    console.error("Error in test-stripe endpoint:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment link" },
      { status: 500 }
    );
  }
}