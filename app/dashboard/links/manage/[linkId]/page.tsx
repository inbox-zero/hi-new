import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Link as PrismaLink,
  DeliveryOption as PrismaDeliveryOption,
} from "@prisma/client";
import AddDeliveryOptionForm from "@/components/links/AddDeliveryOptionForm";
import DeliveryOptionItem from "@/components/links/DeliveryOptionItem";
import EditLinkLabelForm from "@/components/links/EditLinkLabelForm";
import DeleteLinkButton from "@/components/links/DeleteLinkButton";
import { unstable_noStore as noStore } from "next/cache";

// Helper type for Link with its delivery options
type LinkWithDetails = PrismaLink & {
  deliveryOptions: PrismaDeliveryOption[];
};

async function getLinkDetails(
  linkId: string,
  userId: string
): Promise<LinkWithDetails | null> {
  if (!linkId || !userId) return null;
  return prisma.link.findUnique({
    where: { id: linkId, userId: userId }, // Ensure user owns the link
    include: {
      deliveryOptions: { orderBy: { createdAt: "asc" } },
    },
  }) as Promise<LinkWithDetails | null>;
}

interface ManageLinkPageProps {
  params: Promise<{
    linkId: string;
  }>;
}

export default async function ManageLinkPage({ params }: ManageLinkPageProps) {
  noStore();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const { linkId } = await params;
  const link = await getLinkDetails(linkId, session.user.id);

  if (!link) {
    notFound();
  }

  async function handleDataChange() {
    "use server";
    // Currently, noStore() + client-side router.refresh() handles updates.
    // This server action stub remains if we need server-side revalidation logic later.
    // For example: revalidatePath(`/dashboard/links/manage/${params.linkId}`);
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/dashboard">← Back to Links</Link>
        </Button>
        <h1 className="text-3xl font-bold">Manage Link</h1>
        <p className="text-lg text-muted-foreground">
          <Link
            href={`/${link.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            hi.new/{link.slug}
          </Link>
        </p>
        <EditLinkLabelForm linkId={link.id} initialLabel={link.label} />
      </div>

      {/* Section to Display Existing Delivery Options */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Delivery Options</CardTitle>
          <CardDescription>
            These are the current destinations for messages sent to this link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {link.deliveryOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No delivery options configured yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {link.deliveryOptions.map((opt) => (
                <DeliveryOptionItem key={opt.id} option={opt} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Section to Add New Delivery Option */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Delivery Option</CardTitle>
          <CardDescription>
            Send messages to a new email address or webhook URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddDeliveryOptionForm
            linkId={link.id}
            onDeliveryOptionAdded={handleDataChange}
          />
        </CardContent>
      </Card>

      {/* Section to Delete Link */}
      <DeleteLinkButton linkId={link.id} linkSlug={link.slug} />
    </div>
  );
}
