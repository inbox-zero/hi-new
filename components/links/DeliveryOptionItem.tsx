"use client";

import type { DeliveryOption as PrismaDeliveryOption } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteDeliveryOptionAction } from "@/actions/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation"; // For router.refresh()

interface DeliveryOptionItemProps {
  option: PrismaDeliveryOption;
  // onDeleted: () => void; // Callback to refresh data
}

export default function DeliveryOptionItem({ option }: DeliveryOptionItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this delivery option?")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteDeliveryOptionAction(option.id);
      if (result.success) {
        // alert(result.message); // Or use a toast notification
        router.refresh(); // Refresh server component data
      } else {
        alert(`Error: ${result.error}`); // Or use a toast notification
      }
    });
  };

  const handleCopySecret = () => {
    if (option.webhookSecret) {
      navigator.clipboard.writeText(option.webhookSecret);
      // alert("Webhook secret copied to clipboard!"); // Optional: add toast
    }
  };

  return (
    <li className="flex justify-between items-center p-3 border rounded-md bg-background">
      <div>
        <span className={`text-sm font-medium ${option.active ? '' : 'text-muted-foreground line-through'}`}>
          {option.type}: {option.destination}
        </span>
        {option.type === 'WEBHOOK' && option.webhookSecret && 
            <p className="text-xs text-muted-foreground">
              Secret: •••••••••••• 
              <Button variant="link" size="sm" className="h-auto p-0 ml-1" onClick={handleCopySecret}>Copy</Button>
            </p>
        }
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" disabled={isPending} onClick={() => alert('Edit not implemented yet')}>Edit</Button>
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            onClick={handleDelete}
            disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete"}
        </Button>
        <Badge variant={option.active ? "default" : "secondary"}>
            {option.active ? "Active" : "Inactive"}
        </Badge>
      </div>
    </li>
  );
} 