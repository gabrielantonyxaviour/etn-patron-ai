// File: app/creator-dashboard/page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Plus,
  Upload,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Download,
  Edit,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useWeb3Modal } from "@/hooks/use-web3";
import { formatAddress } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PublishContentForm } from "@/components/publish-content-form";
import { StatCard } from "@/components/stat-card";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";

export default function CreatorDashboardPage() {
  const { address, isConnected } = useWeb3Modal();
  const [isRegistered, setIsRegistered] = useState(false);

  // In a real app, you would check if the user is registered as a creator
  // This is just for demo purposes

  if (!isConnected) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-6">Creator Dashboard</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Connect your wallet to access your creator dashboard or register as a
          new creator.
        </p>
        <DynamicConnectButton>
          <Zap className="h-4 w-4" />
          Connect Wallet
        </DynamicConnectButton>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Become a Creator</CardTitle>
              <CardDescription>
                Register as a creator to start publishing content and receiving
                micro-payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Choose a unique username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" placeholder="Your name or brand" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your content"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Primary Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a category</option>
                    <option value="art">Digital Art</option>
                    <option value="music">Music</option>
                    <option value="writing">Writing</option>
                    <option value="video">Video</option>
                    <option value="photography">Photography</option>
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="crafts">Crafts</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Image</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload your profile image
                    </p>
                    <Button variant="outline" size="sm" type="button">
                      Select Image
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setIsRegistered(true)}>
                Register as Creator
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <Badge
              variant="outline"
              className="bg-green-100 text-green-700 border-green-200"
            >
              Verified
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your content and earnings
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Publish Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Publish New Content</DialogTitle>
                <DialogDescription>
                  Create and publish new content for your subscribers and fans.
                </DialogDescription>
              </DialogHeader>

              <PublishContentForm />

              <DialogFooter className="mt-4">
                <Button type="submit" form="publish-content-form">
                  Publish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" asChild>
            <Link href="/profile/digitalartpro">
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Earnings"
          value="583.25 ETN"
          description="+12.3% from last month"
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Subscribers"
          value="247"
          description="+5 new this week"
          icon={<Users className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Content Views"
          value="15,423"
          description="+2,145 this month"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Tips Received"
          value="134.72 ETN"
          description="23 tips this month"
          icon={<Zap className="h-4 w-4" />}
          trend="up"
        />
      </div>

      <Tabs defaultValue="content" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="content">My Content</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Published Content</CardTitle>
                <CardDescription>
                  Manage your published content and monitor performance.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Bulk Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Content items would be mapped here from real data */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                      <img
                        src="/content/thumb1.jpg"
                        alt="Digital Art Techniques"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          Digital Art Techniques: Lighting and Shadows
                        </h3>
                        <Badge variant="secondary">Premium</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Published on Mar 1, 2025
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Digital Art
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">Views</p>
                      <p className="text-muted-foreground">1,245</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Earnings</p>
                      <p className="text-muted-foreground">45.20 ETN</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                      <img
                        src="/content/thumb2.jpg"
                        alt="Color Theory"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          Color Theory for Digital Artists
                        </h3>
                        <Badge variant="secondary">Premium</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Published on Feb 15, 2025
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Digital Art
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">Views</p>
                      <p className="text-muted-foreground">2,378</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Earnings</p>
                      <p className="text-muted-foreground">72.86 ETN</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                      <img
                        src="/content/thumb3.jpg"
                        alt="Drawing Basics"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          Drawing Basics: Lines and Shapes
                        </h3>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-200"
                        >
                          Free
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Published on Jan 10, 2025
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Digital Art
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">Views</p>
                      <p className="text-muted-foreground">3,542</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Tips</p>
                      <p className="text-muted-foreground">28.45 ETN</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Content
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>
                  Track your earnings from content purchases, subscriptions, and
                  tips.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">102.45 ETN</div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500">
                        +15% from last month
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Last Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89.12 ETN</div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>February 2025</span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">All Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">583.25 ETN</div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Since January 2025</span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="h-80 w-full bg-muted/50 rounded-md flex items-center justify-center mb-6">
                {/* In a real app, this would be a chart component */}
                <p className="text-muted-foreground">
                  Earnings chart will appear here
                </p>
              </div>

              <h3 className="text-lg font-medium mb-4">Earnings by Source</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Content Purchases</h4>
                    <p className="text-sm text-muted-foreground">
                      Revenue from premium content
                    </p>
                  </div>
                  <p className="font-medium">325.42 ETN</p>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Subscriptions</h4>
                    <p className="text-sm text-muted-foreground">
                      Monthly subscriber revenue
                    </p>
                  </div>
                  <p className="font-medium">123.11 ETN</p>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Tips</h4>
                    <p className="text-sm text-muted-foreground">
                      Voluntary contributions from fans
                    </p>
                  </div>
                  <p className="font-medium">134.72 ETN</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Earnings Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subscriber Management</CardTitle>
                <CardDescription>
                  View and manage your subscribers.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="filter-subscribers" className="sr-only">
                  Filter
                </Label>
                <select
                  id="filter-subscribers"
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">All Subscribers</option>
                  <option value="recent">Recent Subscribers</option>
                  <option value="tier-1">Basic Tier</option>
                  <option value="tier-2">Premium Tier</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/subscribers/avatar1.jpg" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">John Smith</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          Subscribed since Jan 2025
                        </p>
                        <Badge variant="secondary">Premium Tier</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Subscription</p>
                      <p className="text-muted-foreground">25 ETN/month</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/subscribers/avatar2.jpg" />
                      <AvatarFallback>EJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Emily Johnson</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          Subscribed since Feb 2025
                        </p>
                        <Badge variant="secondary">Basic Tier</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Subscription</p>
                      <p className="text-muted-foreground">10 ETN/month</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/subscribers/avatar3.jpg" />
                      <AvatarFallback>MD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Michael Davis</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          Subscribed since Mar 2025
                        </p>
                        <Badge variant="secondary">Premium Tier</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Subscription</p>
                      <p className="text-muted-foreground">25 ETN/month</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Subscribers
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Creator Profile Settings</CardTitle>
              <CardDescription>
                Manage your creator profile and subscription options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address</Label>
                  <div className="flex">
                    <Input id="walletAddress" value={address} disabled />
                    <Button variant="ghost" className="ml-2">
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is the wallet address where you'll receive payments.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" defaultValue="Digital Art Pro" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="digitalartpro" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Digital artist specializing in concept art and character design. I share tutorials, time-lapses, and finished pieces."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basicSubscriptionPrice">
                      Basic Tier Price (ETN)
                    </Label>
                    <Input
                      id="basicSubscriptionPrice"
                      type="number"
                      defaultValue="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premiumSubscriptionPrice">
                      Premium Tier Price (ETN)
                    </Label>
                    <Input
                      id="premiumSubscriptionPrice"
                      type="number"
                      defaultValue="25"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Social Media Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-xs">
                        Twitter
                      </Label>
                      <Input id="twitter" placeholder="@username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-xs">
                        Instagram
                      </Label>
                      <Input id="instagram" placeholder="@username" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Profile Image</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="/creators/avatar1.jpg" alt="Profile" />
                      <AvatarFallback>DP</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload New Image
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Banner Image</Label>
                  <div className="h-32 bg-muted rounded-md relative overflow-hidden">
                    <img
                      src="/creators/banner.jpg"
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Change Banner
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button className="w-full sm:w-auto" type="submit">
                Save Changes
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
