"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client"; // Your Better Auth client instance
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = async () => {
    startTransition(async () => {
      try {
        // Call Better Auth's client-side signOut method
        // This typically makes a request to your /api/auth/logout endpoint
        const result = await authClient.signOut(); 

        if (result?.error) {
          // Handle error if signOut returns an error object (depends on better-auth client API)
          console.error("Logout failed:", result.error);
          alert(`Logout failed: ${result.error.message || "Unknown error"}`);
        } else {
          // Logout successful
          router.push("/login"); // Redirect to login page
          router.refresh(); // Ensure page reflects logout state
        }
      } catch (error) {
        console.error("Logout error:", error);
        alert("An unexpected error occurred during logout.");
      }
    });
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isPending}>
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
} 