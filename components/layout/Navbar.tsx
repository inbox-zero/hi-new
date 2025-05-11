import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Your Better Auth server-side instance
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/LogoutButton"; // Client Component
import { LogIn, UserPlus, LayoutDashboard, Link2 } from "lucide-react";

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 text-lg font-semibold">
            <Link2 className="h-6 w-6" />
            <span>hi.new</span>
          </Link>

          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-0 md:mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 