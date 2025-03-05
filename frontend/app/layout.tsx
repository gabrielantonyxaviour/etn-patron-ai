import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Web3Provider } from "@/components/providers/web3-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { EnvironmentStoreProvider } from "@/components/context";
import { WalletProfileCheck } from "@/components/wallet-profile-check";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ETN Patron AI - Micro-payments for Content Creators",
  description:
    "Support your favorite creators with micro-payments using Electroneum blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <EnvironmentStoreProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Web3Provider>
              <Navbar />
              <main className="flex-grow sen">{children}</main>
              <Footer />
              <Toaster />
            </Web3Provider>
          </ThemeProvider>
        </EnvironmentStoreProvider>
      </body>
    </html>
  );
}
