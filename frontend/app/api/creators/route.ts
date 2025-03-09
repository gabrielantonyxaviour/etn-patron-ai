import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const page = parseInt(url.searchParams.get("page") || "0");
  const offset = page * limit;

  let query = supabase
    .from("creator_profiles")
    .select(` 
      *,
      users!user_id (
        id,
        username,
        email,
        full_name,
        bio,
        avatar_url,
        eth_wallet_address,
        last_login
      ),
        subscriber_count:subscriptions!creator_id(count)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const creators = data.map((creator) => {
    return {
      ...creator,
      subscriber_count: creator.subscriber_count[0].count || 0,
    }
  })
  return NextResponse.json({
    creators: creators,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: count ? Math.ceil(count / limit) : 0,
    },
  });
}
