import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");
  const creatorId = url.searchParams.get("creatorId");

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  // Get user id from wallet
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("eth_wallet_address", wallet)
    .single();

  if (!user) {
    return NextResponse.json([]);
  }

  let query = supabase
    .from("subscriptions")
    .select(
      `
      *,
      creator_profiles!subscriptions_creator_id_fkey(
        id, 
        creator_name,
        users!creator_profiles_user_id_fkey(username, avatar_url, eth_wallet_address)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (creatorId) {
    query = query.eq("creator_id", creatorId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}


export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.user_id || !body.amount || !body.tx_hash || !body.creator_id) {
    return NextResponse.json(
      { error: "Required fields missing" },
      { status: 400 }
    );
  }

  console.log(body)

  const { data: txData, error: txError } = await supabase.from("transactions").insert({
    sender_id: body.user_id,
    recipient_id: body.creator_id,
    content_id: null,
    desc: "Subscribe Creator",
    tx_hash: body.tx_hash,
    type: "subscription",
    amount: body.amount
  })
  if (txError) {
    console.log(txError)
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: body.user_id,
      creator_id: body.creator_id,
      price_paid: body.amount,
      is_active: true,
    })
  if (error) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}