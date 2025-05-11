import { auth } from "@/lib/auth"; // Your Better Auth instance
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
  Link as PrismaLinkModel,
  DeliveryOption as PrismaDeliveryOptionModel,
} from "@/generated/prisma";

// Define a more specific type for our userLinks array items
// This explicitly defines the shape including the nested deliveryOptions
type UserLinkWithDetails = PrismaLinkModel & {
  deliveryOptions: PrismaDeliveryOptionModel[];
};

async function getUserLinks(userId: string): Promise<UserLinkWithDetails[]> {
  if (!userId) return [];
  const links = await prisma.link.findMany({
    where: { userId },
    include: {
      deliveryOptions: true, // Ensures deliveryOptions are fetched
    },
    orderBy: { createdAt: "desc" },
  });
  // We assert the type here because Prisma's default findMany type might not be specific enough
  // about the included relations for all linters/TS configs without this help.
  return links as UserLinkWithDetails[];
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user || !session.user.id) {
    redirect("/login"); // Redirect to login if not authenticated
  }

  const userLinks = await getUserLinks(session.user.id);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Links</h1>
        <Button asChild>
          <Link href="/dashboard/links/create">Create New Link</Link>
        </Button>
      </div>

      {userLinks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Links Yet!</CardTitle>
            <CardDescription>
              You haven&apos;t created any hi.new links. Get started by creating
              your first one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full md:w-auto">
              <Link href="/dashboard/links/create">Create Your First Link</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {userLinks.map((link: UserLinkWithDetails) => {
            return (
              <Card key={link.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl hover:underline">
                        <Link
                          href={`/${link.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          hi.new/{link.slug}
                        </Link>
                      </CardTitle>
                      {link.label && (
                        <CardDescription className="mt-1">
                          {link.label}
                        </CardDescription>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/links/manage/${link.id}`}>
                        Manage
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {link.deliveryOptions.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Delivery Options:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {link.deliveryOptions.map(
                          (opt: PrismaDeliveryOptionModel) => {
                            return (
                              <Badge
                                key={opt.id}
                                variant={opt.active ? "default" : "secondary"}
                              >
                                {opt.type}: {opt.destination}{" "}
                                {opt.active ? "" : "(Inactive)"}
                              </Badge>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No delivery options configured for this link.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">
                    Created: {new Date(link.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
