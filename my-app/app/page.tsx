import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FeaturedCreators } from "@/components/featured-creators";
import { HowItWorks } from "@/components/how-it-works";
import { CheckCircle, Zap, PiggyBank, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-600 py-20 text-white">
        <div className="container mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <Badge
              variant="outline"
              className="mb-4 bg-white/10 text-white border-none"
            >
              Built on Electroneum
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Support Creators with{" "}
              <span className="text-pink-400">Micro-Payments</span>
            </h1>
            <p className="text-lg mb-6 max-w-lg">
              Empower creators with instant, low-fee micropayments on
              Electroneum blockchain. Subscribe, tip, and purchase premium
              content seamlessly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/explore">
                <Button size="lg" className="bg-pink-500 hover:bg-pink-600">
                  Explore Creators
                </Button>
              </Link>
              <Link href="/creator-dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                >
                  Become a Creator
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="relative h-[400px] w-full">
              <Image
                src="/images/hero-illustration.svg"
                alt="Creators and Fans"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Why Choose CreatorPay?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform leverages Electroneum's blockchain technology to
              provide unique advantages for creators and supporters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Payments</h3>
                <p className="text-muted-foreground">
                  5-second transaction finality means creators get paid
                  instantly without waiting for traditional payment processing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 bg-pink-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Micro-Transactions
                </h3>
                <p className="text-muted-foreground">
                  Low gas fees make even the smallest payments economical,
                  enabling new monetization opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Secure & Transparent
                </h3>
                <p className="text-muted-foreground">
                  Blockchain-based payments provide security and transparency
                  for both creators and supporters.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured creators */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Creators
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Featured Creators</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover talented creators already using our platform to connect
              with their audience.
            </p>
          </div>
          <FeaturedCreators />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Getting Started
            </Badge>
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our platform in a few simple steps and start supporting or
              monetizing content.
            </p>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-gradient-to-br from-pink-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Join the Revolution?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Whether you're a creator looking to monetize your content or a fan
            wanting to support your favorites, CreatorPay makes it simple and
            cost-effective.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/explore">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-100"
              >
                Start Exploring
              </Button>
            </Link>
            <Link href="/creator-dashboard">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                Become a Creator
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
