import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function serializeBrainrot(doc) {
  const data = doc.data() || {};
  const createdAt = typeof data?.createdAt?.toDate === "function" ? data.createdAt.toDate().toISOString() : data.createdAt || null;
  const updatedAt = typeof data?.updatedAt?.toDate === "function" ? data.updatedAt.toDate().toISOString() : data.updatedAt || null;

  return {
    id: data.slug || doc.id,
    ...data,
    createdAt,
    updatedAt,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rarity = searchParams.get("rarity");
    const search = searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");
    const maxValueParam = searchParams.get("maxValue");
    const topTodayParam = searchParams.get("topToday");
    const quickTradeParam = searchParams.get("quickTrade");

    const filterTopToday = topTodayParam === "1" || topTodayParam === "true";
    const filterQuickTrade = quickTradeParam === "1" || quickTradeParam === "true";
    const page = parseInt(pageParam, 10) || 1;
    const limit = parseInt(limitParam, 10) || 30;
    const maxValue = maxValueParam ? parseFloat(maxValueParam) : null;
    
    // Fetch all brainrots (no composite index needed)
    const snapshot = await adminDb.collection("brainrots").get();
    
    let brainrots = snapshot.docs.map(serializeBrainrot);
    
    // Filter by rarity if provided (supports comma-separated list)
    if (rarity) {
      const rarities = rarity.split(',').map(r => r.trim());
      brainrots = brainrots.filter(b => rarities.includes(b.rarity));
    }
    
    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      brainrots = brainrots.filter(b => 
        b.name.toLowerCase().includes(searchLower) ||
        b.slug?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by max value
    if (maxValue !== null) {
      brainrots = brainrots.filter(b => (b.valueLGC || 0) <= maxValue);
    }

    if (filterTopToday) {
      brainrots = brainrots.filter((b) => Boolean(b.isTopToday));
    }

    if (filterQuickTrade) {
      brainrots = brainrots.filter((b) => Boolean(b.isQuickTrade));
    }
    
    // Sort by valueLGC descending (most valuable first)
    brainrots.sort((a, b) => (b.valueLGC || 0) - (a.valueLGC || 0));
    
    const total = brainrots.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBrainrots = brainrots.slice(startIndex, endIndex);
    const hasMore = endIndex < total;
    
    return NextResponse.json({
      brainrots: paginatedBrainrots,
      count: paginatedBrainrots.length,
      total,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching brainrots:", error);
    return NextResponse.json(
      { error: "Failed to fetch brainrots", details: error.message },
      { status: 500 }
    );
  }
}
