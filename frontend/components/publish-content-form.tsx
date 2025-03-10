"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getRawPublishContent } from "@/lib/tx";
import { useEnvironmentStore } from "./context";
import { uploadImageToPinata } from "@/lib/pinata";
import { encrypt } from "@/lib/lit/encrypt";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { deployments } from "@/lib/constants";
import { electroneum, sepolia } from "viem/chains";
import { decodeAbiParameters, Hex, parseEther } from "viem";
import Image from "next/image";
import { uintToUuid } from "@/lib/utils";

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
interface PublishContentFormProps {
  creatorId: string;
  addContent: (content: ContentItem) => void;
}

interface FormState {
  caption: string;
  category: string;
  price: string;
  isPremium: boolean;
  contentFile: File | null;
}

export function PublishContentForm({
  creatorId, addContent
}: PublishContentFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { primaryWallet } = useDynamicContext();
  const { userProfile } = useEnvironmentStore((store) => store)

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
    console.log(creatorId)
    if (!creatorId) {
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

    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
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
      console.log("Uploading image to Pinata...");
      const imageUrl = await uploadImageToPinata(formData.contentFile);
      console.log("Image uploaded to Pinata:", imageUrl);

      let modifiedContent: string = "";
      let dataHash: string = "";
      if (formData.isPremium) {
        console.log("Encrypting content for premium post...");
        const { ciphertext, dataToEncryptHash } = await encrypt(imageUrl);
        dataHash = dataToEncryptHash;
        modifiedContent = ciphertext;
        console.log("Content encrypted:", ciphertext);
        console.log("Data hash:", dataToEncryptHash);

        toast.success("Encryption Complete", {
          description: "Waiting to send a transaction to store the post on-chain",
        });
      }

      const data = getRawPublishContent(
        modifiedContent,
        parseEther(formData.isPremium ? formData.price : "0"),
        formData.isPremium
      ) as Hex;
      const walletClient = await primaryWallet.getWalletClient();
      const publicClient = await primaryWallet.getPublicClient();
      const hash = await walletClient.sendTransaction({
        to: deployments[isProduction ? electroneum.id : sepolia.id],
        data: data,
      });
      if (hash.length > 0) {
        console.log("Transaction Success");
        console.log(hash);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash,
        })
        const contentId = decodeAbiParameters(
          [{ type: 'uint256' }],
          receipt.logs[0].topics[1] as Hex
        )[0];

        console.log({
          id: uintToUuid(contentId),
          creator_id: creatorId,
          user_id: userProfile?.id,
          caption: formData.caption,
          post_url: imageUrl,
          category: formData.category,
          is_premium: formData.isPremium,
          price: formData.isPremium ? formData.price : "0",
          content_hash: dataHash,
          cipher_text: modifiedContent,
          tx_hash: hash
        })
        const response = await fetch("/api/content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: uintToUuid(contentId),
            creator_id: creatorId,
            user_id: userProfile?.id,
            caption: formData.caption,
            post_url: imageUrl,
            category: formData.category,
            is_premium: formData.isPremium,
            price: formData.isPremium ? formData.price : "0",
            content_hash: dataHash,
            cipher_text: modifiedContent,
            tx_hash: hash
          }),
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
        const contentData = await response.json()
        addContent(contentData)
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
          description: "Something went wrong, Please Try Again. ",
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
            {formData.contentFile && (
              <Image
                className="mb-4 mx-auto rounded-md"
                src={URL.createObjectURL(formData.contentFile)}
                alt="Uploaded content"
                width={200}
                height={200}
              />
            )}
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
                accept="image/*"
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
