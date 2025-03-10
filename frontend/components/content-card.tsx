import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, Lock, Router } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { toast } from "sonner";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { getRawPurchaseContent } from "@/lib/tx";
import { Hex, parseEther } from "viem";
import { electroneum, sepolia } from "viem/chains";
import { deployments } from "@/lib/constants";
import { useEnvironmentStore } from "./context";

interface ContentCardProps {
  content: {
    id: string;
    caption: string;
    created_at: string;
    creator: {
      id: string;
      verified: boolean;
      user: {
        full_name: string;
        avatar_url: string;
        username: string;
      }
    };
    content_hash: string;
    content_url: string;
    type: string;
    access_price: string;
    is_premium: boolean;
    views_count: number;
    likes_count: number;
  };
}


export function ContentCard({ content }: ContentCardProps) {
  const router = useRouter();
  const { primaryWallet } = useDynamicContext()
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { userProfile } = useEnvironmentStore((store) => store)
  const handlePurchaseContent = async () => {

    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return;
    }
    if (!primaryWallet?.address || !content) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsPurchasing(true);

      toast.info("Purchasing Content", {
        description: "Initiating Transaction to purchase the content.",
      });
      const isProduction = JSON.parse(
        process.env.NEXT_PUBLIC_IS_PRODUCTION || "false"
      );
      const data = getRawPurchaseContent(BigInt("1")) as Hex;
      const walletClient = await primaryWallet.getWalletClient();
      const hash = await walletClient.sendTransaction({
        to: deployments[isProduction ? electroneum.id : sepolia.id],
        data: data,
        value: parseEther(content.access_price ? content.access_price.toString() : "0"),
      });
      // Create transaction
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userProfile?.id,
          content_id: content.id,
          amount: content.access_price,
          tx_hash: hash,
          creator_id: content.creator.id,
        }),
      });

      if (response.ok) {
        toast.success("Transaction Success", {
          description: "Content is Purchased Successfully.",
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
        setIsUnlocked(true);
      } else {
        throw new Error("Purchase failed");
      }
    } catch (error) {
      console.error("Error purchasing content:", error);
      toast.error("Failed to purchase content. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/content/${content.id}`}>
        <CardHeader className="p-0">
          <div className="relative h-48 bg-muted">
            <div
              className={`absolute inset-0 bg-center bg-cover ${content.is_premium ? "blur-md" : ""}`}
              style={{ backgroundImage: `url(${content.content_url})` }}
            />
            {content.is_premium && (
              <>

                <div className="absolute top-2 right-2">
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 gap-1"
                  >
                    <Lock className="h-3 w-3" />
                    Premium
                  </Badge>
                </div>
              </>
            )}
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="bg-background/80 gap-1">
                <Eye className="h-3 w-3" />
                {content.views_count.toLocaleString()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{content.type}</Badge>
          {content.is_premium ? (
            <div className="text-sm font-medium">{content.access_price} ETN</div>
          ) : (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Free
            </Badge>
          )}
        </div>
        <Link href={`/content/${content.id}`} className="hover:underline">
          <h3 className="font-semibold line-clamp-2 mb-2">{content.caption}</h3>
        </Link>
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage
              src={content.creator.user.avatar_url}
              alt={content.creator.user.full_name}
            />
            <AvatarFallback>
              {content.creator.user.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center">
            <span className="text-sm">{content.creator.user.full_name}</span>
            {content.creator.verified && (
              <CheckCircle className="h-3 w-3 ml-1 fill-blue-500 text-white" />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full gap-2">
          {content.is_premium && !isUnlocked ? (
            <Button onClick={handlePurchaseContent} className="w-full" disabled={isPurchasing}>{isPurchasing ? "Purchasing..." : `Purchase ${content.access_price} ETN`}</Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => {
              router.push(`/content/${content.id}`)
            }}>
              View Content
            </Button>
          )}
          <Button variant="outline" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-heart"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}