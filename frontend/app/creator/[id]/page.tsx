"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { toast } from "sonner";
import Link from "next/link";
import {
  Users,
  Calendar,
  Twitter,
  Instagram,
  Heart,
  AlertCircle,
  Loader2,
  CircleDashedIcon,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui";
import { getRawSubscribe, getRawTipCreator } from "@/lib/tx";
import { Hex, parseEther } from "viem";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { electroneum, sepolia } from "viem/chains";
import { deployments } from "@/lib/constants";
import { useEnvironmentStore } from "@/components/context";
interface User {
  id: string;
  bio: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  last_login: string;
  eth_wallet_address: string;
}

interface Content {
  id: string;
  created_at: string;
  creator_id: string;
  caption: string;
  content_url: string;
  is_premium: boolean;
  access_price: number;
  views_count: number;
  likes_count: number;
  content_hash: string;
  type: string;
  cipher_text: string;
}

interface SocialLinks {
  twitter?: string;
  instagram?: string;
  [key: string]: string | undefined;  // For any additional social links
}

interface CreatorWithContent {
  id: string;
  created_at: string;
  user_id: string;
  category: string;
  sub_price: number;
  banner_url: string;
  social_links: SocialLinks;
  verified: boolean;
  updated_at: string;
  users: User;
  subscriber_count: number;
  content: Content[];
}

export default function CreatorProfilePage() {
  const params = useParams();
  const { primaryWallet } = useDynamicContext();
  const [creator, setCreator] = useState<CreatorWithContent | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const predefinedAmounts = [5, 10, 25, 50];
  const [tipAmount, setTipAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { userProfile } = useEnvironmentStore((store) => store)

  const id = typeof params.id === "string" ? params.id : "";

  // Fetch creator profile
  useEffect(() => {
    const fetchCreator = async () => {

      if (!id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/creators/${id}`);

        if (response.ok) {
          const data = await response.json();
          setCreator(data);
        } else {
          toast.error("Creator not found");
        }
      } catch (error) {
        console.error("Error fetching creator:", error);
        toast.error("Failed to load creator profile");
      } finally {
        setIsLoading(false);
        setIsContentLoading(false)
      }
    };

    fetchCreator();
  }, [id]);

  const handleTipAmountChange = (e: any) => {
    // Only allow numeric input with decimals
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setTipAmount(value);
    }
  };

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!primaryWallet?.address || !creator?.id) return;

      try {
        const response = await fetch(
          `/api/subscriptions?creatorId=${creator.id}&wallet=${primaryWallet.address}`
        );

        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data && data.length > 0);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, [primaryWallet?.address, creator?.id]);

  const handleSubscribe = async () => {

    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return;
    }
    if (!primaryWallet?.address || !creator?.id) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsSubscribing(true);

      toast.info("Subscribing to " + creator.users.full_name, {
        description: "Initiating Transaction to subscribe.",
      });
      const isProduction = JSON.parse(
        process.env.NEXT_PUBLIC_IS_PRODUCTION || "false"
      );
      const data = getRawSubscribe(creator.users.eth_wallet_address as Hex) as Hex;
      const walletClient = await primaryWallet.getWalletClient();
      const hash = await walletClient.sendTransaction({
        to: deployments[isProduction ? electroneum.id : sepolia.id],
        data: data,
        value: parseEther(creator.sub_price.toString()),
      });
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userProfile?.id,
          creator_id: creator.id,
          amount: creator.sub_price,
          tx_hash: hash
        }),
      });


      if (response.ok) {
        setIsSubscribed(true);
        toast.success(
          "Transcation Success", {
          description: `Subscribed to ${creator.users.full_name || creator.users.username}`,
          action: {
            label: "View Tx",
            onClick: () => {
              window.open(
                isProduction
                  ? "https://blockexplorer.electroneum.com/tx/" + hash
                  : "https://eth-sepolia.blockscout.com/tx/" + hash,
                "_blank"
              );
            },
          },
        }
        );
      } else {
        throw new Error("Subscription failed");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center">
          <CircleDashedIcon className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">
            Loading creator profile...
          </p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-4">Creator Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The creator you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/explore">Explore Creators</Link>
        </Button>
      </div>
    );
  }



  return (
    <div className="container mx-auto py-8 px-4">
      {/* Banner */}
      <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden mb-8 relative">
        {creator.banner_url ? (
          <img
            src={creator.banner_url}
            alt={`${creator.users.username}'s banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        )}
      </div>

      {/* Creator Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
            <AvatarImage
              src={creator.users.avatar_url || "/placeholder-avatar.png"}
              alt={creator.users.username}
            />
            <AvatarFallback>
              {creator.users.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-grow space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold">
              {creator.users.full_name || creator.users.username}
            </h1>
            {creator.verified && (
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                Verified
              </Badge>
            )}
          </div>

          <div className="text-muted-foreground">@{creator.users.username}</div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{creator.subscriber_count} Subscribers</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {formatDistanceToNow(new Date(creator.created_at))} ago
              </span>
            </div>
          </div>

          {creator.users.bio && <p>{creator.users.bio}</p>}

          <div className="flex gap-2 pt-2">
            {creator.social_links?.twitter && (
              <Button variant="ghost" size="icon" asChild title="Twitter">
                <a
                  href={`https://twitter.com/${creator.social_links.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
            )}
            {creator.social_links?.instagram && (
              <Button variant="ghost" size="icon" asChild title="Instagram">
                <a
                  href={`https://instagram.com/${creator.social_links.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-shrink-0 mt-4 md:mt-0">
          {/* Subscription Card */}
          <Card className="w-full md:w-64">
            <CardContent className="p-4 h-full">
              <div className="text-center ">
                <div className="text-2xl font-bold mb-1">
                  {creator.sub_price} ETN
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  per month
                </div>

                {primaryWallet ? (
                  isSubscribed ? (
                    <Button className="w-full" variant="outline">
                      Subscribed
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={handleSubscribe}
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? "Processing..." : "Subscribe"}
                    </Button>
                  )
                ) : (
                  <DynamicWidget />
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <Separator className="my-6" />

      {/* Creator Content */}
      <Tabs defaultValue="content">
        <TabsList className="mb-6">
          <TabsTrigger value="content">All Content</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          {isContentLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : creator.content.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-medium mb-2">No content yet</h2>
              <p className="text-muted-foreground">
                This creator hasn&apos;t published any content yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creator.content.map((item) => (
                <Link href={`/content/${item.id}`} key={item.id}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="aspect-square relative">
                      <img
                        src={item.content_url}
                        alt={item.caption || "Content image"}
                        className={`w-full h-full object-cover ${item.is_premium && 'filter blur-md'}`}
                      />
                      {item.is_premium && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 border-none text-white">
                            Premium
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex-grow">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="line-clamp-2 font-medium">
                            {item.caption || "Untitled"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(item.created_at))} ago
                          </p>
                        </div>
                        {item.is_premium && (
                          <div className="text-amber-600 font-medium">
                            {item.access_price} ETN
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-2 border-t flex justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          <span>{item.likes_count}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.views_count} views
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="premium">
          {isContentLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creator.content
                .filter((item) => item.is_premium)
                .map((item) => (
                  <Link href={`/content/${item.id}`} key={item.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                      <div className="aspect-square relative">
                        <img
                          src={item.content_url}
                          alt={item.caption || "Content image"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 border-none text-white">
                            Premium
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="line-clamp-2 font-medium">
                              {item.caption || "Untitled"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(item.created_at))}{" "}
                              ago
                            </p>
                          </div>
                          <div className="text-amber-600 font-medium">
                            {item.access_price} ETN
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 py-2 border-t flex justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            <span>{item.likes_count}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.views_count} views
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          )}

          {!isContentLoading &&
            creator.content.filter((item) => item.is_premium).length === 0 && (
              <div className="text-center py-16">
                <h2 className="text-xl font-medium mb-2">No premium content</h2>
                <p className="text-muted-foreground">
                  This creator hasn&apos;t published any premium content yet.
                </p>
              </div>
            )}
        </TabsContent>

        <TabsContent value="free">
          {isContentLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creator.content
                .filter((item) => !item.is_premium)
                .map((item) => (
                  <Link href={`/content/${item.id}`} key={item.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                      <div className="aspect-square">
                        <img
                          src={item.content_url}
                          alt={item.caption || "Content image"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <p className="line-clamp-2 font-medium">
                          {item.caption || "Untitled"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(item.created_at))} ago
                        </p>
                      </CardContent>
                      <CardFooter className="px-4 py-2 border-t flex justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            <span>{item.likes_count}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.views_count} views
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
            </div>
          )}

          {!isContentLoading &&
            creator.content.filter((item) => !item.is_premium).length === 0 && (
              <div className="text-center py-16">
                <h2 className="text-xl font-medium mb-2">No free content</h2>
                <p className="text-muted-foreground">
                  This creator hasn&apos;t published any free content yet.
                </p>
              </div>
            )}
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>
                About {creator.users.full_name || creator.users.username}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Bio</h3>
                <p className="text-muted-foreground">
                  {creator.users.bio || "This creator hasn't added a bio yet."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Category</h3>
                <Badge variant="outline">{creator.category || "Art"}</Badge>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Contact & Social</h3>
                <div className="flex flex-wrap gap-4">
                  {creator.social_links?.twitter && (
                    <a
                      href={`https://twitter.com/${creator.social_links.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Twitter className="h-5 w-5" />
                      <span>@{creator.social_links.twitter}</span>
                    </a>
                  )}

                  {creator.social_links?.instagram && (
                    <a
                      href={`https://instagram.com/${creator.social_links.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Instagram className="h-5 w-5" />
                      <span>@{creator.social_links.instagram}</span>
                    </a>
                  )}



                  {!creator.social_links?.twitter &&
                    !creator.social_links?.instagram &&
                    (
                      <p className="text-muted-foreground">
                        No social links provided
                      </p>
                    )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Member Since</h3>
                <p className="text-muted-foreground">
                  {new Date(creator.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
