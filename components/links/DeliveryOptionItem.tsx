"use client";

import type { DeliveryOption as PrismaDeliveryOption } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteDeliveryOptionAction } from "@/actions/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import EditDeliveryOptionForm from "./EditDeliveryOptionForm"; // Import the edit form

interface DeliveryOptionItemProps {
  option: PrismaDeliveryOption;
}

export default function DeliveryOptionItem({ option }: DeliveryOptionItemProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  // isUpdating transition is now managed within EditDeliveryOptionForm
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this delivery option?")) {
      return;
    }
    startDeleteTransition(async () => {
      const result = await deleteDeliveryOptionAction(option.id);
      if (result.success) {
        router.refresh(); 
      } else {
        alert(`Error: ${result.error}`); 
      }
    });
  };

  const handleCopySecret = () => {
    if (option.webhookSecret) {
      navigator.clipboard.writeText(option.webhookSecret);
    }
  };
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveEdit = () => {
    setIsEditing(false); // Close edit form
    router.refresh();    // Refresh data to show updates
  };

  if (isEditing) {
    return (
      <li className="p-3 border rounded-md bg-background">
        <EditDeliveryOptionForm 
          option={option} 
          onSaved={handleSaveEdit} 
          onCancel={handleToggleEdit} 
        />
      </li>
    );
  }

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
        <Button variant="ghost" size="sm" disabled={isDeleting} onClick={handleToggleEdit}>
          Edit
        </Button>
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
        <Badge variant={option.active ? "default" : "secondary"}>
            {option.active ? "Active" : "Inactive"}
        </Badge>
      </div>
    </li>
  );
} 