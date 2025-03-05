"use client";

import { useEffect, useState } from "react";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, CircleDashedIcon } from "lucide-react";
import Link from "next/link";
import { CreatorCard } from "@/components/creator-card";
import { ContentCard } from "@/components/content-card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams, useRouter } from "next/navigation";

// Define types for our data
interface Creator {
  id: string;
  creator_name: string;
  category: string;
  users: {
    username: string;
    avatar_url: string;
  };
  subscribers_count?: number;
  bio?: string;
  verified?: boolean;
}

interface Content {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  content_type: string;
  is_premium: boolean;
  access_price: number;
  views_count: number;
  creator_profiles: {
    id: string;
    creator_name: string;
    users: {
      username: string;
      avatar_url: string;
    };
  };
}

// Categories displayed on the Categories tab
const CATEGORIES = [
  "Digital Art",
  "Music",
  "Writing",
  "Video",
  "Photography",
  "Programming",
  "Design",
  "Crafts",
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("creators");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");

  // Fetch creators from API
  useEffect(() => {
    async function fetchCreators() {
      try {
        setIsLoading(true);
        const url = new URL(`${window.location.origin}/api/creators`);

        if (category) {
          url.searchParams.append("category", category);
        }

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.creators) {
          setCreators(data.creators);
        }
      } catch (error) {
        console.error("Error fetching creators:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreators();
  }, [category]);

  // Fetch content from API
  useEffect(() => {
    async function fetchContent() {
      try {
        setIsLoading(true);
        const url = new URL(`${window.location.origin}/api/content`);

        if (category) {
          url.searchParams.append("contentType", category);
        }

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.content) {
          setContent(data.content);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [category]);

  // Fetch trending content from API
  useEffect(() => {
    async function fetchTrendingContent() {
      try {
        const url = new URL(`${window.location.origin}/api/content`);
        url.searchParams.append("limit", "4");

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.content) {
          // Sort by views to get trending content
          const sorted = [...data.content].sort(
            (a, b) => b.views_count - a.views_count
          );
          setTrendingContent(sorted);
        }
      } catch (error) {
        console.error("Error fetching trending content:", error);
      }
    }

    fetchTrendingContent();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter creators/content based on search query
  const filteredCreators = creators.filter(
    (creator) =>
      creator.creator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.users.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      creator.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator_profiles.creator_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore Creators</h1>
          <p className="text-muted-foreground">
            Discover and support amazing content creators
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(category ? "/" : "/explore?filter=all")}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="creators"
        className="mb-8"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="creators">Creators</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="creators">
          {isLoading ? (
            <div className=" flex justify-center items-center space-x-2">
              <CircleDashedIcon className="h-6 w-6 animate-spin text-white" />
              <p className="sen text-white">Loading creators</p>
            </div>
          ) : filteredCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={{
                    id: creator.id,
                    name: creator.creator_name,
                    username: creator.users.username,
                    avatar:
                      creator.users.avatar_url || "https://i.pravatar.cc/150",
                    category: creator.category,
                    subscribers: creator.subscribers_count || 0,
                    bio: creator.bio || "No bio available",
                    verified: creator.verified || false,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              No creators found. Try adjusting your search.
            </div>
          )}
        </TabsContent>
        <TabsContent value="content">
          {isLoading ? (
            <div className=" flex justify-center items-center space-x-2">
              <CircleDashedIcon className="h-6 w-6 animate-spin text-white" />
              <p className="sen text-white">Loading content</p>
            </div>
          ) : filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContent.map((item) => (
                <ContentCard
                  key={item.id}
                  content={{
                    id: item.id,
                    title: item.title,
                    creator: {
                      id: item.creator_profiles.id,
                      name: item.creator_profiles.creator_name,
                      username: item.creator_profiles.users.username,
                      avatar:
                        item.creator_profiles.users.avatar_url ||
                        "https://i.pravatar.cc/150",
                      verified: false, // You might want to add this to your API
                    },
                    thumbnail: item.thumbnail_url || "/content/placeholder.jpg",
                    category: item.content_type,
                    price: item.access_price.toString(),
                    isPremium: item.is_premium,
                    views: item.views_count,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              No content found. Try adjusting your search.
            </div>
          )}
        </TabsContent>
        <TabsContent value="categories">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Card
                key={category}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/explore?category=${encodeURIComponent(category)}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Explore {category.toLowerCase()} creators and their
                      content
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trending Content</h2>
          <Button variant="ghost" asChild>
            <Link href="/explore?filter=trending">View All</Link>
          </Button>
        </div>
        {trendingContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trendingContent.map((item) => (
              <ContentCard
                key={item.id}
                content={{
                  id: item.id,
                  title: item.title,
                  creator: {
                    id: item.creator_profiles.id,
                    name: item.creator_profiles.creator_name,
                    username: item.creator_profiles.users.username,
                    avatar:
                      item.creator_profiles.users.avatar_url ||
                      "https://i.pravatar.cc/150",
                    verified: false,
                  },
                  thumbnail: item.thumbnail_url || "/content/placeholder.jpg",
                  category: item.content_type,
                  price: item.access_price.toString(),
                  isPremium: item.is_premium,
                  views: item.views_count,
                }}
              />
            ))}
          </div>
        ) : (
          <div className=" flex justify-center items-center space-x-2">
            <CircleDashedIcon className="h-6 w-6 animate-spin text-white" />
            <p className="sen text-white">Loading Trending Content</p>
          </div>
        )}
      </section>
    </div>
  );
}
