import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ============================================
// Generic CRUD Operations
// ============================================

/**
 * Get a single document by ID
 */
export async function getDocument(collectionName, docId) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

/**
 * Get all documents from a collection
 */
export async function getCollection(collectionName) {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Add a new document to a collection
 */
export async function addDocument(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing document
 */
export async function updateDocument(collectionName, docId, data) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(collectionName, docId) {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// ============================================
// Query Helpers
// ============================================

/**
 * Query documents with filters
 */
export async function queryDocuments(collectionName, filters = [], sortField = null, sortDirection = "desc", limitCount = null) {
  let q = collection(db, collectionName);
  
  const constraints = [];
  
  // Add where clauses
  filters.forEach(({ field, operator, value }) => {
    constraints.push(where(field, operator, value));
  });
  
  // Add orderBy
  if (sortField) {
    constraints.push(orderBy(sortField, sortDirection));
  }
  
  // Add limit
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  q = query(q, ...constraints);
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// ============================================
// User-specific Operations
// ============================================

/**
 * Get user by Roblox ID
 */
export async function getUserByRobloxId(robloxId) {
  const users = await queryDocuments("users", [
    { field: "robloxId", operator: "==", value: robloxId },
  ]);
  return users[0] || null;
}

/**
 * Create or update user profile
 */
export async function upsertUser(robloxId, userData) {
  const existingUser = await getUserByRobloxId(robloxId);
  
  if (existingUser) {
    await updateDocument("users", existingUser.id, userData);
    return existingUser.id;
  } else {
    return await addDocument("users", { robloxId, ...userData });
  }
}

// ============================================
// Trade Operations
// ============================================

/**
 * Get trades by user
 */
export async function getTradesByUser(userId, status = null) {
  const filters = [{ field: "userId", operator: "==", value: userId }];
  
  if (status) {
    filters.push({ field: "status", operator: "==", value: status });
  }
  
  return await queryDocuments("trades", filters, "createdAt", "desc");
}

/**
 * Get recent trades
 */
export async function getRecentTrades(limitCount = 20) {
  return await queryDocuments("trades", [], "createdAt", "desc", limitCount);
}

/**
 * Create a new trade listing
 */
export async function createTrade(tradeData) {
  return await addDocument("trades", {
    ...tradeData,
    status: "active",
    views: 0,
  });
}

/**
 * Update trade status
 */
export async function updateTradeStatus(tradeId, status) {
  await updateDocument("trades", tradeId, { status });
}

export { db };
