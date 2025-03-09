import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data: creatorData, error: creatorError } = await supabase
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
    .eq("id", id)
    .single();

  if (creatorError) {
    console.error("Error fetching creator profile:", creatorError);
    return NextResponse.json({ error: creatorError }, { status: 500 });
  }

  // Next, fetch all content posted by this creator
  const { data: contentData, error: contentError } = await supabase
    .from("content")
    .select(`
      *
    `)
    .eq("creator_id", id)
    .order("created_at", { ascending: false });

  if (contentError) {
    console.error("Error fetching creator content:", contentError);
    return NextResponse.json({ error: contentError.message }, { status: 500 });
  }
  console.log(JSON.stringify({
    ...creatorData,
    subscriber_count: creatorData.subscriber_count[0].count || 0,
    content: contentData || []
  }, null, 2))
  // Return the combined data
  return NextResponse.json({
    ...creatorData,
    subscriber_count: creatorData.subscriber_count[0].count || 0,
    content: contentData || []
  });
}
