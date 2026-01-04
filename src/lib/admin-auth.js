import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getAdminIds } from "./firestore-admin";

// Owner IDs - these are hardcoded and have the highest privileges
// Owners can do everything admins can + manage admin list
const OWNER_IDS = [
  "10177261540",
  "1812547121",
  "2232919542"
];

// Cache for admin IDs from Firestore
let cachedAdminIds = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get all authorized IDs (owners + admins from Firestore)
 */
async function getAuthorizedIds() {
  // Owners are always authorized
  const ownerIds = [...OWNER_IDS];
  
  // Check cache
  const now = Date.now();
  if (cachedAdminIds && (now - cacheTimestamp) < CACHE_DURATION) {
    return [...ownerIds, ...cachedAdminIds];
  }
  
  // Fetch admin IDs from Firestore
  try {
    const adminIds = await getAdminIds();
    cachedAdminIds = adminIds;
    cacheTimestamp = now;
    return [...ownerIds, ...adminIds];
  } catch (error) {
    console.error("Failed to fetch admin IDs:", error);
    // Fall back to owners only if Firestore fails
    return ownerIds;
  }
}

/**
 * Clear the admin cache (call after adding/removing admins)
 */
export function clearAdminCache() {
  cachedAdminIds = null;
  cacheTimestamp = 0;
}

/**
 * Check if a Roblox ID is an owner
 */
export function isOwner(robloxId) {
  if (!robloxId) return false;
  return OWNER_IDS.includes(String(robloxId));
}

/**
 * Check if a session is from an owner (for API routes)
 */
export function isSessionOwner(session) {
  if (!session || !session.user || !session.user.robloxId) return false;
  return isOwner(session.user.robloxId);
}

/**
 * Middleware to check if the current user is an owner
 * To be used in server components or API routes
 */
export async function requireOwner() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }
  
  if (!isOwner(session.user.robloxId)) {
    redirect("/unauthorized");
  }
  
  return session.user;
}

/**
 * Middleware to check if the current user is authorized for admin access
 * To be used in server components or API routes
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }
  
  const authorizedIds = await getAuthorizedIds();
  const isAuthorized = authorizedIds.includes(session.user.robloxId);
  
  if (!isAuthorized) {
    redirect("/unauthorized");
  }
  
  // Add isOwner flag to user object
  session.user.isOwner = isOwner(session.user.robloxId);
  
  return session.user;
}

/**
 * Check if a session is from an admin user (for API routes)
 */
export async function isSessionAdmin(session) {
  if (!session || !session.user || !session.user.robloxId) return false;
  const authorizedIds = await getAuthorizedIds();
  return authorizedIds.includes(session.user.robloxId);
}

/**
 * Check if a user is an admin (for client components)
 * Note: This is a sync version that only checks owners for immediate use
 * For full check including Firestore admins, use the async API
 */
export function isAdmin(user) {
  if (!user || !user.robloxId) return false;
  // For sync client-side check, we only check owners
  // The actual admin check happens server-side
  return OWNER_IDS.includes(user.robloxId);
}

/**
 * Get the list of owner IDs (for display purposes)
 */
export function getOwnerIds() {
  return [...OWNER_IDS];
}
