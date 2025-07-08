"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPaymentLink(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      recipientUsername: formData.get("recipientUsername") as string,
      senderEmail: formData.get("senderEmail") as string,
      senderName: formData.get("senderName") as string,
      message: formData.get("message") as string,
      amount: parseInt(formData.get("amount") as string) || 500, // Default $5.00
    };

    try {
      const response = await fetch("/api/test-stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create payment link");
      }

      setPaymentLink(result.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Stripe Payment Link Generation</CardTitle>
            <CardDescription>
              This page demonstrates the Stripe payment link generation for the paid email proxy service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="recipientUsername">Recipient Username</Label>
                <Input
                  id="recipientUsername"
                  name="recipientUsername"
                  placeholder="johndoe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="senderEmail">Sender Email</Label>
                <Input
                  id="senderEmail"
                  name="senderEmail"
                  type="email"
                  placeholder="sender@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  name="senderName"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Your message here..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (in cents)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="500"
                  defaultValue="500"
                  min="50"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Default is $5.00 (500 cents)</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating Payment Link..." : "Generate Payment Link"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Error: {error}</p>
              </div>
            )}

            {paymentLink && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 font-medium mb-2">Payment link created successfully!</p>
                <p className="text-sm text-gray-700 mb-3">Click the link below to test the payment flow:</p>
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {paymentLink}
                </a>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 font-medium mb-2">Test Card Information:</p>
              <p className="text-sm text-gray-700">Card Number: 4242 4242 4242 4242</p>
              <p className="text-sm text-gray-700">Expiry: Any future date</p>
              <p className="text-sm text-gray-700">CVC: Any 3 digits</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}