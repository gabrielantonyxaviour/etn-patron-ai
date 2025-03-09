import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const creatorId = url.searchParams.get("creatorId");

  if (!creatorId) {
    return NextResponse.json(
      { error: "Creator Id required" },
      { status: 400 }
    );
  }

  try {
    // Query subscribers to the specified creator
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        users:user_id (
          id,
          created_at,
          updated_at,
          username,
          email,
          full_name,
          bio,
          avatar_url,
          eth_wallet_address,
          last_login
        )
      `)
      .eq('creator_id', creatorId)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // Transform the response to extract user data
    const subscribers = data.map(subscription => subscription.users);

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
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