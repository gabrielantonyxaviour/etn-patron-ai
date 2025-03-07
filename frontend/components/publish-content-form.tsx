"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { publishContent } from "@/lib/tx";
import { useEnvironmentStore } from "./context";
import { uploadImageToPinata } from "@/lib/pinata";
import { encrypt } from "@/lib/lit/encrypt";

interface PublishContentFormProps {
  creatorId?: string;
  walletAddress?: string;
}

interface FormState {
  caption: string;
  category: string;
  price: string;
  isPremium: boolean;
  contentFile: File | null;
}

export function PublishContentForm({
  creatorId,
  walletAddress,
}: PublishContentFormProps) {
  const { publicClient, walletClient } = useEnvironmentStore((store) => store);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormState>({
    caption: "",
    category: "",
    price: "5.00",
    isPremium: false,
    contentFile: null,
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      setFormData((prev) => ({
        ...prev,
        contentFile: file,
      }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!creatorId || !walletAddress) {
      toast.error("Creator information is missing");
      return;
    }

    if (!formData.caption || !formData.category || !formData.contentFile) {
      toast.error("Missing information", {
        description:
          "Please fill in all required fields and upload your content",
      });
      return;
    }

    if (!walletClient || !publicClient) {
      toast.error("Missing clients", {
        description: "Public and Wallet Clients are not initialized",
      });
      return;
    }
    const isProduction = JSON.parse(
      process.env.NEXT_PUBLIC_IS_PRODUCTION || "false"
    );

    try {
      setIsLoading(true);

      toast.info("Encrypting Content", {
        description: "Your post is getting encrypted using Lit Protocol",
      });

      const imageUrl = await uploadImageToPinata(formData.contentFile);

      let modifiedContent: string = "";
      let dataHash: string = "";

      if (formData.isPremium) {
        const { ciphertext, dataToEncryptHash } = await encrypt(imageUrl);
        dataHash = dataToEncryptHash;
        modifiedContent = ciphertext;
      } else {
        modifiedContent = imageUrl;
      }

      toast.info("Encryption Complete", {
        description: "Waiting to send a transaction to store the post on-chain",
      });

      const { hash, error } = await publishContent(
        publicClient,
        walletClient,
        modifiedContent,
        BigInt(parseFloat(formData.price)),
        formData.isPremium
      );
      if (hash.length > 0) {
        console.log("Transaction Success");
        console.log(hash);
        const createPostData = new FormData();

        // Add user data to FormData
        createPostData.append("caption", formData.caption);
        createPostData.append("post", formData.contentFile);
        createPostData.append("category", formData.category);
        createPostData.append("isPremium", formData.isPremium.toString());
        createPostData.append("isPremium", formData.price);
        createPostData.append("txHash", hash);
        createPostData.append("dataHash", dataHash);

        // Create content
        const response = await fetch("/api/content", {
          method: "POST",
          body: createPostData,
        });

        if (!response.ok) {
          throw new Error("Failed to publish content");
        }

        // Reset form
        setFormData({
          contentFile: null,
          isPremium: false,
          caption: "",
          category: "",
          price: "0.00",
        });
        toast.success("Transaction Success", {
          description: "Your post is posted on the Electroneum Blockchain.",
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
        });
      } else {
        toast.error("Transaction Failed", {
          description: "Something went wrong, Please Try Again. " + error,
        });
        return;
      }
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
      className="flex flex-col flex-grow overflow-hidden"
      onSubmit={handleSubmit}
    >
      <div className="flex-grow overflow-y-auto px-6">
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Content Caption</Label>
            <Input
              id="caption"
              placeholder="Give your content a descriptive title"
              value={formData.caption}
              onChange={handleInputChange}
              required
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
                {formData.contentFile
                  ? formData.contentFile.name
                  : "Drag & drop your content file here"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports PNG, JPEG, JPG (max 10MB)
              </p>
              <input
                type="file"
                id="contentFileInput"
                className="hidden"
                onChange={(e) => handleFileChange(e)}
              />
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  document.getElementById("contentFileInput")?.click()
                }
              >
                Select File
              </Button>
            </div>
          </div>

          {formData.isPremium && (
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
                required={formData.isPremium}
              />
              <p className="text-sm text-muted-foreground">
                Set the price fans will pay to access this content.
              </p>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="premium"
              checked={formData.isPremium}
              onCheckedChange={(val) => {
                setFormData((d) => ({
                  ...d,
                  isPremium: val,
                }));
              }}
            />
            <Label htmlFor="premium">Premium Content</Label>
          </div>
        </div>
      </div>
      <div className="p-6 pt-4 flex-shrink-0 border-t">
        <Button type="submit" className="w-full " disabled={isLoading}>
          {isLoading ? "Publishing..." : "Publish Content"}
        </Button>
      </div>
    </form>
  );
}
