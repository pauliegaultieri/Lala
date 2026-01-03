import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;
    const robloxId = awaitedParams?.robloxId;

    if (!robloxId) {
      return NextResponse.json({ error: "Missing robloxId" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limitCount = parseInt(searchParams.get("limit")) || 50;

    const usersRef = adminDb.collection("users");
    const userSnapshot = await usersRef.where("robloxId", "==", String(robloxId)).limit(1).get();

    if (userSnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userSnapshot.docs[0].id;

    let ownerQuery = adminDb.collection("trades").where("ownerId", "==", userId).orderBy("createdAt", "desc").limit(limitCount);
    if (status) {
      ownerQuery = adminDb
        .collection("trades")
        .where("ownerId", "==", userId)
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(limitCount);
    }

    let joinerQuery = adminDb.collection("trades").where("joinedBy", "==", userId).orderBy("createdAt", "desc").limit(limitCount);
    if (status) {
      joinerQuery = adminDb
        .collection("trades")
        .where("joinedBy", "==", userId)
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(limitCount);
    }

    const [ownerSnapshot, joinerSnapshot] = await Promise.all([ownerQuery.get(), joinerQuery.get()]);

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

    const allTrades = [...postedTrades, ...joinedTrades].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const uniqueTrades = allTrades.filter((trade, index, self) => index === self.findIndex((t) => t.id === trade.id));

    return NextResponse.json({
      trades: uniqueTrades.slice(0, limitCount),
      postedCount: postedTrades.length,
      joinedCount: joinedTrades.length,
    });
  } catch (error) {
    console.error("Error fetching public trade activity:", error);
    return NextResponse.json({ error: "Failed to fetch trade activity" }, { status: 500 });
  }
}
