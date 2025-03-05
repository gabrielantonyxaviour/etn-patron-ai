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
