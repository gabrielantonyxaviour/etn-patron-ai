// File: app/not-found.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <div className="relative mb-8">
        <Image
          src="/not-found.png"
          alt="Page not found"
          width={400}
          height={400}
        />
      </div>

      <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
        Page Not Found
      </h1>

      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Oops! The content you're looking for seems to have disappeared into the
        blockchain.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
        <Button
          variant="default"
          className="gap-2 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          asChild
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Button variant="outline" className="gap-2 w-full" asChild>
          <Link href="/explore">
            <Search className="h-4 w-4" />
            Explore Creators
          </Link>
        </Button>
      </div>

      <div className="mt-16">
        <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm max-w-lg mx-auto">
          <p>
            If you believe this is an error, please contact our support team at{" "}
            <a
              href="mailto:gabrielantony56@gmail.com"
              className="text-primary hover:underline"
            >
              gabrielantony56@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
