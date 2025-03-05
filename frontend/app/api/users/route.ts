import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const walletAddress = url.searchParams.get("wallet");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("eth_wallet_address", walletAddress)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}

export async function POST(req: NextRequest) {
  try {
    console.log("Received POST request");

    // Parse the form data which includes both user data and the avatar file
    const formData = await req.formData();
    console.log("Form data parsed");

    // Extract user data
    const username = formData.get("username") as string;
    const full_name = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const bio = formData.get("bio") as string;
    const eth_wallet_address = formData.get("eth_wallet_address") as string;
    let avatar_url = formData.get("avatar_url") as string;

    // Extract the avatar file
    const avatarFile = formData.get("avatar") as File | null;

    // Validate required fields
    if (!username || !email || !eth_wallet_address) {
      console.log("Validation failed: Missing required fields");
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
      console.log("User with wallet address already exists");

      if (avatarFile) {
        console.log("Avatar file provided, processing upload");

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
          console.log("Failed to upload avatar:", uploadError.message);
          return NextResponse.json(
            { error: `Failed to upload avatar: ${uploadError.message}` },
            { status: 500 }
          );
        }

        // Get the public URL
        avatar_url = supabase.storage
          .from("creator-content")
          .getPublicUrl(uploadData.path).data.publicUrl;
        console.log("Avatar uploaded successfully, URL:", avatar_url);
      }

      const { data, error } = await supabase
        .from("users")
        .update({
          username: username,
          email: email || `${eth_wallet_address.substr(0, 8)}@electroneum.user`,
          full_name: full_name,
          bio: bio,
          avatar_url: avatar_url,
          last_login: new Date().toISOString(),
        })
        .eq("eth_wallet_address", eth_wallet_address)
        .select()
        .single();

      if (error) {
        console.log("Error updating user:", error);
        return NextResponse.json({ error: error }, { status: 500 });
      }

      console.log("User updated successfully");
      return NextResponse.json(data);
    } else {
      console.log(
        "No existing user with this wallet address, creating new user"
      );

      // Check if username is already taken
      const { data: existingUserByUsername } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (existingUserByUsername) {
        console.log("Username is already taken");
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }

      let avatar_url = null;

      // Upload the avatar if provided
      if (avatarFile) {
        console.log("Avatar file provided, processing upload");

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
          console.log("Failed to upload avatar:", uploadError.message);
          return NextResponse.json(
            { error: `Failed to upload avatar: ${uploadError.message}` },
            { status: 500 }
          );
        }

        // Get the public URL
        avatar_url = supabase.storage
          .from("creator-content")
          .getPublicUrl(uploadData.path).data.publicUrl;
        console.log("Avatar uploaded successfully, URL:", avatar_url);
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

      console.log("User created successfully");
      return NextResponse.json(
        {
          message: "User created successfully",
          user: newUser,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
