import { adminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Get user by Roblox ID (server-side)
 */
export async function getUserByRobloxIdAdmin(robloxId) {
  const usersRef = adminDb.collection("users");
  const raw = robloxId == null ? "" : String(robloxId);

  // Firestore queries are type-sensitive. Some existing data may store robloxId as a number.
  // Try string match first, then number match if applicable.
  const tryFetch = async (value) => {
    const snapshot = await usersRef.where("robloxId", "==", value).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  };

  const byString = await tryFetch(raw);
  if (byString) return byString;

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && raw.trim() !== "") {
    const byNumber = await tryFetch(asNumber);
    if (byNumber) return byNumber;
  }

  return null;
}

/**
 * Create or update user on login (server-side)
 * Called from NextAuth signIn callback
 */
export async function upsertUserOnLogin(robloxId, userData) {
  const existingUser = await getUserByRobloxIdAdmin(robloxId);
  
  if (existingUser) {
    // Update existing user
    const userRef = adminDb.collection("users").doc(existingUser.id);
    await userRef.update({
      username: userData.username,
      displayName: userData.displayName,
      avatarUrl: userData.avatarUrl,
      profileUrl: userData.profileUrl,
      lastLoginAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return existingUser.id;
  } else {
    // Create new user
    const newUserRef = adminDb.collection("users").doc();
    await newUserRef.set({
      robloxId,
      username: userData.username,
      displayName: userData.displayName,
      avatarUrl: userData.avatarUrl,
      profileUrl: userData.profileUrl,
      stats: {
        tradesPosted: 0,
        tradesAccepted: 0,
        tradesCompleted: 0,
        tradesFailed: 0,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
    });
    return newUserRef.id;
  }
}

/**
 * Get user by document ID (server-side)
 */
export async function getUserByIdAdmin(userId) {
  const userRef = adminDb.collection("users").doc(userId);
  const doc = await userRef.get();
  
  if (!doc.exists) {
    return null;
  }
  
  return { id: doc.id, ...doc.data() };
}

/**
 * Update user stats (server-side)
 */
export async function updateUserStatsAdmin(userId, statUpdates) {
  const userRef = adminDb.collection("users").doc(userId);
  
  const updates = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  
  // Build increment updates for stats
  for (const [key, value] of Object.entries(statUpdates)) {
    updates[`stats.${key}`] = FieldValue.increment(value);
  }
  
  await userRef.update(updates);
}
