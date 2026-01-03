import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// List of authorized Roblox user IDs for admin access
const AUTHORIZED_ADMIN_IDS = [
  "10177261540",
  "1812547121",
  "2232919542"
];

/**
 * Middleware to check if the current user is authorized for admin access
 * To be used in server components or API routes
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }
  
  const isAuthorized = AUTHORIZED_ADMIN_IDS.includes(session.user.robloxId);
  
  if (!isAuthorized) {
    redirect("/unauthorized");
  }
  
  return session.user;
}

/**
 * Check if a session is from an admin user (for API routes)
 */
export function isSessionAdmin(session) {
  if (!session || !session.user || !session.user.robloxId) return false;
  return AUTHORIZED_ADMIN_IDS.includes(session.user.robloxId);
}

/**
 * Check if a user is an admin (for client components)
 */
export function isAdmin(user) {
  if (!user || !user.robloxId) return false;
  return AUTHORIZED_ADMIN_IDS.includes(user.robloxId);
}
