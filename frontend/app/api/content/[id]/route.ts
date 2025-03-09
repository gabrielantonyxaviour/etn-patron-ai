import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");

  const { data: content, error } = await supabase
    .from("content")
    .select(`*, creator:creator_id (
        id,
        category,
        sub_price,
        banner_url,
        social_links,
        verified,
        user:user_id (
          id,
          username,
          email,
          full_name,
          bio,
          avatar_url,
          eth_wallet_address
        )
      )`)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let isPurchased = false;
  let isSubscribed = false;

  // Check if premium content is accessible
  if (content.is_premium) {
    // Get user id from wallet
    const { data: purchase } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user_id)
      .eq("content_id", id)
      .single();

    if (purchase) {
      isPurchased = true;
    }
  } else {
    // Get user id from wallet
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("creator_id", content.creator.id)
      .single();

    if (subscription) {
      isSubscribed = true;
    }
  }

  // Increment view count
  await supabase.rpc("increment_view_count", { content_id: id });

  return NextResponse.json({ content, isSubscribed, isPurchased });
}
