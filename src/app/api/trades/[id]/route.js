import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createNotification, notificationTypes } from "@/lib/notifications-admin";

/**
 * GET /api/trades/[id]
 * Get a single trade by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const tradeRef = adminDb.collection("trades").doc(id);
    const tradeDoc = await tradeRef.get();

    if (!tradeDoc.exists) {
      return NextResponse.json(
        { error: "Trade not found" },
        { status: 404 }
      );
    }

    const data = tradeDoc.data();
    
    // Increment view count
    await tradeRef.update({
      views: FieldValue.increment(1),
    });

    const trade = {
      id: tradeDoc.id,
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

    return NextResponse.json({ trade });
  } catch (error) {
    console.error("Error fetching trade:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trades/[id]
 * Cancel a trade (owner only)
 */
export async function DELETE(request, { params }) {
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

    // Check if user is the owner
    if (tradeData.ownerRobloxId !== session.user.robloxId) {
      return NextResponse.json(
        { error: "Only the trade owner can cancel this trade" },
        { status: 403 }
      );
    }

    // Check if trade can be cancelled
    if (tradeData.status === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel a completed trade" },
        { status: 400 }
      );
    }

    // Update trade status to cancelled
    await tradeRef.update({
      status: "cancelled",
      failReason: "cancelled",
      failedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (tradeData.joinedByRobloxId) {
      const actorName = session.user.displayName || session.user.username || "The owner";
      await createNotification({
        toRobloxId: tradeData.joinedByRobloxId,
        type: notificationTypes.trade_cancelled,
        title: "Trade cancelled",
        message: `${actorName} cancelled the trade.`,
        tradeId: id,
      });
    }

    return NextResponse.json({ message: "Trade cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling trade:", error);
    return NextResponse.json(
      { error: "Failed to cancel trade" },
      { status: 500 }
    );
  }
}
