"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PublishContentFormProps {
  creatorId?: string;
  walletAddress?: string;
}

interface FormState {
  title: string;
  description: string;
  category: string;
  price: string;
}

export function PublishContentForm({
  creatorId,
  walletAddress,
}: PublishContentFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<FormState>({
    title: "",
    description: "",
    category: "",
    price: "5.00",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fileType: "content" | "thumbnail"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === "content") {
        setContentFile(file);
      } else if (fileType === "thumbnail") {
        setThumbnailFile(file);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!creatorId || !walletAddress) {
      toast.error("Creator information is missing");
      return;
    }

    if (!formData.title || !formData.category || !contentFile) {
      toast.error("Missing information", {
        description:
          "Please fill in all required fields and upload your content",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Upload content file
      const contentFormData = new FormData();
      contentFormData.append("file", contentFile);
      contentFormData.append("wallet", walletAddress);
      contentFormData.append("contentType", formData.category);

      const contentUploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: contentFormData,
      });

      if (!contentUploadResponse.ok) {
        throw new Error("Failed to upload content file");
      }

      const contentData = await contentUploadResponse.json();
      const contentUrl = contentData.url;

      // Upload thumbnail if provided
      let thumbnailUrl = "";
      if (thumbnailFile) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append("file", thumbnailFile);
        thumbnailFormData.append("wallet", walletAddress);
        thumbnailFormData.append("contentType", "thumbnail");

        const thumbnailUploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: thumbnailFormData,
        });

        if (thumbnailUploadResponse.ok) {
          const thumbnailData = await thumbnailUploadResponse.json();
          thumbnailUrl = thumbnailData.url;
        }
      }

      // Create content
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creator_id: creatorId,
          wallet_address: walletAddress,
          title: formData.title,
          description: formData.description,
          content_type: formData.category,
          content_url: contentUrl,
          thumbnail_url: thumbnailUrl,
          is_premium: isPremium,
          access_price: isPremium ? parseFloat(formData.price) : 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish content");
      }

      toast.success("Your content has been published");

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        price: "5.00",
      });
      setIsPremium(false);
      setContentFile(null);
      setThumbnailFile(null);
    } catch (error) {
      console.error("Error publishing content:", error);
      toast.error("Failed to publish content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      id="publish-content-form"
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Content Title</Label>
        <Input
          id="title"
          placeholder="Give your content a descriptive title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your content"
          className="min-h-32"
          value={formData.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.category}
          onChange={handleInputChange}
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
        <Label>Content File</Label>
        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            {contentFile
              ? contentFile.name
              : "Drag & drop your content file here"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports images, audio, video, PDF, and more (max 500MB)
          </p>
          <input
            type="file"
            id="contentFileInput"
            className="hidden"
            onChange={(e) => handleFileChange(e, "content")}
          />
          <Button
            variant="outline"
            type="button"
            onClick={() => document.getElementById("contentFileInput")?.click()}
          >
            Select File
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Thumbnail Image (Optional)</Label>
        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            {thumbnailFile ? thumbnailFile.name : "Upload a thumbnail image"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            This will be displayed as the preview image (recommended)
          </p>
          <input
            type="file"
            id="thumbnailFileInput"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, "thumbnail")}
          />
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              document.getElementById("thumbnailFileInput")?.click()
            }
          >
            Select Image
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="premium"
          checked={isPremium}
          onCheckedChange={setIsPremium}
        />
        <Label htmlFor="premium">Premium Content</Label>
      </div>

      {isPremium && (
        <div className="space-y-2">
          <Label htmlFor="price">Price (ETN)</Label>
          <Input
            id="price"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="5.00"
            value={formData.price}
            onChange={handleInputChange}
            required={isPremium}
          />
          <p className="text-sm text-muted-foreground">
            Set the price fans will pay to access this content.
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Publishing..." : "Publish Content"}
      </Button>
    </form>
  );
}
