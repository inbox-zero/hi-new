"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteLinkAction } from "@/actions/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface DeleteLinkButtonProps {
  linkId: string;
  linkSlug: string;
}

export default function DeleteLinkButton({ linkId, linkSlug }: DeleteLinkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDeleteLink = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete the link \"hi.new/${linkSlug}\"? This action cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteLinkAction(linkId);
      if (result.success) {
        alert("Link deleted successfully!"); // Replace with toast later
        router.push("/dashboard"); // Redirect to dashboard
        router.refresh(); // Refresh dashboard data
      } else {
        alert(`Error: ${result.error}`); // Replace with toast later
      }
    });
  };

  return (
    <Card className="border-destructive mt-8">
        <CardHeader className="flex flex-row items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive"/>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription className="mb-4">
                Deleting this link will permanently remove it and all its associated delivery options. This action cannot be undone.
            </CardDescription>
            <Button 
                variant="destructive" 
                onClick={handleDeleteLink} 
                disabled={isPending}
                className="w-full md:w-auto"
            >
                {isPending ? "Deleting Link..." : `Delete Link hi.new/${linkSlug}`}
            </Button>
        </CardContent>
    </Card>
  );
} 