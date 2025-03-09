import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.user_id || !body.content_id || !body.amount || !body.tx_hash || !body.creator_id) {
    return NextResponse.json(
      { error: "Required fields missing" },
      { status: 400 }
    );
  }

  console.log(body)

  const { data: txData, error: txError } = await supabase.from("transactions").insert({
    sender_id: body.user_id,
    recipient_id: body.creator_id,
    content_id: body.content_id,
    desc: "Purchase Content",
    tx_hash: body.tx_hash,
    type: "content_purchase",
    amount: body.amount
  })
  if (txError) {
    console.log(txError)
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("purchases")
    .insert({
      user_id: body.user_id,
      content_id: body.content_id,
      price_paid: body.amount,
    })
  if (error) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
