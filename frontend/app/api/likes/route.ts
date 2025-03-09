import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.user_id || (!body.content_id && !body.comment_id)) {
    return NextResponse.json(
      { error: "Required fields missing" },
      { status: 400 }
    );
  }

  try {
    // Try to create a like
    const { data, error } = await supabase
      .from("likes")
      .insert({
        user_id: body.user_id,
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
            user_id: body.user_id,
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
  const contentId = url.searchParams.get("content_id");
  const userId = url.searchParams.get("user_id");

  if (!userId || !contentId) {
    return NextResponse.json(
      { error: "Required parameters missing" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .single();
  if (!data || error) {
    return NextResponse.json({ error: error ? error.message : "" }, { status: 500 });
  }

  return NextResponse.json({ liked: data ? true : false });
}
