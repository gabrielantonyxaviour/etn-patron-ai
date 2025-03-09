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
import { Suspense } from "react";

// Define types for our data
interface Creator {
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
}

interface Content {
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

function Explore() {
  const [activeTab, setActiveTab] = useState("creators");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");

  // Fetch creators from API
  useEffect(() => {
    async function fetchCreators() {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/creators` + (category ? `?category=${category}` : ""));
        const data = await response.json();
        console.log("FETCH CREATORS", data);
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

        const response = await fetch("/api/content" + (category ? `?type=${category}` : ""));
        const data = await response.json();

        console.log("FETCH CONTENT", data);
        setContent(data);
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
        setIsTrendingLoading(true);
        const response = await fetch("/api/content?limit=4");
        const data = await response.json();

        if (data) {
          // Sort by views to get trending content
          const sorted = [...data].sort(
            (a, b) => b.views_count - a.views_count
          );
          console.log("TRENDING CONTENT", sorted);

          setTrendingContent(sorted);
        }
      } catch (error) {
        console.error("Error fetching trending content:", error);
      }
      setIsTrendingLoading(false);
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
      creator.users.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.users.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      creator.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContent = content.filter(
    (item) =>
      item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator.user.full_name
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
                  creator={creator}
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
                  content={item}
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
                content={item}
              />
            ))}
          </div>
        ) : isTrendingLoading ? (
          <div className=" flex justify-center items-center space-x-2">
            <CircleDashedIcon className="h-6 w-6 animate-spin text-white" />
            <p className="sen text-white">Loading Trending Content</p>
          </div>
        ) : (
          <div className="text-center p-8">
            No content found. Try adjusting your search.
          </div>
        )}
      </section>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <Explore />
    </Suspense>
  );
}
