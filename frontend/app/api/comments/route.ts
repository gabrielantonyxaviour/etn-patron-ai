import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const contentId = url.searchParams.get("contentId");
  const parentId = url.searchParams.get("parentId");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const page = parseInt(url.searchParams.get("page") || "0");
  const offset = page * limit;

  if (!contentId) {
    return NextResponse.json({ error: "Content ID required" }, { status: 400 });
  }

  let query = supabase
    .from("comments")
    .select(
      `
      *,
      user:user_id(username, avatar_url, eth_wallet_address),
      reply_count:id(count)
    `
    )
    .eq("content_id", contentId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (parentId) {
    query = query.eq("parent_comment_id", parentId);
  } else {
    query = query.is("parent_comment_id", null);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    comments: data,
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

  if (!body.wallet || !body.content_id || !body.comment_text) {
    return NextResponse.json(
      { error: "Required fields missing" },
      { status: 400 }
    );
  }

  // Get user from wallet
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("eth_wallet_address", body.wallet)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: user.id,
      content_id: body.content_id,
      comment_text: body.comment_text,
      parent_comment_id: body.parent_comment_id || null,
    })
    .select(
      `
      *,
      user:user_id(username, avatar_url, eth_wallet_address)
    `
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
