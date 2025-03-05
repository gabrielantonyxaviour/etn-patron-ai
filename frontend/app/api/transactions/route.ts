import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.sender_wallet || (!body.content_id && !body.creator_id)) {
    return NextResponse.json(
      { error: "Required fields missing" },
      { status: 400 }
    );
  }

  // Get sender id from wallet
  const { data: sender } = await supabase
    .from("users")
    .select("id")
    .eq("eth_wallet_address", body.sender_wallet)
    .single();

  if (!sender) {
    return NextResponse.json({ error: "Sender not found" }, { status: 404 });
  }

  // If this is a subscription payment
  if (body.creator_id) {
    // Record the transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        transaction_type: "subscription",
        amount: body.amount,
        fee: body.fee || 0,
        sender_id: sender.id,
        recipient_id: body.creator_id,
        etn_transaction_hash: body.etn_transaction_hash,
        status: body.status || "completed",
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // Create or update subscription
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: sender.id,
        creator_id: body.creator_id,
        start_date: new Date().toISOString(),
        end_date: body.end_date || endDate.toISOString(),
        is_active: true,
        price_paid: body.amount,
      })
      .select()
      .single();

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    // Update the transaction with the subscription id
    await supabase
      .from("transactions")
      .update({ subscription_id: subscription.id })
      .eq("id", transaction.id);

    return NextResponse.json({
      transaction,
      subscription,
    });
  }

  // If this is a content purchase
  if (body.content_id) {
    // Get content details
    const { data: content } = await supabase
      .from("content")
      .select("creator_id")
      .eq("id", body.content_id)
      .single();

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Record the transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        transaction_type: "content_purchase",
        amount: body.amount,
        fee: body.fee || 0,
        sender_id: sender.id,
        recipient_id: content.creator_id,
        content_id: body.content_id,
        etn_transaction_hash: body.etn_transaction_hash,
        status: body.status || "completed",
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    return NextResponse.json(transaction);
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");
  const type = url.searchParams.get("type");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const page = parseInt(url.searchParams.get("page") || "0");
  const offset = page * limit;

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
    .from("transactions")
    .select(
      `
      *,
      content:content_id(*),
      subscription:subscription_id(*),
      sender:sender_id(username, avatar_url, eth_wallet_address),
      recipient:recipient_id(
        creator_name,
        users!creator_profiles_user_id_fkey(username, avatar_url, eth_wallet_address)
      )
    `
    )
    .or(
      `sender_id.eq.${user.id},recipient_id.in.(select id from creator_profiles where user_id = ${user.id})`
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq("transaction_type", type);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    transactions: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: count ? Math.ceil(count / limit) : 0,
    },
  });
}
