"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import {
  Menu,
  Home,
  Compass,
  LayoutDashboard,
  Wallet,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEnvironmentStore } from "./context";
import { useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { primaryWallet } = useDynamicContext();
  const { fetchUserProfile, setIsProfileModalOpen } = useEnvironmentStore(
    (state) => ({
      fetchUserProfile: state.fetchUserProfile,
      setIsProfileModalOpen: state.setIsProfileModalOpen,
    })
  );

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/explore",
      label: "Explore",
      icon: Compass,
      active: pathname === "/explore",
    },
    {
      href: "/creator-dashboard",
      label: "Creator Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/creator-dashboard",
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: Wallet,
      active: pathname === "/wallet",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/profile",
    },
  ];
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!primaryWallet?.address) return;
      const hasProfile = await fetchUserProfile(primaryWallet.address);
      if (!hasProfile) {
        setIsProfileModalOpen(true);
      }
    };

    checkUserProfile();
  }, [primaryWallet?.address, fetchUserProfile, setIsProfileModalOpen]);

  return (
    <header className="sen sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between w-full max-w-full">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="ETN Patron AI Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="hidden sm:inline-block font-bold text-xl">
              ETN Patron AI
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6 mx-6 flex-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Theme toggle always visible */}
          <ThemeToggle />

          {/* Connect wallet button on desktop */}
          <div className="hidden md:flex">
            {/** @ts-expect-error weird error */}
            <DynamicWidget />
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <div className="flex flex-col gap-4 mt-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                      route.active
                        ? "bg-muted text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto pb-8">
                {/** @ts-expect-error weird error */}
                <DynamicWidget />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
