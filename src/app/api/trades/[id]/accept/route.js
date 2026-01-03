import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  createNotification,
  createTradeNotificationPair,
  notificationTypes,
} from "@/lib/notifications-admin";

/**
 * POST /api/trades/[id]/accept
 * Accept a trade (owner or joiner)
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
        { error: `Trade cannot be accepted (status: ${tradeData.status})` },
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

    // Update acceptance status
    const updates = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (isOwner) {
      if (tradeData.ownerAccepted) {
        return NextResponse.json(
          { error: "You have already accepted this trade" },
          { status: 400 }
        );
      }
      updates.ownerAccepted = true;
      updates.ownerAcceptedAt = FieldValue.serverTimestamp();
    } else {
      if (tradeData.joinerAccepted) {
        return NextResponse.json(
          { error: "You have already accepted this trade" },
          { status: 400 }
        );
      }
      updates.joinerAccepted = true;
      updates.joinerAcceptedAt = FieldValue.serverTimestamp();
    }

    // Check if both parties have now accepted
    const bothAccepted = 
      (isOwner && tradeData.joinerAccepted) || 
      (isJoiner && tradeData.ownerAccepted);

    if (bothAccepted) {
      // Trade is complete!
      updates.status = "completed";
      updates.completedAt = FieldValue.serverTimestamp();
    }

    await tradeRef.update(updates);

    if (bothAccepted) {
      await createTradeNotificationPair({
        ownerRobloxId: tradeData.ownerRobloxId,
        joinerRobloxId: tradeData.joinedByRobloxId,
        ownerPayload: {
          type: notificationTypes.trade_completed,
          title: "Trade completed",
          message: "Both parties accepted. Trade completed successfully.",
          tradeId: id,
        },
        joinerPayload: {
          type: notificationTypes.trade_completed,
          title: "Trade completed",
          message: "Both parties accepted. Trade completed successfully.",
          tradeId: id,
        },
      });
    } else {
      const otherRobloxId = isOwner ? tradeData.joinedByRobloxId : tradeData.ownerRobloxId;
      const actorName = session.user.displayName || session.user.username || "A user";
      if (otherRobloxId) {
        await createNotification({
          toRobloxId: otherRobloxId,
          type: notificationTypes.trade_accepted,
          title: "Trade accepted",
          message: `${actorName} accepted the trade.`,
          tradeId: id,
        });
      }
    }

    // If trade completed, update user stats
    if (bothAccepted) {
      // Update owner stats
      const ownerRef = adminDb.collection("users").doc(tradeData.ownerId);
      await ownerRef.update({
        "stats.tradesCompleted": FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update joiner stats
      const joinerRef = adminDb.collection("users").doc(tradeData.joinedBy);
      await joinerRef.update({
        "stats.tradesAccepted": FieldValue.increment(1),
        "stats.tradesCompleted": FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ 
        message: "Trade completed successfully!",
        status: "completed",
      });
    }

    return NextResponse.json({ 
      message: "Trade accepted, waiting for other party",
      status: "pending",
      ownerAccepted: isOwner ? true : tradeData.ownerAccepted,
      joinerAccepted: isJoiner ? true : tradeData.joinerAccepted,
    });
  } catch (error) {
    console.error("Error accepting trade:", error);
    return NextResponse.json(
      { error: "Failed to accept trade" },
      { status: 500 }
    );
  }
}
