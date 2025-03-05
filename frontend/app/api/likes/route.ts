import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.wallet || (!body.content_id && !body.comment_id)) {
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

  try {
    // Try to create a like
    const { data, error } = await supabase
      .from("likes")
      .insert({
        user_id: user.id,
        content_id: body.content_id || null,
        comment_id: body.comment_id || null,
      })
      .select()
      .single();

    // Update like count
    if (body.content_id) {
      await supabase.rpc("increment_content_likes", {
        content_id: body.content_id,
      });
    } else if (body.comment_id) {
      await supabase.rpc("increment_comment_likes", {
        comment_id: body.comment_id,
      });
    }

    if (error) {
      // If already liked, handle the unique constraint error
      if (error.code === "23505") {
        // Delete the like instead (unlike functionality)
        await supabase
          .from("likes")
          .delete()
          .match({
            user_id: user.id,
            content_id: body.content_id || null,
            comment_id: body.comment_id || null,
          });

        // Decrement the like count
        if (body.content_id) {
          await supabase.rpc("decrement_content_likes", {
            content_id: body.content_id,
          });
        } else if (body.comment_id) {
          await supabase.rpc("decrement_comment_likes", {
            comment_id: body.comment_id,
          });
        }

        return NextResponse.json({ liked: false });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ liked: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process like" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");
  const contentId = url.searchParams.get("contentId");
  const commentId = url.searchParams.get("commentId");

  if (!wallet || (!contentId && !commentId)) {
    return NextResponse.json(
      { error: "Required parameters missing" },
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
    return NextResponse.json({ liked: false });
  }

  // Check if liked
  const { data, error } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", user.id)
    .eq(contentId ? "content_id" : "comment_id", contentId || commentId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ liked: !!data });
}
