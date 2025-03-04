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

interface CreatorCardProps {
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    category: string;
    subscribers: number;
    bio: string;
    verified: boolean;
  };
}

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      </CardHeader>
      <CardContent className="pt-0 -mt-12">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage src={creator.avatar} alt={creator.name} />
            <AvatarFallback>
              {creator.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <h3 className="font-semibold text-lg">{creator.name}</h3>
              {creator.verified && (
                <CheckCircle className="h-4 w-4 fill-blue-500 text-white" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{creator.username}</p>
            <Badge variant="secondary" className="mt-2">
              {creator.category}
            </Badge>
            <p className="text-sm mt-4 line-clamp-2">{creator.bio}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2 w-full">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {creator.subscribers.toLocaleString()} subscribers
          </span>
        </div>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/profile/${creator.username}`}>Profile</Link>
          </Button>
          <Button className="w-full">Subscribe</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
