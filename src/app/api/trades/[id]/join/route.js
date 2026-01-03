import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createNotification, notificationTypes } from "@/lib/notifications-admin";

/**
 * POST /api/trades/[id]/join
 * Join a trade (auth required)
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

    // Check if user is trying to join their own trade
    if (tradeData.ownerRobloxId === session.user.robloxId) {
      return NextResponse.json(
        { error: "You cannot join your own trade" },
        { status: 400 }
      );
    }

    // Check if trade is still active
    if (tradeData.status !== "active") {
      return NextResponse.json(
        { error: `Trade is not available (status: ${tradeData.status})` },
        { status: 400 }
      );
    }

    // Check if trade has expired
    if (tradeData.expiresAt && new Date(tradeData.expiresAt.toDate()) < new Date()) {
      await tradeRef.update({
        status: "failed",
        failReason: "expired",
        failedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      await createNotification({
        toRobloxId: tradeData.ownerRobloxId,
        type: notificationTypes.trade_expired,
        title: "Trade expired",
        message: "Your trade expired before it could be joined.",
        tradeId: id,
      });

      return NextResponse.json(
        { error: "Trade has expired" },
        { status: 400 }
      );
    }

    // Get joiner's user data
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

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Update trade with joiner info
    await tradeRef.update({
      status: "pending",
      joinedBy: userDoc.id,
      joinedByRobloxId: session.user.robloxId,
      joinedByUsername: userData.username || session.user.username,
      joinedByAvatarUrl: userData.avatarUrl || session.user.image,
      joinedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await createNotification({
      toRobloxId: tradeData.ownerRobloxId,
      type: notificationTypes.trade_joined,
      title: "Someone joined your trade",
      message: `${userData.username || session.user.username || "A user"} joined your trade.`,
      tradeId: id,
      fromUser: {
        robloxId: String(session.user.robloxId),
        username: userData.username || session.user.username || null,
        avatarUrl: userData.avatarUrl || session.user.image || null,
      },
    });

    return NextResponse.json({ 
      message: "Successfully joined trade",
      tradeId: id,
    });
  } catch (error) {
    console.error("Error joining trade:", error);
    return NextResponse.json(
      { error: "Failed to join trade" },
      { status: 500 }
    );
  }
}
