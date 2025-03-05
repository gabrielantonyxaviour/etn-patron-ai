import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const walletAddress = url.searchParams.get("wallet");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("eth_wallet_address", walletAddress)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.eth_wallet_address) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  // Check if user exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("eth_wallet_address", body.eth_wallet_address)
    .single();

  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from("users")
      .update({
        username: body.username,
        email:
          body.email ||
          `${body.eth_wallet_address.substr(0, 8)}@electroneum.user`,
        full_name: body.full_name,
        bio: body.bio,
        avatar_url: body.avatar_url,
        last_login: new Date().toISOString(),
      })
      .eq("eth_wallet_address", body.eth_wallet_address)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } else {
    // Create new user
    const { data, error } = await supabase
      .from("users")
      .insert({
        username:
          body.username || `user_${body.eth_wallet_address.substr(0, 8)}`,
        email:
          body.email ||
          `${body.eth_wallet_address.substr(0, 8)}@electroneum.user`,
        full_name: body.full_name,
        bio: body.bio,
        avatar_url: body.avatar_url,
        eth_wallet_address: body.eth_wallet_address,
        last_login: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  if (!body.eth_wallet_address) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      username: body.username,
      full_name: body.full_name,
      bio: body.bio,
      avatar_url: body.avatar_url,
      email: body.email,
    })
    .eq("eth_wallet_address", body.eth_wallet_address)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
