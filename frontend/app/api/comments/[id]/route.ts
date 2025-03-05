import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

  // Get user from wallet
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("eth_wallet_address", wallet)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if the comment belongs to the user
  const { data: comment } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", params.id)
    .single();

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (comment.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  if (!body.wallet || !body.comment_text) {
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

  // Check if the comment belongs to the user
  const { data: comment } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", params.id)
    .single();

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (comment.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("comments")
    .update({
      comment_text: body.comment_text,
    })
    .eq("id", params.id)
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
