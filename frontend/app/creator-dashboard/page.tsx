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
  CircleDashedIcon,
} from "lucide-react";
import Link from "next/link";
import { useWeb3Modal } from "@/hooks/use-web3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { uploadImageToPinata } from "@/lib/pinata";
import { getRawRegisterCreator } from "@/lib/tx";
import { electroneum, sepolia } from "viem/chains";
import { deployments } from "@/lib/constants";
import { Hex } from "viem";
import { dataTagErrorSymbol } from "@tanstack/react-query";

// Types
interface CreatorProfile {
  id: string;
  category: string;
  created_at: string;
  sub_price: number;
  banner_url: string;
  verified?: boolean;
  social_links: {
    twitter?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  isRegistered: boolean;
}

interface ContentItem {
  id: string;
  creator_id: string;
  caption: string;
  is_premium: boolean;
  access_price: number;
  views_count: number;
  likes_count: number;
  content_hash: string;
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
  const { userProfile } = useEnvironmentStore(
    (store) => store
  );

  // State for API data
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProfileLoading, setIsCreateProfileLoading] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile>({
    id: "",
    category: "",
    created_at: "",
    sub_price: 0,
    banner_url: "",
    verified: false,
    social_links: {
      twitter: "",
      instagram: "",
    },
    isRegistered: false,
  });
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
    subPrice: "",
    twitter: "",
    instagram: "",
    bannerImage: null as File | null,
  });

  // Check if user is a creator
  useEffect(() => {
    async function checkCreatorStatus() {
      if (!primaryWallet || !primaryWallet?.address) return;
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/creators/user_id/${userProfile?.id}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.isRegistered) {
            setIsRegistered(true);
            setSettingsForm({
              subPrice: data.sub_price,
              twitter: data.social_links.twitter,
              instagram: data.social_links.instagram,
              bannerImage: data.banner_url,
            });
          } else {
            setIsRegistered(false);
          }

          setCreatorProfile({
            id: data.id,
            category: data.category,
            created_at: data.created_at,
            sub_price: data.sub_price,
            banner_url: data.banner_url,
            verified: data.verified,
            social_links: data.social_links,
            isRegistered: true,
          });
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
    if (userProfile)
      checkCreatorStatus();
  }, [userProfile]);

  // Fetch creator content
  useEffect(() => {
    async function fetchContent() {
      if (!creatorProfile?.id) return;
      try {
        const response = await fetch(
          `/api/content?creator_id=${creatorProfile.id}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Creator contnet')
          console.log(data)
          setContent(data || []);
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

    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      console.log("Primary wallet not found");
      return;
    }


    try {
      setIsCreateProfileLoading(true);
      const isProduction = JSON.parse(
        process.env.NEXT_PUBLIC_IS_PRODUCTION || "false"
      );
      const data = getRawRegisterCreator() as Hex;
      const walletClient = await primaryWallet.getWalletClient();
      const hash = await walletClient.sendTransaction({
        to: deployments[isProduction ? electroneum.id : sepolia.id],
        data: data,
      });
      if (hash.length > 0) {
        const banner_url = createProfileForm.bannerImage ? await uploadImageToPinata(createProfileForm.bannerImage) : null;
        const createProfileData = {
          user_id: userProfile?.id,
          sub_price: createProfileForm.subscriptionPrice,
          banner_url,
          category: createProfileForm.category,
          social_links: {
            twitter: createProfileForm.twitter,
            instagram: createProfileForm.instagram
          },
          verified: false,
        };

        console.log("Create profile data")
        console.log(createProfileData)

        // Create creator profile
        const response = await fetch(
          `/api/creators/user_id/${primaryWallet.address}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(createProfileData),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCreatorProfile({
            id: data.id,
            category: data.category,
            created_at: data.created_at,
            sub_price: data.sub_price,
            banner_url: data.banner_url,
            verified: data.verified,
            social_links: data.social_links,
            isRegistered: true,
          });
          setSettingsForm({
            subPrice: data.sub_price,
            twitter: data.social_links.twitter,
            instagram: data.social_links.instagram,
            bannerImage: data.banner_url,
          })
          setIsRegistered(true);

          toast.success("Transaction Success", {
            description: "Your Creator profile is created successfully",
            action: {
              label: "View Tx",
              onClick: () => {
                window.open("https://blockexplorer.electroneum.com/tx/" + hash, "_blank");
              }
            }
          });
        } else {
          throw new Error("Failed to create creator profile");
        }
      } else {
        toast.error("Transaction Failed", {
          description: "Something went wrong, Please Try Again. ",
        });
        return;
      }
    } catch (error: any) {
      console.error("Error registering creator:", error);
      if ((error as string).includes("User rejected the request")) {
        toast.error("Transaction Rejected", {
          description: "What made you change your mind?",
        });
      } else if ((error as string).includes("Transaction Error")) {
        toast.error("Transaction Error", {
          description: "Something went wrong, Please Try Again. ",
        })
      } else {
        toast.error("Create Profile Error", {
          description: "Failed to create your creator profile. Please try again.",
        });
      }

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
      setIsProfileUpdating(true);

      const updateData = {
        twitter: settingsForm.twitter,
        instagram: settingsForm.instagram,
        sub_price: settingsForm.subPrice,
      };


      console.log(updateData)

      // Update creator profile
      const response = await fetch(
        `/api/creators/user_id/${userProfile?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCreatorProfile({
          ...data,
        });

        toast.success("Your profile has been updated");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update your profile. Please try again.");
    } finally {
      setIsProfileUpdating(false);
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

  if (!isRegistered && !isLoading) {
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
                      {
                        createProfileForm.bannerImage && <img
                          src={
                            createProfileForm.bannerImage
                              ? URL.createObjectURL(createProfileForm.bannerImage)
                              : "/content/placeholder.jpg"
                          }
                          alt="Banner Image"
                          className="w-full h-full object-cover"
                        />
                      }
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
            <DialogContent className="h-[90vh] sm:max-w-[600px] sen">
              <DialogHeader>
                <DialogTitle className="sen">Publish New Content</DialogTitle>
                <DialogDescription>
                  Create and publish new content for your subscribers and fans.
                </DialogDescription>
              </DialogHeader>

              <PublishContentForm
                creatorId={creatorProfile?.id}
                addContent={() => {

                }}
              />
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
          description={`${earningsData.percentChange > 0 ? "+" : ""
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
          description={`${transactions.filter((tx) => tx.transaction_type === "tip").length
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
                    <DialogContent className="h-[90vh] sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Publish New Content</DialogTitle>
                        <DialogDescription>
                          Create and publish new content for your subscribers
                          and fans.
                        </DialogDescription>
                      </DialogHeader>

                      <PublishContentForm
                        creatorId={creatorProfile?.id} addContent={(createdContent: ContentItem) => {
                          setContent([...content, createdContent])
                        }}
                      />
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
                              item.content_url || "/content/placeholder.jpg"
                            }
                            alt={item.caption}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.caption}</h3>
                            <Badge variant="secondary">
                              {item.is_premium ? "Premium" : "Free"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Published{" "}
                          {formatDistanceToNow(new Date(item.created_at))} ago
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {creatorProfile.category}
                        </Badge>
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {/* {content.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Content
                </Button>
              </CardFooter>
            )} */}
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
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={userProfile?.username}
                      required
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premiumPrice">
                      Subscription Price (in ETN)
                    </Label>
                    <Input
                      id="premiumPrice"
                      type="number"
                      value={settingsForm.subPrice}
                      onChange={handleSettingsInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-sm">
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
                      <Label htmlFor="instagram" className="text-sm">
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isProfileUpdating} >
                  {isProfileUpdating ? <div className="flex space-x-2">
                    <CircleDashedIcon className="h-5 w-5 animate-spin" />
                    <p>Updating...</p>
                  </div> : <p>Update Settings</p>}
                </Button>
              </CardFooter>
            </form>
            {/* {content.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Content
                </Button>
              </CardFooter>
            )} */}
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
                    <div className="text-2xl font-bold">
                      {earningsData.thisMonth.toFixed(2)} ETN
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      {earningsData.percentChange > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-red-500 mr-1 transform rotate-180" />
                      )}
                      <span
                        className={
                          earningsData.percentChange > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {earningsData.percentChange > 0 ? "+" : ""}
                        {earningsData.percentChange.toFixed(0)}% from last month
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Last Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {earningsData.lastMonth.toFixed(2)} ETN
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {new Date().getMonth() === 0
                          ? "December"
                          : new Date(
                            0,
                            new Date().getMonth() - 1
                          ).toLocaleString("default", { month: "long" })}{" "}
                        {new Date().getFullYear()}
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">All Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardMetrics.totalEarnings.toFixed(2)} ETN
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        Since{" "}
                        {new Date(
                          creatorProfile?.created_at || new Date()
                        ).toLocaleDateString()}
                      </span>
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
                  <p className="font-medium">
                    {earningsBySource.contentPurchases.toFixed(2)} ETN
                  </p>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Subscriptions</h4>
                    <p className="text-sm text-muted-foreground">
                      Monthly subscriber revenue
                    </p>
                  </div>
                  <p className="font-medium">
                    {earningsBySource.subscriptions.toFixed(2)} ETN
                  </p>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Tips</h4>
                    <p className="text-sm text-muted-foreground">
                      Voluntary contributions from fans
                    </p>
                  </div>
                  <p className="font-medium">
                    {earningsBySource.tips.toFixed(2)} ETN
                  </p>
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
                  <option value="basic">Basic Tier</option>
                  <option value="premium">Premium Tier</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {subscribers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No subscribers yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    As people subscribe to your content, they&apos;ll appear
                    here
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/explore">Find Creators to Follow</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              subscriber.users.avatar_url ||
                              "/subscribers/placeholder.jpg"
                            }
                          />
                          <AvatarFallback>
                            {subscriber.users.username
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {subscriber.users.full_name ||
                              subscriber.users.username}
                          </h3>
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
      </Tabs>
    </div>
  );
}
