import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");

  const { data: content, error } = await supabase
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
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check if premium content is accessible
  if (content.is_premium && wallet) {
    // Get user id from wallet
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("eth_wallet_address", wallet)
      .single();

    if (user) {
      // Check if user has active subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("creator_id", content.creator_id)
        .eq("is_active", true)
        .single();

      // Check if user has purchased this content
      const { data: transaction } = await supabase
        .from("transactions")
        .select("*")
        .eq("sender_id", user.id)
        .eq("content_id", content.id)
        .eq("status", "completed")
        .single();

      content.is_accessible = !!subscription || !!transaction;
    } else {
      content.is_accessible = false;
    }
  } else if (content.is_premium) {
    content.is_accessible = false;
  } else {
    content.is_accessible = true;
  }

  // Increment view count
  await supabase.rpc("increment_view_count", { content_id: params.id });

  return NextResponse.json(content);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  if (!body.wallet_address) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  // Check if user is the creator
  const { data: content, error: contentError } = await supabase
    .from("content")
    .select(
      `
      *,
      creator_profiles!content_creator_id_fkey(
        users!creator_profiles_user_id_fkey(eth_wallet_address)
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (contentError) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  if (
    content.creator_profiles.users.eth_wallet_address.toLowerCase() !==
    body.wallet_address.toLowerCase()
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("content")
    .update({
      title: body.title,
      description: body.description,
      content_url: body.content_url,
      thumbnail_url: body.thumbnail_url,
      content_type: body.content_type,
      is_premium: body.is_premium,
      access_price: body.access_price,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  // Check if user is the creator
  const { data: content, error: contentError } = await supabase
    .from("content")
    .select(
      `
      *,
      creator_profiles!content_creator_id_fkey(
        users!creator_profiles_user_id_fkey(eth_wallet_address)
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (contentError) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  if (
    content.creator_profiles.users.eth_wallet_address.toLowerCase() !==
    wallet.toLowerCase()
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { error } = await supabase.from("content").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
