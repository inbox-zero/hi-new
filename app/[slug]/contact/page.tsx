import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ContactForm from "@/components/contact/ContactForm"; // Import the actual form
// We will create this ContactForm component next
// import ContactForm from "@/components/contact/ContactForm";

interface LinkPageProps {
  params: {
    slug: string;
  };
}

async function getLinkData(slug: string) {
  const link = await prisma.link.findUnique({
    where: { slug: slug.toLowerCase() },
    // Later, we might want to include deliveryOptions here if needed by the form directly
    // include: { deliveryOptions: true }
  });
  return link;
}

export default async function LinkPage({ params }: LinkPageProps) {
  const { slug } = params;
  const link = await getLinkData(slug);

  if (!link) {
    notFound(); // Triggers Next.js 404 page
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-4 pt-10 md:pt-20">
      <div className="w-full max-w-xl rounded-lg border bg-card text-card-foreground shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-semibold leading-none tracking-tight mb-2">
          Contact via: {link.label || slug}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          You are sending a message to <strong>hi.new/{link.slug}</strong>.
        </p>

        <ContactForm linkId={link.id} linkSlug={link.slug} />

        {/* Placeholder for the form component */}
        <div className="p-6 border rounded-md bg-gray-50">
          <p className="text-center text-gray-500">
            Contact form will be here.
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            Link ID: {link.id}
          </p>
        </div>

        {/* We can add more details or branding later */}
      </div>
    </div>
  );
}

// Optional: Generate static params for known slugs if you have a small, fixed set of important links.
// export async function generateStaticParams() {
//   const links = await prisma.link.findMany({ select: { slug: true } });
//   return links.map((link) => ({ slug: link.slug }));
// }
