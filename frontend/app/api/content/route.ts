import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const creator_id = url.searchParams.get("creator_id");

  let query = supabase
    .from("content")
    .select("*")
    .eq("creator_id", creator_id)
    .order("created_at", { ascending: false })

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }


  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.creator_id) {
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


  console.log({
    sender_id: body.sender_id,
    recipient_id: null,
    content_id: data.id,
    desc: "Create Post",
    tx_hash: body.txHash,
    type: "create_post",
    amount: 0
  })

  const { data: txData, error: txError } = await supabase.from("transactions").insert({
    sender_id: body.sender_id,
    recipient_id: null,
    content_id: data.id,
    desc: "Create Post",
    tx_hash: body.txHash,
    type: "create_post",
    amount: 0
  })

  if (txError) {
    console.error(`Error creating transaction: ${txError.message}`);
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
