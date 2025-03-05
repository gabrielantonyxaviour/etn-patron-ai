import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");
  const period = url.searchParams.get("period") || "month"; // day, week, month, year, all

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet address required" },
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

  // Get creator profile
  const { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!creatorProfile) {
    return NextResponse.json(
      { error: "Creator profile not found" },
      { status: 404 }
    );
  }

  // Set up date filter based on period
  let dateFilter = "";
  const now = new Date();

  if (period === "day") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    dateFilter = `${yesterday.toISOString()}`;
  } else if (period === "week") {
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    dateFilter = `${lastWeek.toISOString()}`;
  } else if (period === "month") {
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    dateFilter = `${lastMonth.toISOString()}`;
  } else if (period === "year") {
    const lastYear = new Date(now);
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    dateFilter = `${lastYear.toISOString()}`;
  }

  // Get summary metrics
  const [
    totalSubscribers,
    activeSubscribers,
    newSubscribers,
    totalEarnings,
    contentViews,
    contentLikes,
    topContent,
  ] = await Promise.all([
    // Total subscribers ever
    supabase
      .from("subscriptions")
      .select("id", { count: "exact" })
      .eq("creator_id", creatorProfile.id),

    // Active subscribers
    supabase
      .from("subscriptions")
      .select("id", { count: "exact" })
      .eq("creator_id", creatorProfile.id)
      .eq("is_active", true),

    // New subscribers in period
    supabase
      .from("subscriptions")
      .select("id", { count: "exact" })
      .eq("creator_id", creatorProfile.id)
      .filter("created_at", "lt", dateFilter),

    // Total earnings in period
    supabase
      .from("transactions")
      .select("amount")
      .eq("recipient_id", creatorProfile.id)
      .eq("status", "completed")
      .filter("created_at", "lt", dateFilter),

    // Content views
    supabase
      .from("content")
      .select("views_count")
      .eq("creator_id", creatorProfile.id),

    // Content likes
    supabase
      .from("content")
      .select("likes_count")
      .eq("creator_id", creatorProfile.id),

    // Top performing content
    supabase
      .from("content")
      .select("id, title, views_count, likes_count, created_at")
      .eq("creator_id", creatorProfile.id)
      .order("views_count", { ascending: false })
      .limit(5),
  ]);

  // Calculate total earnings
  const earnings =
    totalEarnings.data?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  // Calculate total views and likes
  const views =
    contentViews.data?.reduce((sum, content) => sum + content.views_count, 0) ||
    0;
  const likes =
    contentLikes.data?.reduce((sum, content) => sum + content.likes_count, 0) ||
    0;

  return NextResponse.json({
    metrics: {
      totalSubscribers: totalSubscribers.count || 0,
      activeSubscribers: activeSubscribers.count || 0,
      newSubscribers: newSubscribers.count || 0,
      totalEarnings: earnings,
      totalViews: views,
      totalLikes: likes,
    },
    topContent: topContent.data || [],
    period,
  });
}
