import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  const { address } = await context.params; // Ensure params are awaited

  // First get the user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("eth_wallet_address", address)
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
