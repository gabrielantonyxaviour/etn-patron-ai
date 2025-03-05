import { CreatorCard } from "@/components/creator-card";

// Dummy data - in a real app, this would come from an API
const FEATURED_CREATORS = [
  {
    id: "1",
    name: "Emma Johnson",
    username: "emmacreates",
    avatar: "/testimonials/1.jpeg",
    category: "Digital Art",
    subscribers: 2456,
    bio: "Digital artist creating vibrant illustrations and concept art",
    verified: true,
  },
  {
    id: "2",
    name: "Alex Chen",
    username: "alexmusic",
    avatar: "/testimonials/2.jpeg",
    category: "Music",
    subscribers: 5789,
    bio: "Independent musician sharing original compositions and covers",
    verified: true,
  },
  {
    id: "3",
    name: "Sarah Williams",
    username: "sarahwrites",
    avatar: "/testimonials/3.jpeg",
    category: "Writing",
    subscribers: 1234,
    bio: "Author sharing short stories and writing tips",
    verified: false,
  },
];

export function FeaturedCreators() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {FEATURED_CREATORS.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  );
}
