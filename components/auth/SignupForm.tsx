"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCardLayout from "./AuthCardLayout"; // Import the new layout

export default function SignupForm() { // Removed className and ...props
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Signup failed. Please try again.");
      } else {
        window.location.href = "/dashboard"; 
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCardLayout
      title="Create an account"
      description="Enter your details below to create your account"
      footerText="Already have an account?"
      footerLinkText="Login"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </AuthCardLayout>
  );
} 