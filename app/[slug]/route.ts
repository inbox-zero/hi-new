import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactFormSchema, type ContactFormValues } from "@/lib/schemas/contact";
// We will need Resend or another email provider later
// import { Resend } from \"resend\";
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const body = await request.json();
    
    // Validate incoming data
    const validationResult = ContactFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input.", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    const { senderName, senderEmail, message }: ContactFormValues = validationResult.data;

    // Fetch the link and its delivery options
    const link = await prisma.link.findUnique({
      where: { slug: slug.toLowerCase() },
      include: { deliveryOptions: { where: { active: true } } }, // Only fetch active delivery options
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: "Link not found." },
        { status: 404 }
      );
    }

    if (!link.deliveryOptions || link.deliveryOptions.length === 0) {
      // Even if the link exists, if there are no active delivery options, it\'s like a dead end.
      // You might want to log this or handle it differently.
      console.warn(`No active delivery options for link: ${slug}`);
      return NextResponse.json(
        { success: false, error: "No delivery options configured for this link." },
        { status: 500 } // Or 400 if you consider it a client-side setup issue for the link owner
      );
    }

    // TODO: Implement message processing and delivery to each option
    // For each deliveryOption in link.deliveryOptions:
    //   - If type is EMAIL, send email via Resend
    //   - If type is WEBHOOK, POST to destination URL
    //   - Implement queuing and retries for reliability (advanced)

    console.log(`Message received for link ${slug}:`, { senderName, senderEmail, message, deliveryOptions: link.deliveryOptions });

    // For now, just return success
    return NextResponse.json(
      { success: true, message: "Message received. Processing will begin shortly." },
      { status: 200 }
    );

  } catch (error) {
    console.error(`Error processing POST request for slug ${slug}:`, error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 