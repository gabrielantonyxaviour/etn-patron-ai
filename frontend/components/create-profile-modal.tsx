"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEnvironmentStore } from "./context";
import { toast } from "sonner";

export function ProfileCreationModal() {
  const { isProfileModalOpen, setIsProfileModalOpen, setUserProfile } =
    useEnvironmentStore((store) => store);
  const { primaryWallet, user } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: user?.email || "",
    bio: "",
    avatar_url: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

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
    if (!primaryWallet?.address) return;

    setIsLoading(true);
    try {
      // Create FormData for the request
      const userData = new FormData();

      // Add user data to FormData
      userData.append("username", formData.username);
      userData.append("full_name", formData.full_name || "");
      userData.append("email", formData.email);
      userData.append("bio", formData.bio || "");
      userData.append("eth_wallet_address", primaryWallet.address);

      // Add avatar file if selected
      if (avatarFile) {
        userData.append("avatar", avatarFile);
      }

      // Send request to create user endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: userData,
      });

      const result = await response.json();

      if (response.ok) {
        // Update global state with the new user profile
        setUserProfile(result.user);

        // Close the modal
        setIsProfileModalOpen(false);

        // Optional: Show success message
        toast.success("Profile created successfully!");
      } else {
        // Handle error response
        console.error("Error creating profile:", result.error);
        toast?.error(result.error || "Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast?.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  // Force modal to stay open if no profile
  const handleOpenChange = (open: boolean) => {
    if (open === false && !isLoading) {
      setIsProfileModalOpen(false);
    }
  };

  const generateInitials = (name: string) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isProfileModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sen sm:max-w-[500px] h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-2 flex-shrink-0">
          <DialogTitle>Create Your Profile</DialogTitle>
          <DialogDescription>
            Please set up your profile to continue using ETN Patron AI.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-grow overflow-hidden"
        >
          <div className="flex-grow overflow-y-auto px-6">
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback>
                    {generateInitials(formData.username)}
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
                    onClick={() => document.getElementById("avatar")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Avatar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="required">
                  Username
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a unique username"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be your unique identifier on the platform.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Your name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="required">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email}
                  placeholder="Your email address"
                  required
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll never share your email with anyone else.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us a little about yourself (optional)"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <Input
                  id="wallet"
                  type="wallet"
                  value={primaryWallet?.address || "Not Connected"}
                  placeholder="Your address"
                  required
                  disabled
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 flex-shrink-0 border-t">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Profile..." : "Create Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
