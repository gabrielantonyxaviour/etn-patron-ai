"use client";

import { useEffect, useState } from "react";
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
  Download,
  Edit,
  Eye,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useWeb3Modal } from "@/hooks/use-web3";
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
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useEnvironmentStore } from "@/components/context";

// Types
interface CreatorProfile {
  id: string;
  category: string;
  created_at: string;
  subscription_price: number;
  banner_url: string;
  social_links: {
    twitter?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  bio?: string;
  verified?: boolean;
  users: {
    username: string;
    avatar_url: string;
    full_name: string;
    email: string;
  };
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  content_type: string;
  is_premium: boolean;
  access_price: number;
  views_count: number;
  likes_count: number;
  created_at: string;
  content_url: string;
}

interface Subscriber {
  id: string;
  user_id: string;
  subscription_tier: string;
  start_date: string;
  price_paid: number;
  is_active: boolean;
  users: {
    username: string;
    avatar_url: string;
    full_name: string;
  };
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  created_at: string;
  status: string;
  sender: {
    username: string;
    avatar_url: string;
  };
  content?: {
    title: string;
  };
  subscription?: {
    subscription_tier: string;
  };
}

interface DashboardMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribers: number;
  totalEarnings: number;
  totalViews: number;
  totalLikes: number;
}

