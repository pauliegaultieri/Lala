import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const notificationTypes = {
  trade_joined: "trade_joined",
  trade_accepted: "trade_accepted",
  trade_declined: "trade_declined",
  trade_cancelled: "trade_cancelled",
  trade_expired: "trade_expired",
  trade_completed: "trade_completed",
};

export async function createNotification({
  toRobloxId,
  type,
  title,
  message,
  tradeId,
  actionUrl,
  fromUser = null,
}) {
  if (!toRobloxId) return;

  const robloxId = String(toRobloxId);

  await adminDb
    .collection("notifications")
    .doc(robloxId)
    .collection("items")
    .add({
      type,
      title,
      message,
      tradeId: tradeId ? String(tradeId) : null,
      actionUrl: actionUrl || (tradeId ? `/trades/${tradeId}` : "/trades"),
      fromUser,
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function createTradeNotificationPair({
  ownerRobloxId,
  joinerRobloxId,
  ownerPayload,
  joinerPayload,
}) {
  const ops = [];
  if (ownerRobloxId && ownerPayload) {
    ops.push(createNotification({ toRobloxId: ownerRobloxId, ...ownerPayload }));
  }
  if (joinerRobloxId && joinerPayload) {
    ops.push(createNotification({ toRobloxId: joinerRobloxId, ...joinerPayload }));
  }
  await Promise.all(ops);
}
