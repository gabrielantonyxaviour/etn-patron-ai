import { CreatorCard } from "@/components/creator-card";

// Dummy data - in a real app, this would come from an API
const FEATURED_CREATORS = [
  {
    id: "c8b7e9a1-f2d3-4e5f-a6b7-c8d9e0f1a2b3",
    category: "Music",
    banner_url: "https://example.com/banners/music-banner.jpg",
    social_links: {
      twitter: "https://twitter.com/musiccreator",
      instagram: "https://instagram.com/musiccreator"
    },
    sub_price: 9.99,
    updated_at: "2025-02-15T14:30:00Z",
    created_at: "2024-12-01T10:15:00Z",
    users: {
      id: "u1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      eth_wallet_address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0",
      bio: "Award-winning music producer and composer with over 10 years of experience in the industry.",
      email: "music@example.com",
      username: "musicmaster",
      full_name: "Alex Johnson",
      avatar_url: "/testimonials/1.jpeg"
    },
    subscriber_count: 1547,
    verified: true
  },
  {
    id: "d7c6b5a4-e3f2-g1h0-i9j8-k7l6m5n4o3p2",
    category: "Art",
    banner_url: "https://example.com/banners/art-banner.jpg",
    social_links: {
      twitter: "https://twitter.com/artcreator",
      instagram: "https://instagram.com/artcreator"
    },
    sub_price: 12.50,
    updated_at: "2025-03-01T09:45:00Z",
    created_at: "2024-11-15T16:20:00Z",
    users: {
      id: "u9a8b7c6-d5e4-f3g2-h1i0-j9k8l7m6n5o4",
      eth_wallet_address: "0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a",
      bio: "Digital artist specializing in surrealist paintings and NFT collections.",
      email: "art@example.com",
      username: "artexplorer",
      full_name: "Jordan Rivera",
      avatar_url: "/testimonials/2.jpeg"
    },
    subscriber_count: 983,
    verified: true
  },
  {
    id: "e5f4g3h2-i1j0-k9l8-m7n6-o5p4q3r2s1t0",
    category: "Photography",
    banner_url: "https://example.com/banners/photo-banner.jpg",
    social_links: {
      twitter: "https://twitter.com/photocreator",
      instagram: "https://instagram.com/photocreator"
    },
    sub_price: 7.99,
    updated_at: "2025-02-20T11:25:00Z",
    created_at: "2025-01-05T08:40:00Z",
    users: {
      id: "u5t4s3r2-q1p0-o9n8-m7l6-k5j4i3h2g1f0",
      eth_wallet_address: "0x5g4h3i2j1k0l9m8n7o6p5q4r3s2t1u0v9w8x7y6",
      bio: "Landscape and wildlife photographer who has traveled to over 50 countries capturing rare moments in nature.",
      email: "photo@example.com",
      username: "photowanderer",
      full_name: "Sam Chen",
      avatar_url: "/testimonials/3.jpeg"
    },
    subscriber_count: 2351,
    verified: false
  }
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
