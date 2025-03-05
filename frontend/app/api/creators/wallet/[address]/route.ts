import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  // First get the user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("eth_wallet_address", params.address)
    .single();

  if (userError) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Then get the creator profile
  const { data, error } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const body = await req.json();

  // First get the user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("eth_wallet_address", params.address)
    .single();

  if (userError) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // First, update user to be a creator
  await supabase.from("users").update({ is_creator: true }).eq("id", user.id);

  // Then create creator profile
  const { data, error } = await supabase
    .from("creator_profiles")
    .insert({
      user_id: user.id,
      creator_name: body.creator_name,
      category: body.category,
      subscription_price: body.subscription_price,
      etn_payment_address: body.etn_payment_address || params.address,
      banner_url: body.banner_url,
      social_links: body.social_links,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const body = await req.json();

  // First get the user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("eth_wallet_address", params.address)
    .single();

  if (userError) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("creator_profiles")
    .update({
      creator_name: body.creator_name,
      category: body.category,
      subscription_price: body.subscription_price,
      etn_payment_address: body.etn_payment_address,
      banner_url: body.banner_url,
      social_links: body.social_links,
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
