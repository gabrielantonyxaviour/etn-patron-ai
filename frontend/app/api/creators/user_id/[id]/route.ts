import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // Ensure params are awaited
  console.log(`Received request for address: ${id}`);

  // Then get the creator profile
  const { data, error } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("user_id", id)
    .single();

  if (data == null || (error && error.code !== "PGRST116")) {
    const responseData = {
      isRegistered: false,
    };

    console.log(`Response data: ${JSON.stringify(responseData)}`);
    return NextResponse.json(responseData);
  }
  console.log(`Creator profile found: ${JSON.stringify(data)}`);

  const responseData = {
    id: data.id,
    category: data.category,
    sub_price: data.sub_price,
    banner_url: data.banner_url,
    created_at: data.created_at,
    verified: data.verified,
    social_links: data.social_links,
    isRegistered: true,
  };

  console.log(`Response data: ${JSON.stringify(responseData)}`);
  return NextResponse.json(responseData || null);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const updateData = await req.json();

  console.log({
    social_links: {
      twitter: updateData.twitter,
      instagram: updateData.instagram
    },
    sub_price: updateData.sub_price,
  })

  const { data, error } = await supabase
    .from("creator_profiles")
    .update({
      social_links: {
        twitter: updateData.twitter,
        instagram: updateData.instagram
      },
      sub_price: updateData.sub_price,
    })
    .eq("user_id", id)
    .single();


  console.log({
    sender_id: updateData.senderId,
    recipient_id: null,
    content_id: null,
    desc: "Update Profile",
    tx_hash: updateData.txHash,
    type: "update_profile",
    amount: 0
  })

  const { data: txData, error: txError } = await supabase.from("transactions").insert({
    sender_id: updateData.senderId,
    recipient_id: null,
    content_id: null,
    desc: "Update Profile",
    tx_hash: updateData.txHash,
    type: "update_profile",
    amount: 0
  })

  if (txError) {
    console.error(`Error creating transaction: ${txError.message}`);
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  if (error) {
    console.error(`Error updating profile: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`Profile updated: ${JSON.stringify(data)}`);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const createProfileData = await req.json();

  const { data, error } = await supabase
    .from("creator_profiles")
    .insert({
      user_id: createProfileData.user_id,
      sub_price: createProfileData.sub_price,
      banner_url: createProfileData.banner_url,
      category: createProfileData.category,
      social_links: createProfileData.social_links,
      verified: createProfileData.verified,
    })
    .single();


  console.log({
    sender_id: createProfileData.user_id,
    recipient_id: null,
    content_id: null,
    desc: "Create Profile",
    tx_hash: createProfileData.txHash,
    type: "create_profile",
    amount: 0
  })

  const { data: txData, error: txError } = await supabase.from("transactions").insert({
    sender_id: createProfileData.user_id,
    recipient_id: null,
    content_id: null,
    desc: "Create Profile",
    tx_hash: createProfileData.txHash,
    type: "create_profile",
    amount: 0
  })


  if (txError) {
    console.error(`Error creating transaction: ${txError.message}`);
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }


  if (error) {
    console.error(`Error creating profile: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`Profile created: ${JSON.stringify(data)}`);
  return NextResponse.json(data);
}
