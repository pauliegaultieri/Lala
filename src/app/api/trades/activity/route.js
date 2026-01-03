import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/trades/activity
 * Get current user's trade activity (trades they posted or joined)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // optional filter
    const limitCount = parseInt(searchParams.get("limit")) || 50;

    // Get user doc ID
    const usersRef = adminDb.collection("users");
    const userSnapshot = await usersRef
      .where("robloxId", "==", session.user.robloxId)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = userSnapshot.docs[0].id;

    // Get trades where user is owner
    let ownerQuery = adminDb.collection("trades")
      .where("ownerId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limitCount);

    if (status) {
      ownerQuery = adminDb.collection("trades")
        .where("ownerId", "==", userId)
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(limitCount);
    }

    // Get trades where user joined
    let joinerQuery = adminDb.collection("trades")
      .where("joinedBy", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limitCount);

    if (status) {
      joinerQuery = adminDb.collection("trades")
        .where("joinedBy", "==", userId)
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(limitCount);
    }

    const [ownerSnapshot, joinerSnapshot] = await Promise.all([
      ownerQuery.get(),
      joinerQuery.get(),
    ]);

    const formatTrade = (doc) => {
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
    };

    const postedTrades = ownerSnapshot.docs.map(formatTrade);
    const joinedTrades = joinerSnapshot.docs.map(formatTrade);

    // Combine and sort by createdAt descending
    const allTrades = [...postedTrades, ...joinedTrades].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Remove duplicates (shouldn't happen but just in case)
    const uniqueTrades = allTrades.filter((trade, index, self) =>
      index === self.findIndex((t) => t.id === trade.id)
    );

    return NextResponse.json({
      trades: uniqueTrades.slice(0, limitCount),
      postedCount: postedTrades.length,
      joinedCount: joinedTrades.length,
    });
  } catch (error) {
    console.error("Error fetching trade activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade activity" },
      { status: 500 }
    );
  }
}
