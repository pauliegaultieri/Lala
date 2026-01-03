import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/trades/completed
 * Get all completed trades (public feed)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get("limit")) || 20;

    const tradesRef = adminDb.collection("trades");
    const query = tradesRef
      .where("status", "==", "completed")
      .orderBy("completedAt", "desc")
      .limit(limitCount);

    const snapshot = await query.get();

    const trades = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        joinedAt: data.joinedAt?.toDate?.()?.toISOString() || null,
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || null,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
        failedAt: data.failedAt?.toDate?.()?.toISOString() || null,
        ownerAcceptedAt: data.ownerAcceptedAt?.toDate?.()?.toISOString() || null,
        joinerAcceptedAt: data.joinerAcceptedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ trades, count: trades.length });
  } catch (error) {
    console.error("Error fetching completed trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch completed trades" },
      { status: 500 }
    );
  }
}
