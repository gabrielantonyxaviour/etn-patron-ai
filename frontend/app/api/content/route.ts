import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const creatorId = url.searchParams.get("creatorId");
  const contentType = url.searchParams.get("contentType");
  const isPremium = url.searchParams.get("isPremium");
  const wallet = url.searchParams.get("wallet");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const page = parseInt(url.searchParams.get("page") || "0");
  const offset = page * limit;

  let query = supabase
    .from("content")
    .select(
      `
      *,
      creator_profiles!content_creator_id_fkey(
        id, 
        creator_name,
        users!creator_profiles_user_id_fkey(username, avatar_url, eth_wallet_address)
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (creatorId) {
    query = query.eq("creator_id", creatorId);
  }

  if (contentType) {
    query = query.eq("content_type", contentType);
  }

  if (isPremium) {
    query = query.eq("is_premium", isPremium === "true");
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check if premium content is accessible for the wallet
  if (wallet && data) {
    const accessibleContentIds = new Set();

    // Get user id from wallet
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("eth_wallet_address", wallet)
      .single();

    if (user) {
      // Check active subscriptions
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("creator_id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const subscribedCreatorIds = new Set(
        subscriptions?.map((sub) => sub.creator_id) || []
      );

      // Check purchased content
      const { data: transactions } = await supabase
        .from("transactions")
        .select("content_id")
        .eq("sender_id", user.id)
        .eq("status", "completed")
        .not("content_id", "is", null);

      const purchasedContentIds = new Set(
        transactions?.map((tx) => tx.content_id) || []
      );

      // Mark content as accessible or not
      data.forEach((item) => {
        if (!item.is_premium) {
          item.is_accessible = true;
        } else if (subscribedCreatorIds.has(item.creator_id)) {
          item.is_accessible = true;
        } else if (purchasedContentIds.has(item.id)) {
          item.is_accessible = true;
        } else {
          item.is_accessible = false;
        }
      });
    } else {
      // No user found, mark all premium content as inaccessible
      data.forEach((item) => {
        item.is_accessible = !item.is_premium;
      });
    }
  }

  return NextResponse.json({
    content: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: count ? Math.ceil(count / limit) : 0,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.creator_id || !body.wallet_address) {
    return NextResponse.json(
      { error: "Creator ID and wallet address required" },
      { status: 400 }
    );
  }

  console.log("Input data")
  console.log({
    creator_id: body.creator_id,
    caption: body.caption,
    content_url: body.post_url,
    is_premium: body.is_premium,
    access_price: body.price,
    content_hash: body.content_hash,
    views_count: 0,
    likes_count: 0
  })

  const { data, error } = await supabase
    .from("content")
    .insert({
      creator_id: body.creator_id,
      caption: body.caption,
      content_url: body.post_url,
      is_premium: body.is_premium,
      access_price: body.price,
      content_hash: body.content_hash,
      views_count: 0,
      likes_count: 0
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
