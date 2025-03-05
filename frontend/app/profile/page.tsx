// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Wallet, User, Copy, ExternalLink } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useEnvironmentStore } from "@/components/context";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { primaryWallet } = useDynamicContext();
  const { userProfile, isProfileLoading } = useEnvironmentStore(
    (state) => state
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    bio: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [transactions, setTransactions] = useState([]);

  // Initialize form with user data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || "",
        full_name: userProfile.full_name || "",
        email: userProfile.email || "",
        bio: userProfile.bio || "",
      });
    }
  }, [userProfile]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
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
    };

    fetchTransactions();
    // Remove the comma that was after fetchTransactions()
  }, [primaryWallet?.address]);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit");
    if (!primaryWallet?.address) return;

    setIsUpdating(true);
    try {
      console.log("Starting profile update...");
      // Upload avatar if selected
      const avatarUrl = userProfile?.avatar_url || "";

      console.log("Uploading avatar...");
      const userData = new FormData();

      // Add user data to FormData
      userData.append("username", formData.username);
      userData.append("full_name", formData.full_name || "");
      userData.append("email", formData.email);
      userData.append("bio", formData.bio || "");
      userData.append("eth_wallet_address", primaryWallet.address);

      if (avatarFile) {
        userData.append("avatar", avatarFile);
      } else {
        userData.append("avatar_url", avatarUrl);
      }
      console.log("User data prepared for upload:", userData);
      const updateProfile = await fetch("/api/users", {
        method: "POST",
        body: userData,
      });

      if (updateProfile.ok) {
        const data = await updateProfile.json();
        console.log("User updated successfully:", data);
      } else {
        console.error("Failed to upload avatar");
      }

      setAvatarFile(null);
      console.log("Profile update completed");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard");
  };

  // Show loading state if profile is loading
  if (isProfileLoading && !userProfile) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-800"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-60 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  // Show wallet connection prompt if no wallet is connected
  if (!primaryWallet?.address) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <Card className="max-w-md mx-auto p-6">
          <div className="flex flex-col items-center space-y-4 py-6">
            <User className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Connect your wallet to access your profile and transaction
              history.
            </p>
            <DynamicWidget />
          </div>
        </Card>
      </div>
    );
  }

  const generateInitials = (name: string) => {
    if (!name)
      return primaryWallet?.address?.substring(0, 2).toUpperCase() || "U";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {/* Rest of your profile UI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-card">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={avatarPreview || userProfile?.avatar_url || ""}
                alt={userProfile?.username || "User"}
              />
              <AvatarFallback>
                {generateInitials(userProfile?.username || "")}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">
              {userProfile?.full_name || userProfile?.username}
            </h2>
            <div className="text-sm text-muted-foreground">
              @{userProfile?.username}
            </div>

            <div className="mt-2 w-full">
              <Button variant="outline" className="w-full" asChild>
                {userProfile?.is_creator ? (
                  <Link href="/creator-dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Creator Dashboard
                  </Link>
                ) : (
                  <Link href="/creator-dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Become a Creator
                  </Link>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and profile settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Form fields for profile editing */}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Profile Image</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={avatarPreview || userProfile?.avatar_url || ""}
                            alt={userProfile?.username || "User"}
                          />
                          <AvatarFallback>
                            {generateInitials(userProfile?.username || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <input
                            type="file"
                            id="avatar"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById("avatar")?.click()
                            }
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Change Avatar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        if (userProfile) {
                          setFormData({
                            username: userProfile.username,
                            full_name: userProfile.full_name || "",
                            email: userProfile.email,
                            bio: userProfile.bio || "",
                          });
                          setAvatarFile(null);
                          setAvatarPreview("");
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="wallet">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Information</CardTitle>
                  <CardDescription>
                    Manage your connected wallet and payment settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Connected Wallet
                    </h3>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Wallet className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {primaryWallet?.address}
                          </span>
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              copyToClipboard(primaryWallet?.address || "")
                            }
                            title="Copy address"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View on explorer"
                            asChild
                          >
                            <a
                              href={`https://blockexplorer.electroneum.com/address/${primaryWallet?.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">ETN Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {/* This would come from blockchain API in a real implementation */}
                          43.12 ETN
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          ≈ $12.93 USD
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Transactions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {transactions.length}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-xs"
                          asChild
                        >
                          <Link href="#transaction-history">
                            View transaction history
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div id="transaction-history">
                    <h3 className="text-lg font-medium mb-4">
                      Recent Transactions
                    </h3>
                    {transactions.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg">
                        <p className="text-muted-foreground">
                          No transactions yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.slice(0, 5).map((tx: any) => (
                          <div
                            key={tx.id}
                            className="p-3 border rounded-lg flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium">
                                {tx.transaction_type === "subscription"
                                  ? "Subscription Payment"
                                  : tx.transaction_type === "content_purchase"
                                  ? "Content Purchase"
                                  : tx.transaction_type === "tip"
                                  ? "Tip"
                                  : "Transaction"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-medium ${
                                  tx.status === "completed"
                                    ? "text-green-600 dark:text-green-500"
                                    : ""
                                }`}
                              >
                                {tx.amount.toFixed(2)} ETN
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tx.status}
                              </div>
                            </div>
                          </div>
                        ))}

                        {transactions.length > 5 && (
                          <Button variant="outline" className="w-full">
                            View all transactions
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
