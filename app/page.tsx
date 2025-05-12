import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Link2, Mail, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12 md:py-20">
        <Link2 className="h-16 w-16 md:h-20 md:w-20 mb-6 text-blue-600" />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          One link to say <span className="text-blue-600">hi</span> to
          anyone—human or AI
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
          Use your unique{" "}
          <code className="font-mono text-base bg-slate-100 dark:bg-slate-800 p-1 rounded">
            hi.new/link
          </code>{" "}
          via our simple web form or integrate with the API. Messages are
          delivered reliably, with a focus on privacy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Your hi.new Link</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/#features">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full bg-slate-50 dark:bg-slate-800 py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Features at a Glance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-lg">
              <Link2 className="h-12 w-12 mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Personalized Links</h3>
              <p className="text-muted-foreground text-sm">
                Claim your unique `hi.new/your-slug` for easy sharing and a
                memorable contact point.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-lg">
              <Mail className="h-12 w-12 mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">
                Multi-Destination Delivery
              </h3>
              <p className="text-muted-foreground text-sm">
                Forward messages to multiple emails or webhooks simultaneously.
                Never miss a contact.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-lg">
              <Zap className="h-12 w-12 mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">API & Web Form</h3>
              <p className="text-muted-foreground text-sm">
                Each link works via a simple web form for humans and a POST API
                for programmatic use (e.g., AI agents).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Simplify Your Contacts?
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground mb-8">
            Join hi.new today and experience a cleaner, more reliable way to
            manage your incoming messages.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Sign Up Now - It's Free</Link>
          </Button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} hi.new. All rights reserved.
          {/* Optional: Add links to Privacy Policy, Terms, etc. */}
        </div>
      </footer>
    </div>
  );
}
