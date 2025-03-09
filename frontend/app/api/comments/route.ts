import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const contentId = url.searchParams.get("content_id");

  if (!contentId) {
    return NextResponse.json({ error: "Content ID required" }, { status: 400 });
  }

  console.log("CONTENT ID")
  console.log(contentId)

  const query = supabase
    .from("comments")
    .select(
      `
      *,
      user:user_id(username, avatar_url, eth_wallet_address)
    `
    )
    .eq("content_id", contentId)
    .order("created_at", { ascending: false })

  const { data, error, count } = await query;
  console.log(data)
  console.log(error)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.user_id || !body.content_id || !body.comment) {
    return NextResponse.json(
      { error: "Required fields missing" },
      { status: 400 }
    );
  }


  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: body.user_id,
      content_id: body.content_id,
      comment: body.comment,
    })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
