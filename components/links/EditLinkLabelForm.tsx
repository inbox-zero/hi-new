"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateLinkLabelAction } from "@/actions/link";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react"; // Changed to lucide-react icons

interface EditLinkLabelFormProps {
  linkId: string;
  initialLabel: string | null;
}

export default function EditLinkLabelForm({ linkId, initialLabel }: EditLinkLabelFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(initialLabel || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateLinkLabelAction(linkId, label.trim() === "" ? null : label.trim());
      if (result.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert(`Error: ${result.error}`); // Replace with better error display if desired
      }
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 mt-1">
        <Input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter a label (optional)"
          className="h-8 text-sm"
          disabled={isPending}
        />
        <Button size="sm" onClick={handleSave} disabled={isPending} variant="ghost">
          <Check className="h-4 w-4" /> {/* Lucide Check icon */}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setLabel(initialLabel || ""); }} disabled={isPending}>
          <X className="h-4 w-4" /> {/* Lucide X icon */}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 mt-1">
      <span className="text-sm text-muted-foreground">
        Label: {initialLabel || "(No label)"}
      </span>
      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} title="Edit label">
        <Pencil className="h-3 w-3" /> {/* Lucide Pencil icon */}
      </Button>
    </div>
  );
} 