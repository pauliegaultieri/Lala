import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createNotification, notificationTypes } from "@/lib/notifications-admin";

/**
 * POST /api/trades/[id]/decline
 * Decline a trade (owner or joiner)
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const tradeRef = adminDb.collection("trades").doc(id);
    const tradeDoc = await tradeRef.get();

    if (!tradeDoc.exists) {
      return NextResponse.json(
        { error: "Trade not found" },
        { status: 404 }
      );
    }

    const tradeData = tradeDoc.data();

    // Check if trade is in pending status
    if (tradeData.status !== "pending") {
      return NextResponse.json(
        { error: `Trade cannot be declined (status: ${tradeData.status})` },
        { status: 400 }
      );
    }

    const isOwner = tradeData.ownerRobloxId === session.user.robloxId;
    const isJoiner = tradeData.joinedByRobloxId === session.user.robloxId;

    if (!isOwner && !isJoiner) {
      return NextResponse.json(
        { error: "You are not a participant in this trade" },
        { status: 403 }
      );
    }

    // Get the user doc ID for the decliner
    const usersRef = adminDb.collection("users");
    const userSnapshot = await usersRef
      .where("robloxId", "==", session.user.robloxId)
      .limit(1)
      .get();

    const declinerId = userSnapshot.empty ? null : userSnapshot.docs[0].id;

    // Update trade to failed status
    await tradeRef.update({
      status: "failed",
      failReason: isOwner ? "owner_declined" : "joiner_declined",
      declinedBy: declinerId,
      failedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const otherRobloxId = isOwner ? tradeData.joinedByRobloxId : tradeData.ownerRobloxId;
    if (otherRobloxId) {
      const actorName = session.user.displayName || session.user.username || "A user";
      await createNotification({
        toRobloxId: otherRobloxId,
        type: notificationTypes.trade_declined,
        title: "Trade declined",
        message: `${actorName} declined the trade.`,
        tradeId: id,
      });
    }

    // Update stats for both users
    // Owner gets tradesFailed increment
    const ownerRef = adminDb.collection("users").doc(tradeData.ownerId);
    await ownerRef.update({
      "stats.tradesFailed": FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Joiner also gets tradesFailed increment
    const joinerRef = adminDb.collection("users").doc(tradeData.joinedBy);
    await joinerRef.update({
      "stats.tradesFailed": FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ 
      message: "Trade declined",
      status: "failed",
    });
  } catch (error) {
    console.error("Error declining trade:", error);
    return NextResponse.json(
      { error: "Failed to decline trade" },
      { status: 500 }
    );
  }
}
