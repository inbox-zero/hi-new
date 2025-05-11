import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { type ContactFormValues, ContactFormSchema } from "@/lib/schemas/contact";
import { Resend } from "resend";
import { ipRateLimiter } from "@/lib/ratelimit"; // Import the rate limiter

const resend = new Resend(process.env.RESEND_API_KEY);
// Ensure you have a default "from" email address configured, e.g., from your domain
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || "onboarding@resend.dev"; // Fallback, replace with your verified Resend domain email

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // Apply IP-based rate limiting first
  let ip = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (ip) {
    // x-forwarded-for can be a comma-separated list, take the first one
    ip = ip.split(",")[0].trim();
  } else if (realIp) {
    ip = realIp.trim();
  } else {
    // Fallback for local development or direct connections (less common in production)
    // For Vercel, request.ip would be available in Edge, but x-forwarded-for is standard.
    // If using Node.js runtime on Vercel, x-forwarded-for is the one to check.
    // If you are self-hosting, how you get the IP depends on your reverse proxy setup.
    ip = "127.0.0.1"; // Default if no IP found (should not happen in most prod environments)
  }
  
  const { success: rateLimitSuccess, limit, remaining, reset } = await ipRateLimiter.limit(ip);

  if (!rateLimitSuccess) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Too many requests. Please try again later.", 
        limit, 
        remaining, 
        reset: new Date(reset).toISOString() 
      },
      { 
        status: 429, 
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
      }
    );
  }

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
      // Even if the link exists, if there are no active delivery options, it's like a dead end.
      // You might want to log this or handle it differently.
      console.warn(`No active delivery options for link: ${slug}`);
      return NextResponse.json(
        { success: false, error: "No delivery options configured for this link." },
        { status: 500 } // Or 400 if you consider it a client-side setup issue for the link owner
      );
    }

    const deliveryPromises = [];

    for (const option of link.deliveryOptions) {
      if (option.type === "EMAIL") {
        console.log(`Attempting to send email to: ${option.destination} for link: ${slug}`);
        deliveryPromises.push(
          resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: option.destination,
            subject: `New message via hi.new/${slug} from ${senderName}`,
            replyTo: senderEmail,
            html: `<p><strong>Name:</strong> ${senderName}</p><p><strong>Email:</strong> ${senderEmail}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br>")}</p>`,
          }).then(response => {
            if (response.error) {
              console.error(`Resend error for ${option.destination}:`, response.error);
              return { success: false, type: "EMAIL", destination: option.destination, error: response.error.message };
            }
            console.log(`Email sent successfully to: ${option.destination}`);
            return { success: true, type: "EMAIL", destination: option.destination };
          }).catch(error => {
            console.error(`Failed to send email to ${option.destination}:`, error);
            return { success: false, type: "EMAIL", destination: option.destination, error: error.message };
          })
        );
      } else if (option.type === "WEBHOOK") {
        console.log(`Attempting to send webhook to: ${option.destination} for link: ${slug}`);
        const webhookPayload = {
          senderName,
          senderEmail,
          message,
          source: `hi.new/${slug}`,
          linkId: link.id,
          webhookDestination: option.destination
        };
        deliveryPromises.push(
          fetch(option.destination, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhookPayload),
          })
          .then(async (response) => {
            if (!response.ok) {
              // Try to get error message from webhook response body if possible
              let errorBody = `Webhook failed with status: ${response.status}`;
              try {
                const errJson = await response.json();
                errorBody = errJson.message || errJson.error || JSON.stringify(errJson);
              } catch {
                // ignore if response is not json or parsing fails, errorBody remains as status message
              }
              console.error(`Webhook error for ${option.destination}: ${errorBody}`);
              return { success: false, type: "WEBHOOK", destination: option.destination, error: errorBody };
            }
            console.log(`Webhook sent successfully to: ${option.destination}`);
            return { success: true, type: "WEBHOOK", destination: option.destination };
          })
          .catch(error => {
            console.error(`Failed to send webhook to ${option.destination}:`, error);
            return { success: false, type: "WEBHOOK", destination: option.destination, error: error.message };
          })
        );
      }
    }

    if (deliveryPromises.length === 0) {
      // This case means no EMAIL options were found and processed
      return NextResponse.json(
          { success: false, error: "No email delivery options were processed for this link." },
          { status: 400 } 
      );
    }

    const results = await Promise.allSettled(deliveryPromises);
    const successfullySent = results.some(r => r.status === 'fulfilled' && r.value && r.value.success);

    if (successfullySent) {
      return NextResponse.json(
        { success: true, message: "Message processed. Some deliveries may have succeeded." },
        { status: 200 }
      );
    }
    // If !successfullySent (i.e., all attempted email deliveries failed or only non-email types were present and not processed)
    return NextResponse.json(
      { success: false, error: "Failed to deliver message to configured email destinations." },
      { status: 500 }
    );

  } catch (error) {
    console.error(`Error processing POST request for slug ${slug}:`, error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) { errorMessage = error.message; }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 