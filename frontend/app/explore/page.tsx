import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter } from "lucide-react";
import Link from "next/link";
import { CreatorCard } from "@/components/creator-card";
import { ContentCard } from "@/components/content-card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Explore Creators | ETN Patron AI",
  description: "Discover content creators and support them with micro-payments",
};

// Dummy data - in a real app, this would come from an API
const FEATURED_CREATORS = [
  {
    id: "1",
    name: "Emma Johnson",
    username: "emmacreates",
    avatar: "https://i.pravatar.cc/298",
    category: "Digital Art",
    subscribers: 2456,
    bio: "Digital artist creating vibrant illustrations and concept art",
    verified: true,
  },
  {
    id: "2",
    name: "Alex Chen",
    username: "alexmusic",
    avatar: "https://i.pravatar.cc/300",
    category: "Music",
    subscribers: 5789,
    bio: "Independent musician sharing original compositions and covers",
    verified: true,
  },
  {
    id: "3",
    name: "Sarah Williams",
    username: "sarahwrites",
    avatar: "https://i.pravatar.cc/301",
    category: "Writing",
    subscribers: 1234,
    bio: "Author sharing short stories and writing tips",
    verified: false,
  },
  {
    id: "4",
    name: "Michael Brown",
    username: "mikevlogs",
    avatar: "https://i.pravatar.cc/302",
    category: "Video",
    subscribers: 8765,
    bio: "Travel vlogger exploring hidden gems around the world",
    verified: true,
  },
  {
    id: "5",
    name: "Jessica Lee",
    username: "jesscrafts",
    avatar: "https://i.pravatar.cc/303",
    category: "Crafts",
    subscribers: 3421,
    bio: "DIY enthusiast sharing craft tutorials and home decor ideas",
    verified: true,
  },
  {
    id: "6",
    name: "David Miller",
    username: "davidcodes",
    avatar: "https://i.pravatar.cc/299",
    category: "Programming",
    subscribers: 6543,
    bio: "Software developer teaching coding and sharing open source projects",
    verified: false,
  },
];

const TRENDING_CONTENT = [
  {
    id: "1",
    title: "Creating Digital Landscapes with Procreate",
    creator: {
      id: "1",
      name: "Emma Johnson",
      username: "emmacreates",
      avatar: "https://i.pravatar.cc/298",
      verified: true,
    },
    thumbnail: "/content/thumb1.jpg",
    category: "Digital Art",
    price: "2.00",
    isPremium: true,
    views: 4567,
  },
  {
    id: "2",
    title: "New Album Release: Echoes of Tomorrow",
    creator: {
      id: "2",
      name: "Alex Chen",
      username: "alexmusic",
      avatar: "https://i.pravatar.cc/300",
      verified: true,
    },
    thumbnail: "/content/thumb2.jpg",
    category: "Music",
    price: "5.00",
    isPremium: true,
    views: 8901,
  },
  {
    id: "3",
    title: "Crafting Compelling Characters",
    creator: {
      id: "3",
      name: "Sarah Williams",
      username: "sarahwrites",
      avatar: "https://i.pravatar.cc/301",
      verified: false,
    },
    thumbnail: "/content/thumb3.jpg",
    category: "Writing",
    price: "0",
    isPremium: false,
    views: 3456,
  },
  {
    id: "4",
    title: "Hidden Beaches of Southeast Asia",
    creator: {
      id: "4",
      name: "Michael Brown",
      username: "mikevlogs",
      avatar: "https://i.pravatar.cc/302",
      verified: true,
    },
    thumbnail: "/content/thumb4.jpg",
    category: "Video",
    price: "3.50",
    isPremium: true,
    views: 9876,
  },
];

export default function ExplorePage() {
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
            <Input placeholder="Search creators..." className="pl-8" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="creators" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="creators">Creators</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="creators">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_CREATORS.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {TRENDING_CONTENT.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="categories">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Digital Art",
              "Music",
              "Writing",
              "Video",
              "Photography",
              "Programming",
              "Design",
              "Crafts",
            ].map((category) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TRENDING_CONTENT.slice(0, 4).map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </section>
    </div>
  );
}
