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

/**
 * Get all admin IDs from Firestore
 */
export async function getAdminIds() {
  const configRef = adminDb.collection("config").doc("admins");
  const doc = await configRef.get();
  
  if (!doc.exists) {
    return [];
  }
  
  const data = doc.data();
  return data.adminIds || [];
}

/**
 * Get all admins with their user data
 */
export async function getAdminsWithData() {
  const adminIds = await getAdminIds();
  
  if (adminIds.length === 0) {
    return [];
  }
  
  const admins = [];
  for (const robloxId of adminIds) {
    const user = await getUserByRobloxIdAdmin(robloxId);
    admins.push({
      robloxId,
      username: user?.username || null,
      displayName: user?.displayName || null,
      avatarUrl: user?.avatarUrl || null,
      addedAt: user?.adminAddedAt || null,
    });
  }
  
  return admins;
}

/**
 * Add a new admin by Roblox ID
 */
export async function addAdmin(robloxId, addedBy) {
  const configRef = adminDb.collection("config").doc("admins");
  const doc = await configRef.get();
  
  let adminIds = [];
  if (doc.exists) {
    adminIds = doc.data().adminIds || [];
  }
  
  // Check if already an admin
  if (adminIds.includes(String(robloxId))) {
    return { success: false, error: "User is already an admin" };
  }
  
  // Add to admin list
  adminIds.push(String(robloxId));
  
  await configRef.set({
    adminIds,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: addedBy,
  }, { merge: true });
  
  // Try to update user document with admin flag
  const user = await getUserByRobloxIdAdmin(robloxId);
  if (user) {
    const userRef = adminDb.collection("users").doc(user.id);
    await userRef.update({
      isAdmin: true,
      adminAddedAt: FieldValue.serverTimestamp(),
      adminAddedBy: addedBy,
    });
  }
  
  return { success: true };
}

/**
 * Remove an admin by Roblox ID
 */
export async function removeAdmin(robloxId) {
  const configRef = adminDb.collection("config").doc("admins");
  const doc = await configRef.get();
  
  if (!doc.exists) {
    return { success: false, error: "No admins configured" };
  }
  
  let adminIds = doc.data().adminIds || [];
  const index = adminIds.indexOf(String(robloxId));
  
  if (index === -1) {
    return { success: false, error: "User is not an admin" };
  }
  
  // Remove from admin list
  adminIds.splice(index, 1);
  
  await configRef.update({
    adminIds,
    updatedAt: FieldValue.serverTimestamp(),
  });
  
  // Try to update user document to remove admin flag
  const user = await getUserByRobloxIdAdmin(robloxId);
  if (user) {
    const userRef = adminDb.collection("users").doc(user.id);
    await userRef.update({
      isAdmin: false,
      adminRemovedAt: FieldValue.serverTimestamp(),
    });
  }
  
  return { success: true };
}

/**
 * Get all credits
 */
export async function getCredits() {
  const snapshot = await adminDb.collection("credits").orderBy("order", "asc").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Add a new credit
 */
export async function addCredit(creditData) {
  const { name, title, imageUrl, link } = creditData;
  
  // Get the highest order number
  const snapshot = await adminDb.collection("credits").orderBy("order", "desc").limit(1).get();
  const highestOrder = snapshot.empty ? 0 : (snapshot.docs[0].data().order || 0);
  
  const data = {
    name,
    title,
    imageUrl: imageUrl || null,
    link: link || null,
    order: highestOrder + 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  
  const docRef = await adminDb.collection("credits").add(data);
  return { id: docRef.id, ...data };
}

/**
 * Update a credit
 */
export async function updateCredit(creditId, creditData) {
  const { name, title, imageUrl, link } = creditData;
  
  const creditRef = adminDb.collection("credits").doc(creditId);
  const doc = await creditRef.get();
  
  if (!doc.exists) {
    return { success: false, error: "Credit not found" };
  }
  
  await creditRef.update({
    name,
    title,
    imageUrl: imageUrl || null,
    link: link || null,
    updatedAt: FieldValue.serverTimestamp(),
  });
  
  return { success: true };
}

/**
 * Delete a credit
 */
export async function deleteCredit(creditId) {
  const creditRef = adminDb.collection("credits").doc(creditId);
  const doc = await creditRef.get();
  
  if (!doc.exists) {
    return { success: false, error: "Credit not found" };
  }
  
  await creditRef.delete();
  return { success: true };
}

/**
 * Reorder credits
 */
export async function reorderCredits(creditIds) {
  const batch = adminDb.batch();
  
  creditIds.forEach((id, index) => {
    const creditRef = adminDb.collection("credits").doc(id);
    batch.update(creditRef, { order: index + 1 });
  });
  
  await batch.commit();
  return { success: true };
}
