import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Twitter, Github, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="ETN Patron AI Logo"
                width={32}
                className="rounded-full"
                height={32}
              />
              <span className="font-bold text-xl">ETN Patron AI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering content creators with blockchain-based micro-payments
              on the Electroneum network.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://x.com/ETNPatronAI"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://github.com/gabrielantonyxaviour/etn-patron-ai"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://electroneum.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">Website</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:col-span-3 gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Platform</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/explore"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Explore Creators
                  </Link>
                </li>
                <li>
                  <Link
                    href="/creator-dashboard"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Creator Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wallet"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Wallet
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Resources</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/docs"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://electroneum.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    About Electroneum
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Legal</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold">Join Our Newsletter</h3>
              <p className="text-sm text-muted-foreground">
                Stay updated with the latest features and creator news.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ETN Patron AI. Built for
            Electroneum Hackathon 2025.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Electroneum Blockchain
          </p>
        </div>
      </div>
    </footer>
  );
}
