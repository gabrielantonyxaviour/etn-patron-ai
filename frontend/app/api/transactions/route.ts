import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sender_id = url.searchParams.get("sender_id");
  const recipient_id = url.searchParams.get("recipient_id");
  const content_id = url.searchParams.get("content_id");
  const tx_hash = url.searchParams.get("tx_hash");

  let query = supabase
    .from("transactions")
    .select("*")

  if (sender_id) {
    query = query.eq("sender_id", sender_id);
  }

  if (recipient_id) {
    query = query.eq("recipient_id", recipient_id);
  }

  if (content_id) {
    query = query.eq("content_id", content_id);
  }


  if (tx_hash) {
    query = query.eq("tx_hash", tx_hash);
  }

  const { data, error, count } = await query.select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
