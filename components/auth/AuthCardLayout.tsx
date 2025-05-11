import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface AuthCardLayoutProps extends React.ComponentPropsWithoutRef<"div"> {
  title: string;
  description: string;
  footerLinkHref: string;
  footerLinkText: string;
  footerText: string;
  children: React.ReactNode;
}

export default function AuthCardLayout({
  title,
  description,
  footerLinkHref,
  footerLinkText,
  footerText,
  children,
  className,
  ...props
}: AuthCardLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children} {/* Form fields and submit button will go here */}
          <div className="mt-4 text-center text-sm">
            {footerText}{" "}
            <Link href={footerLinkHref} className="underline underline-offset-4">
              {footerLinkText}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 