import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function serializeUpdate(doc) {
  const data = doc.data() || {};
  const timestamp = typeof data?.timestamp?.toDate === "function" ? data.timestamp.toDate().toISOString() : data.timestamp || null;

  return {
    id: doc.id,
    ...data,
    timestamp,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");
    const daysParam = searchParams.get("days");

    const page = parseInt(pageParam, 10) || 1;
    const limit = parseInt(limitParam, 10) || 20;
    const days = parseInt(daysParam, 10) || 7;

    // Fixed cutoff date: Jan 9th 2026 12 AM UTC
    const dateThreshold = new Date('2026-01-09T00:00:00.000Z');

    // Fetch mutations and traits for name lookup
    const [mutationsSnapshot, traitsSnapshot] = await Promise.all([
      adminDb.collection("mutations").get(),
      adminDb.collection("traits").get(),
    ]);

    const mutationsById = {};
    mutationsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      mutationsById[doc.id] = {
        id: doc.id,
        name: data.name,
        color: data.color,
        gradient: data.gradient,
        multiplier: data.multiplier || 1,
      };
    });

    const traitsById = {};
    traitsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      traitsById[doc.id] = {
        id: doc.id,
        name: data.name,
        color: data.color,
        gradient: data.gradient,
        multiplier: data.multiplier || 1,
      };
    });

    // Fetch brainrots with their update history
    const brainrotsSnapshot = await adminDb.collection("brainrots").get();
    const brainrots = brainrotsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.slug || doc.id,
        name: data.name,
        imageUrl: data.imageUrl,
        slug: data.slug,
        valueLGC: data.valueLGC,
        demand: data.demand,
        rarity: data.rarity,
        updatedAt: typeof data?.updatedAt?.toDate === "function" ? data.updatedAt.toDate() : null,
        previousValueLGC: data.previousValueLGC,
        previousDemand: data.previousDemand,
        mutationsConfig: data.mutationsConfig,
        traitsConfig: data.traitsConfig,
        previousMutationsConfig: data.previousMutationsConfig,
        previousTraitsConfig: data.previousTraitsConfig,
        mutationsById,
        traitsById,
      };
    });

    // Filter brainrots that have been updated within the specified days
    let updates = brainrots.filter(b => {
      if (!b.updatedAt) return false;
      return b.updatedAt >= dateThreshold;
    });

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      updates = updates.filter(b => 
        b.name.toLowerCase().includes(searchLower) ||
        b.slug?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by updatedAt descending (most recent first)
    updates.sort((a, b) => {
      const dateA = a.updatedAt || new Date(0);
      const dateB = b.updatedAt || new Date(0);
      return dateB - dateA;
    });

    const total = updates.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUpdates = updates.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    return NextResponse.json({
      updates: paginatedUpdates,
      count: paginatedUpdates.length,
      total,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching value updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch value updates", details: error.message },
      { status: 500 }
    );
  }
}
