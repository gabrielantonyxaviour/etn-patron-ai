import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const wallet = formData.get("wallet") as string;
  const contentType = formData.get("contentType") as string;

  if (!file || !wallet) {
    return NextResponse.json(
      { error: "File and wallet required" },
      { status: 400 }
    );
  }

  // Get user from wallet
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("eth_wallet_address", wallet)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Convert the file to an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Generate a unique file name
  const fileName = `${contentType}/${uuidv4()}-${file.name.replace(
    /\s/g,
    "_"
  )}`;

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("creator-content")
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get the public URL
  const publicUrl = supabase.storage
    .from("creator-content")
    .getPublicUrl(data.path).data.publicUrl;

  return NextResponse.json({
    url: publicUrl,
    fileName: data.path,
    contentType: file.type,
  });
}
