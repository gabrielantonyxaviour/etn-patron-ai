'use client';
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
import { CheckCircle, Users } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface CreatorCardProps {
  creator: {
    id: string;
    category: string;
    banner_url: string;
    social_links: {
      twitter: string;
      instagram: string;
    },
    sub_price: number;
    updated_at: string;
    created_at: string;
    users: {
      id: string;
      eth_wallet_address: string;
      bio: string;
      email: string;
      username: string;
      full_name: string;
      avatar_url: string;
    };
    subscriber_count: number;
    verified: boolean;
  };
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const router = useRouter()
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      </CardHeader>
      <CardContent className="pt-0 -mt-12">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage src={creator.users ? creator.users.avatar_url : ""} alt={creator.users ? creator.users.full_name : ""} />
            <AvatarFallback>
              {creator.users ? creator.users.full_name.slice(0, 2).toUpperCase() : ""}
            </AvatarFallback>
          </Avatar>
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <h3 className="font-semibold text-lg">{creator.users ? creator.users.full_name : ""}</h3>
              {creator.verified && (
                <CheckCircle className="h-4 w-4 fill-blue-500 text-white" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{creator.users ? creator.users.username : ""}</p>
            <Badge variant="secondary" className="mt-2">
              {creator.category}
            </Badge>
            <p className="text-sm mt-4 line-clamp-2">{creator.users ? creator.users.bio : ""}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2 w-full">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {creator.subscriber_count.toLocaleString()} subscribers
          </span>
        </div>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/creator/${creator.id}`}>Profile</Link>
          </Button>
          <Button className="w-full" onClick={() => {
            router.push(`/creator/${creator.id}`)
          }}>Subscribe</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
