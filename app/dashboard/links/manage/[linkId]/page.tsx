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
import { Badge } from "@/components/ui/badge";
import type {
  Link as PrismaLink,
  DeliveryOption as PrismaDeliveryOption,
} from "@/generated/prisma";
import AddDeliveryOptionForm from "@/components/links/AddDeliveryOptionForm";
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
  params: {
    linkId: string;
  };
}

export default async function ManageLinkPage({ params }: ManageLinkPageProps) {
  noStore();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const link = await getLinkDetails(params.linkId, session.user.id);

  if (!link) {
    notFound();
  }

  async function handleDeliveryOptionAdded() {
    "use server";
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
        {link.label && (
          <p className="text-sm text-muted-foreground mt-1">
            Label: {link.label}
          </p>
        )}
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
                <li
                  key={opt.id}
                  className="flex justify-between items-center p-3 border rounded-md"
                >
                  <div>
                    <span
                      className={`text-sm font-medium ${opt.active ? "" : "text-muted-foreground line-through"}`}
                    >
                      {opt.type}: {opt.destination}
                    </span>
                    {opt.type === "WEBHOOK" && opt.webhookSecret && (
                      <p className="text-xs text-muted-foreground">
                        Secret: ••••••••••••{" "}
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => {
                            if (opt.webhookSecret) {
                              navigator.clipboard.writeText(opt.webhookSecret);
                            }
                          }}
                        >
                          Copy
                        </Button>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* TODO: Edit/Delete buttons for delivery options */}
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      Delete
                    </Button>
                    <Badge variant={opt.active ? "default" : "secondary"}>
                      {opt.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Section to Add New Delivery Option (Form will go here) */}
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
            onDeliveryOptionAdded={handleDeliveryOptionAdded}
          />
        </CardContent>
      </Card>
    </div>
  );
}