export default function CreatorDashboardPage() {
  const { address } = useWeb3Modal();
  const { user, primaryWallet } = useDynamicContext();
  const { userProfile } = useEnvironmentStore((store) => store);

  // State for API data
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProfileLoading, setIsCreateProfileLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(
    null
  );
  const [content, setContent] = useState<ContentItem[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    newSubscribers: 0,
    totalEarnings: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  // Form states for create profile
  const [createProfileForm, setCreateProfileForm] = useState({
    category: "",
    subscriptionPrice: "10",
    twitter: "",
    instagram: "",
    bannerImage: null as File | null,
  });

  // Form states for settings
  const [settingsForm, setSettingsForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    basicPrice: "",
    premiumPrice: "",
    twitter: "",
    instagram: "",
    profileImage: null as File | null,
    bannerImage: null as File | null,
  });

  // Check if user is a creator
  useEffect(() => {
    async function checkCreatorStatus() {
      if (!primaryWallet || !primaryWallet?.address) return;
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/creators/wallet/${primaryWallet.address}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data) {
            setIsRegistered(true);
            setCreatorProfile(data);

            // Initialize settings form with creator data
            setSettingsForm({
              displayName: userProfile?.full_name || "",
              username: userProfile?.username || "",
              bio: userProfile?.bio || "",
              basicPrice: data.subscription_price
                ? data.subscription_price.toString()
                : "10",
              premiumPrice: (data.subscription_price * 2.5).toString(),
              twitter: data.social_links?.twitter || "",
              instagram: data.social_links?.instagram || "",
              profileImage: null,
              bannerImage: null,
            });
          } else {
            setIsRegistered(false);
          }
        } else {
          setIsRegistered(false);
        }
      } catch (error) {
        console.error("Error checking creator status:", error);
        setIsRegistered(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkCreatorStatus();
  }, [primaryWallet?.address, userProfile]);

  // Fetch creator content
  useEffect(() => {
    async function fetchContent() {
      if (!creatorProfile?.id) return;
      try {
        const response = await fetch(
          `/api/content?creatorId=${creatorProfile.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setContent(data.content || []);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    }

    fetchContent();
  }, [creatorProfile?.id]);

  // Fetch creator subscribers
  useEffect(() => {
    async function fetchSubscribers() {
      if (!primaryWallet?.address || !creatorProfile?.id) return;
      try {
        const response = await fetch(
          `/api/subscribers?creatorId=${creatorProfile.id}&wallet=${primaryWallet.address}`
        );

        if (response.ok) {
          const data = await response.json();
          setSubscribers(data || []);
        }
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      }
    }

    fetchSubscribers();
  }, [primaryWallet?.address, creatorProfile?.id]);

  // Fetch transactions
  useEffect(() => {
    async function fetchTransactions() {
      if (!primaryWallet?.address) return;
      try {
        const response = await fetch(
          `/api/transactions?wallet=${primaryWallet.address}`
        );

        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    }

    fetchTransactions();
  }, [primaryWallet?.address]);

  // Fetch dashboard metrics
  useEffect(() => {
    async function fetchDashboardMetrics() {
      if (!primaryWallet?.address || !creatorProfile?.id) return;
      try {
        const response = await fetch(
          `/api/dashboard/creator?wallet=${primaryWallet.address}`
        );

        if (response.ok) {
          const data = await response.json();
          setDashboardMetrics(
            data.metrics || {
              totalSubscribers: 0,
              activeSubscribers: 0,
              newSubscribers: 0,
              totalEarnings: 0,
              totalViews: 0,
              totalLikes: 0,
            }
          );
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    }

    fetchDashboardMetrics();
  }, [primaryWallet?.address, creatorProfile?.id]);

  // Calculate monthly earnings
  const calculateMonthlyEarnings = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthEarnings = transactions
      .filter(
        (tx) =>
          tx.status === "completed" &&
          new Date(tx.created_at) >=
            new Date(now.getFullYear(), now.getMonth(), 1)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const lastMonthEarnings = transactions
      .filter(
        (tx) =>
          tx.status === "completed" &&
          new Date(tx.created_at) >= lastMonth &&
          new Date(tx.created_at) <
            new Date(now.getFullYear(), now.getMonth(), 1)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const percentChange =
      lastMonthEarnings > 0
        ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
        : 0;

    return {
      thisMonth: thisMonthEarnings,
      lastMonth: lastMonthEarnings,
      percentChange: percentChange,
    };
  };

  // Calculate earnings by type
  const calculateEarningsBySource = () => {
    const contentPurchases = transactions
      .filter(
        (tx) =>
          tx.status === "completed" &&
          tx.transaction_type === "content_purchase"
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const subscriptions = transactions
      .filter(
        (tx) =>
          tx.status === "completed" && tx.transaction_type === "subscription"
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const tips = transactions
      .filter(
        (tx) => tx.status === "completed" && tx.transaction_type === "tip"
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      contentPurchases,
      subscriptions,
      tips,
    };
  };

  // Handle create profile form changes
  const handleCreateProfileInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setCreateProfileForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle settings form changes
  const handleSettingsInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setSettingsForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle banner image change for create profile
  const handleCreateProfileBannerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setCreateProfileForm((prev) => ({
      ...prev,
      bannerImage: file,
    }));
  };

  // Handle file changes for settings
  const handleSettingsFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "profileImage" | "bannerImage"
  ) => {
    const file = e.target.files?.[0] || null;
    setSettingsForm((prev) => ({
      ...prev,
      [fileType]: file,
    }));
  };

  // Handle creator registration
  const handleRegisterCreator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!primaryWallet?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsCreateProfileLoading(true);

      // Upload banner image if selected
      let bannerUrl = "";
      if (createProfileForm.bannerImage) {
        const bannerFormData = new FormData();
        bannerFormData.append("file", createProfileForm.bannerImage);
        bannerFormData.append("wallet", primaryWallet.address);
        bannerFormData.append("contentType", "banner");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: bannerFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          bannerUrl = uploadData.url;
        }
      }

      // Create creator profile
      const response = await fetch(
        `/api/creators/wallet/${primaryWallet.address}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: createProfileForm.category,
            subscription_price: parseFloat(createProfileForm.subscriptionPrice),
            etn_payment_address: primaryWallet.address,
            bio: userProfile?.bio || "",
            wallet_address: primaryWallet.address,
            banner_url: bannerUrl,
            social_links: {
              twitter: createProfileForm.twitter,
              instagram: createProfileForm.instagram,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCreatorProfile(data);
        setIsRegistered(true);

        toast.success("Your creator profile has been created");
      } else {
        throw new Error("Failed to create creator profile");
      }
    } catch (error) {
      console.error("Error registering creator:", error);
      toast.error("Create Profile Error", {
        description: "Failed to create your creator profile. Please try again.",
      });
    } finally {
      setIsCreateProfileLoading(false);
    }
  };

  // Handle settings update
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!primaryWallet?.address || !creatorProfile?.id) {
      toast.error("Creator profile not found");
      return;
    }

    try {
      setIsLoading(true);

      // Upload profile image if selected
      let profileImageUrl = userProfile?.avatar_url || "";
      if (settingsForm.profileImage) {
        const imageFormData = new FormData();
        imageFormData.append("file", settingsForm.profileImage);
        imageFormData.append("wallet", primaryWallet.address);
        imageFormData.append("contentType", "profile");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          profileImageUrl = uploadData.url;

          // Update user avatar
          await fetch(`/api/users`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eth_wallet_address: primaryWallet.address,
              avatar_url: profileImageUrl,
            }),
          });
        }
      }

      // Upload banner image if selected
      let bannerUrl = creatorProfile.banner_url;
      if (settingsForm.bannerImage) {
        const bannerFormData = new FormData();
        bannerFormData.append("file", settingsForm.bannerImage);
        bannerFormData.append("wallet", primaryWallet.address);
        bannerFormData.append("contentType", "banner");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: bannerFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          bannerUrl = uploadData.url;
        }
      }

      // Update creator profile
      const response = await fetch(
        `/api/creators/wallet/${primaryWallet.address}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creator_name: settingsForm.displayName || userProfile?.full_name,
            category: settingsForm.category,
            subscription_price: parseFloat(settingsForm.basicPrice),
            bio: settingsForm.bio,
            wallet_address: primaryWallet.address,
            banner_url: bannerUrl,
            social_links: {
              twitter: settingsForm.twitter,
              instagram: settingsForm.instagram,
            },
          }),
        }
      );

      // Update user info
      await fetch(`/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eth_wallet_address: primaryWallet.address,
          username: settingsForm.username,
          bio: settingsForm.bio,
          full_name: settingsForm.displayName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatorProfile({
          ...data,
          users: {
            ...creatorProfile.users,
            username: settingsForm.username,
            avatar_url: profileImageUrl,
            full_name: settingsForm.displayName,
          },
        });

        toast.success("Your profile has been updated");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !creatorProfile) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Creator Dashboard</h1>
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (primaryWallet == null && user == null) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-6">Creator Dashboard</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Connect your wallet to access your creator dashboard or register as a
          new creator.
        </p>
        <div className="w-full flex justify-center">
          <DynamicWidget />
        </div>
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
            <form onSubmit={handleRegisterCreator}>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Choose a unique username"
                      value={userProfile?.username || ""}
                      required
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Profile Image</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={userProfile?.avatar_url || "https://i.pravatar.cc/298"}
                          alt="Profile"
                        />
                        <AvatarFallback>
                          {userProfile?.username
                            ?.substring(0, 2)
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        id="profileImageInput"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSettingsFileChange(e, "profileImage")}
                      />
                      <Button
                        variant="outline"
                        className="gap-2"
                        type="button"
                        onClick={() =>
                          document.getElementById("profileImageInput")?.click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        Upload New Image
                      </Button>
                      {settingsForm.profileImage && (
                        <p className="text-sm">
                          Selected: {settingsForm.profileImage.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <div className="h-32 bg-muted rounded-md relative overflow-hidden">
                      {creatorProfile?.banner_url ? (
                        <img
                          src={creatorProfile.banner_url}
                          alt="Banner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground text-sm">
                            No banner image
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="bannerImageInput"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSettingsFileChange(e, "bannerImage")}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2 gap-2"
                        type="button"
                        onClick={() =>
                          document.getElementById("bannerImageInput")?.click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        Change Banner
                      </Button>
                      {settingsForm.bannerImage && (
                        <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                          Selected: {settingsForm.bannerImage.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="w-full sm:w-auto"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  type="button"
                  onClick={() => {
                    // Reset form to current profile values
                    if (creatorProfile && userProfile) {
                      setSettingsForm({
                        displayName: userProfile.full_name || "",
                        username: userProfile.username || "",
                        bio: userProfile.bio || "",
                        category: creatorProfile.category,
                        basicPrice: creatorProfile.subscription_price.toString(),
                        premiumPrice: (
                          creatorProfile.subscription_price * 2.5
                        ).toString(),
                        twitter: creatorProfile.social_links?.twitter || "",
                        instagram: creatorProfile.social_links?.instagram || "",
                        profileImage: null,
                        bannerImage: null,
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
                  <div className="space-y-2">
                    <Label htmlFor="category">Primary Category</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={createProfileForm.category}
                      onChange={handleCreateProfileInputChange}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Digital Art">Digital Art</option>
                      <option value="Music">Music</option>
                      <option value="Writing">Writing</option>
                      <option value="Video">Video</option>
                      <option value="Photography">Photography</option>
                      <option value="Programming">Programming</option>
                      <option value="Design">Design</option>
                      <option value="Crafts">Crafts</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionPrice">
                      Subscription Price (in ETN)
                    </Label>
                    <Input
                      id="subscriptionPrice"
                      type="number"
                      value={createProfileForm.subscriptionPrice}
                      onChange={handleCreateProfileInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      placeholder="@username"
                      value={createProfileForm.twitter}
                      onChange={handleCreateProfileInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@username"
                      value={createProfileForm.instagram}
                      onChange={handleCreateProfileInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bannerImage">Banner Image</Label>
                    <div className="h-32 bg-muted rounded-md relative overflow-hidden">
                      <input
                        type="file"
                        id="bannerImageInput"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCreateProfileBannerChange}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-2"
                        type="button"
                        onClick={() =>
                          document.getElementById("bannerImageInput")?.click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        Upload Banner
                      </Button>
                      {createProfileForm.bannerImage && (
                        <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                          Selected: {createProfileForm.bannerImage.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isCreateProfileLoading}
                >
                  {isCreateProfileLoading
                    ? "Registering..."
                    : "Register as Creator"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate earnings data
  const earningsData = calculateMonthlyEarnings();
  const earningsBySource = calculateEarningsBySource();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            {creatorProfile?.verified && (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-700 border-green-200"
              >
                Verified
              </Badge>
            )}
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

              <PublishContentForm
                creatorId={creatorProfile?.id}
                walletAddress={primaryWallet?.address}
              />

              <DialogFooter className="mt-4">
                <Button type="submit" form="publish-content-form">
                  Publish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" asChild>
            <Link href={`/profile/${userProfile?.username}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Earnings"
          value={`${dashboardMetrics.totalEarnings.toFixed(2)} ETN`}
          description={`${
            earningsData.percentChange > 0 ? "+" : ""
          }${earningsData.percentChange.toFixed(1)}% from last month`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={earningsData.percentChange > 0 ? "up" : "down"}
        />
        <StatCard
          title="Subscribers"
          value={dashboardMetrics.activeSubscribers.toString()}
          description={`+${dashboardMetrics.newSubscribers} new this month`}
          icon={<Users className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Content Views"
          value={dashboardMetrics.totalViews.toString()}
          description="Across all your content"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Tips Received"
          value={`${earningsBySource.tips.toFixed(2)} ETN`}
          description={`${
            transactions.filter((tx) => tx.transaction_type === "tip").length
          } tips received`}
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
              {content.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No content published yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start creating and publishing content to grow your audience
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Publish Your First Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Publish New Content</DialogTitle>
                        <DialogDescription>
                          Create and publish new content for your subscribers
                          and fans.
                        </DialogDescription>
                      </DialogHeader>

                      <PublishContentForm
                        creatorId={creatorProfile?.id}
                        walletAddress={primaryWallet?.address}
                      />

                      <DialogFooter className="mt-4">
                        <Button type="submit" form="publish-content-form">
                          Publish
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  {content.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                          <img
                            src={
                              item.thumbnail_url || "/content/placeholder.jpg"
                            }
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              Subscribed since{" "}
                              {new Date(
                                subscriber.start_date
                              ).toLocaleDateString()}
                            </p>
                            <Badge variant="secondary">
                              {subscriber.subscription_tier === "premium"
                                ? "Premium Tier"
                                : "Basic Tier"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Subscription</p>
                          <p className="text-muted-foreground">
                            {subscriber.price_paid} ETN/month
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {subscribers.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Subscribers
                </Button>
              </CardFooter>
            )}
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
            <form onSubmit={handleUpdateSettings}>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <div className="flex">
                      <Input
                        id="walletAddress"
                        value={primaryWallet?.address || ""}
                        disabled
                      />
                      <Button
                        variant="ghost"
                        className="ml-2"
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            primaryWallet?.address || ""
                          );
                          toast.info("Copied to clipboard");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This is the wallet address where you&apos;ll receive
                      payments.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={settingsForm.displayName}
                      onChange={handleSettingsInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={settingsForm.username}
                      onChange={handleSettingsInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={settingsForm.bio}
                      onChange={handleSettingsInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basicPrice">Basic Tier Price (ETN)</Label>
                      <Input
                        id="basicPrice"
                        type="number"
                        value={settingsForm.basicPrice}
                        onChange={handleSettingsInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="premiumPrice">
                        Premium Tier Price (ETN)
                      </Label>
                      <Input
                        id="premiumPrice"
                        type="number"
                        value={settingsForm.premiumPrice}
                        onChange={handleSettingsInputChange}
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
                        <Input
                          id="twitter"
                          placeholder="@username"
                          value={settingsForm.twitter}
                          onChange={handleSettingsInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-xs">
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          placeholder="@username"
                          value={settingsForm.instagram}
                          onChange={handleSettingsInputChange}
                        />
                      </div>
                    </div>
                  </div>">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge variant="secondary">
                              {item.is_premium ? "Premium" : "Free"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              Published{" "}
                              {formatDistanceToNow(new Date(item.created_at))}{" "}
                              ago
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.content_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">Views</p>
                          <p className="text-muted-foreground">
                            {item.views_count}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Earnings</p>
                          <p className="text-muted-foreground">
                            {(item.is_premium
                              ? item.access_price *
                                Math.floor(item.views_count / 3)
                              : 0
                            ).toFixed(2)}{" "}
                            ETN
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/content/edit/${item.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>