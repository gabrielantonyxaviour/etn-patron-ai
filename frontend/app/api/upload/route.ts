import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    // Parse the form data which includes both user data and the avatar file
    const formData = await req.formData();

    // Extract user data
    const username = formData.get("username") as string;
    const full_name = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const bio = formData.get("bio") as string;
    const eth_wallet_address = formData.get("eth_wallet_address") as string;

    // Extract the avatar file
    const avatarFile = formData.get("avatar") as File | null;

    // Validate required fields
    if (!username || !email || !eth_wallet_address) {
      return NextResponse.json(
        { error: "Username, email, and wallet address are required" },
        { status: 400 }
      );
    }

    // Check if user with this wallet address already exists
    const { data: existingUserByWallet } = await supabase
      .from("users")
      .select("id")
      .eq("eth_wallet_address", eth_wallet_address)
      .single();

    if (existingUserByWallet) {
      return NextResponse.json(
        { error: "User with this wallet address already exists" },
        { status: 409 }
      );
    }

    // Check if username is already taken
    const { data: existingUserByUsername } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Initialize the avatar URL to null
    let avatar_url = null;

    // Upload the avatar if provided
    if (avatarFile) {
      // Convert the file to an ArrayBuffer
      const arrayBuffer = await avatarFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Generate a unique file name
      const fileName = `avatars/${uuidv4()}-${avatarFile.name.replace(
        /\s/g,
        "_"
      )}`;

      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("creator-content")
        .upload(fileName, buffer, {
          contentType: avatarFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Failed to upload avatar: ${uploadError.message}` },
          { status: 500 }
        );
      }

      // Get the public URL
      avatar_url = supabase.storage
        .from("creator-content")
        .getPublicUrl(uploadData.path).data.publicUrl;
    }

    // Create a new user record with the avatar URL
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        username,
        full_name: full_name || null,
        email,
        bio: bio || null,
        eth_wallet_address,
        avatar_url,
        is_creator: false, // Default value
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.error("Error creating user:", userError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
