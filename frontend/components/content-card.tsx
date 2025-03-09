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
import { CheckCircle, Eye, Lock } from "lucide-react";

interface ContentCardProps {
  content: {
    id: string;
    caption: string;
    created_at: string;
    creator_profiles: {
      id: string;
      verified: boolean;
      users: {
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
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/content/${content.id}`}>
        <CardHeader className="p-0">
          <div className="relative h-48 bg-muted">
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url(${content.content_url})` }}
            />
            {content.is_premium && (
              <div className="absolute top-2 right-2">
                <Badge
                  variant="default"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Premium
                </Badge>
              </div>
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
              src={content.creator_profiles.users.avatar_url}
              alt={content.creator_profiles.users.full_name}
            />
            <AvatarFallback>
              {content.creator_profiles.users.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center">
            <span className="text-sm">{content.creator_profiles.users.full_name}</span>
            {content.creator_profiles.verified && (
              <CheckCircle className="h-3 w-3 ml-1 fill-blue-500 text-white" />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full gap-2">
          {content.is_premium ? (
            <Button className="w-full">Purchase {content.access_price} ETN</Button>
          ) : (
            <Button variant="outline" className="w-full">
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
