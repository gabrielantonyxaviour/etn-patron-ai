"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Share2,
  Lock,
  ThumbsUp,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useEnvironmentStore } from "@/components/context";
import { getRawPurchaseContent } from "@/lib/tx";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { electroneum, sepolia } from "viem/chains";
import { deployments } from "@/lib/constants";
import { Hex, parseEther } from "viem";
import Image from "next/image";
import { decrypt } from "@/lib/lit/decrypt";


interface Content {
  id: string;
  caption: string;
  created_at: string;
  creator: {
    id: string;
    verified: boolean;
    user: {
      id: string;
      full_name: string;
      avatar_url: string;
      username: string;
    }
  };
  cipher_text: string;
  content_hash: string;
  content_url: string;
  type: string;
  access_price: string;
  is_premium: boolean;
  views_count: number;
  likes_count: number;
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  likes_count: number;
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const { primaryWallet } = useDynamicContext();
  const { userProfile } = useEnvironmentStore((store) => store)

  const [content, setContent] = useState<Content | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const contentId = typeof params.id === "string" ? params.id : "";

  // Fetch content
  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId) return;

      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/content/${contentId}?user_id=${userProfile?.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setContent(data.content);
          setIsPurchased(data.isPurchased)
          setIsSubscribed(data.isSubscribed)
        } else {
          toast.error("Content not found");
          router.push("/explore");
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId, userProfile]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!contentId) return;

      try {
        const response = await fetch(`/api/comments?content_id=${contentId}`);

        if (response.ok) {
          const data = await response.json();
          setComments(data || []);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [contentId]);

  // // Check if user has liked the content
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!contentId || !userProfile) return;

      try {
        const response = await fetch(
          `/api/likes?content_id=${contentId}&user_id=${userProfile?.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.liked);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [contentId, primaryWallet?.address]);

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
        setContent((prev) => (prev ? { ...prev, is_accessible: true } : null));
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
        setIsPurchased(true);
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

  const handleDecryption = async () => {

    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return;
    }
    if (!primaryWallet?.address || !content) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsPurchasing(true);
      toast.info("Decrypting Content", {
        description: "Verifying ownership of the content via Lit Nodes.",
      });
      await decrypt(content.cipher_text, content.content_hash)
      toast.success("Decryption Success", {
        description: "Successfully decrypted the exclusive content.",
      });
      setIsDecrypted(true);
    } catch (error) {
      console.error("Error purchasing content:", error);
      toast.error("Failed to purchase content. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleToggleLike = async () => {
    if (!userProfile || !content) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userProfile?.id,
          content_id: content.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);

        // Update like count in content
        setContent((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            likes_count: data.liked
              ? prev.likes_count + 1
              : prev.likes_count - 1,
          };
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to like content");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile || !content || !newComment.trim()) {
      toast.error("Please connect your wallet and write a comment");
      return;
    }

    try {
      setIsSubmittingComment(true);

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userProfile?.id,
          content_id: content.id,
          comment: newComment,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
        toast.success("Comment added");
      } else {
        throw new Error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
          <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Content Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The content you&apos;re looking for may have been removed or doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/explore">Explore Content</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Image Content */}
      <div className="mb-8 rounded-lg overflow-hidden border bg-card">
        {content.is_premium && (!isPurchased || !isDecrypted) ? (
          <div className="relative">
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 z-10">
              <Lock className="h-12 w-12 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Premium Content
              </h3>
              {isPurchased ? <p className="text-white/80 text-center mb-4">
                You own this encrypted content.
              </p> : <p className="text-white/80 text-center mb-4">
                Unlock this content for {content.access_price} ETN
              </p>}

              {primaryWallet ? !isPurchased ? (
                <Button
                  onClick={handlePurchaseContent}
                  disabled={isPurchasing}
                  className="min-w-32"
                >
                  {isPurchasing
                    ? "Processing..."
                    : `Purchase (${content.access_price} ETN)`}
                </Button>
              ) : <Button
                onClick={handleDecryption}
                disabled={isPurchasing}
                className="min-w-32"
              >
                {isPurchasing
                  ? <p>Processing...</p>
                  : <div className="flex space-x-2 items-center"><Image src={'/lit.jpeg'} className="rounded-full" width={25} height={25} alt="lit" /><p>Decrypt with Lit</p></div>}
              </Button> : (
                <DynamicWidget />
              )}
            </div>

            {/* Blurred background image */}
            <div className="relative w-full h-80 md:h-[500px]">
              <img
                src={content.content_url}
                alt={content.caption || "Premium content"}
                className="w-full h-full object-cover filter blur-xl"
                style={{ transform: "scale(1.1)" }}
              />
            </div>
          </div>
        ) : (
          <img
            src={content.content_url}
            alt={content.caption || "Content image"}
            className="w-full max-h-[650px] object-contain"
          />
        )}
      </div>

      {/* Creator & Interaction */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/creator/${content.creator.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    content.creator.user.avatar_url ||
                    "/placeholder-avatar.png"
                  }
                  alt={content.creator.user.username}
                />
                <AvatarFallback>
                  {content.creator.user.username
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div>
              <div className="flex items-center">
                <Link
                  href={`/creator/${content.creator.user.id}`}
                  className="font-medium hover:underline"
                >
                  {content.creator.user.full_name ||
                    content.creator.user.username}
                </Link>

                {!content.creator.verified && (
                  <CheckCircle className="h-4 w-4 ml-1 fill-blue-500 text-white" />
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(content.created_at))} ago
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleLike}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                document
                  .getElementById("comments-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <a
                href={`mailto:?subject=Check out this content on ETN Patron AI&body=I found this amazing content on ETN Patron AI: ${window.location.href}`}
              >
                <Share2 className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {content.caption && (
            <p className="whitespace-pre-line">{content.caption}</p>
          )}

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{content.likes_count} likes</span>
            </div>
            <div>
              <Badge variant="outline">
                {content.type || "Art"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Comments Section */}
      <div id="comments-section" className="space-y-6">
        <h2 className="text-xl font-bold">Comments</h2>

        {/* Comment form */}
        {primaryWallet ? (
          <form
            onSubmit={handleSubmitComment}
            className="flex items-center space-x-2"
          >
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmittingComment}
              className="flex-grow"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isSubmittingComment || !newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Card>
            <CardContent className="py-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Connect your wallet to comment
                </p>
                <DynamicWidget />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-6 pb-1">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          comment.user.avatar_url || "/placeholder-avatar.png"
                        }
                        alt={comment.user.username}
                      />
                      <AvatarFallback>
                        {comment.user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-grow">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {comment.user.username}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDistanceToNow(new Date(comment.created_at))}{" "}
                          ago
                        </span>
                      </div>

                      <p className="mt-1 whitespace-pre-line">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pb-2 pt-0">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {comment.likes_count > 0 ? comment.likes_count : "Like"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
