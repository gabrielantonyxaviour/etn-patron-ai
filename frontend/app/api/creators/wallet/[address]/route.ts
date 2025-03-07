import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  const { address } = await context.params; // Ensure params are awaited

  // First get the user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("eth_wallet_address", address)
    .single();

  if (userError) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Then get the creator profile
  const { data, error } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const responseData = {
    id: data.id,
    category: data.category,
    created_at: data.created_at,
    sub_price: data.sub_price,
    banner_url: data.banner_url,
    verified: data.verified,
    social_links: data.social_links,
    user: {
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      full_name: user.full_name,
      email: user.email,
    },
  };

  return NextResponse.json(responseData || null);
}
