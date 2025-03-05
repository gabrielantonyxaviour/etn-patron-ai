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
import { Upload } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEnvironmentStore } from "./context";

export function ProfileCreationModal() {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateUserProfile,
    isProfileLoading,
  } = useEnvironmentStore((store) => store);
  const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: `${primaryWallet?.address?.substring(0, 8)}@electroneum.user` || "",
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
      // Upload avatar if selected
      let avatarUrl = "";
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("wallet", primaryWallet.address);
        formData.append("contentType", "avatar");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          avatarUrl = data.url;
        }
      }

      // Create user profile
      const success = await updateUserProfile(
        {
          ...formData,
          avatar_url: avatarUrl || formData.avatar_url,
        },
        primaryWallet.address
      );

      if (success) {
        setIsProfileModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Your Profile</DialogTitle>
            <DialogDescription>
              Please set up your profile to continue using ETN Patron AI
              platform.
            </DialogDescription>
          </DialogHeader>

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
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your email address"
                required
              />
              <p className="text-xs text-muted-foreground">
                We'll never share your email with anyone else.
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
              <div className="p-2 bg-muted rounded-md text-sm overflow-hidden text-ellipsis">
                {primaryWallet?.address || "Not connected"}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Profile..." : "Create Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
