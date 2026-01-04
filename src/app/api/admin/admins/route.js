import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isSessionOwner, clearAdminCache, getOwnerIds } from "@/lib/admin-auth";
import { getAdminsWithData, addAdmin } from "@/lib/firestore-admin";
import { NextResponse } from "next/server";

// GET - List all admins (owners only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!isSessionOwner(session)) {
      return NextResponse.json(
        { error: "Unauthorized - Owner access required" },
        { status: 403 }
      );
    }
    
    const admins = await getAdminsWithData();
    const ownerIds = getOwnerIds();
    
    return NextResponse.json({ admins, ownerIds });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

// POST - Add a new admin (owners only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!isSessionOwner(session)) {
      return NextResponse.json(
        { error: "Unauthorized - Owner access required" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { robloxId } = body;
    
    if (!robloxId) {
      return NextResponse.json(
        { error: "Roblox ID is required" },
        { status: 400 }
      );
    }
    
    // Validate robloxId format (should be numeric string)
    const cleanId = String(robloxId).trim();
    if (!/^\d+$/.test(cleanId)) {
      return NextResponse.json(
        { error: "Invalid Roblox ID format" },
        { status: 400 }
      );
    }
    
    // Check if trying to add an owner as admin (not needed)
    const ownerIds = getOwnerIds();
    if (ownerIds.includes(cleanId)) {
      return NextResponse.json(
        { error: "This user is already an owner" },
        { status: 400 }
      );
    }
    
    const result = await addAdmin(cleanId, session.user.robloxId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    // Clear the admin cache so changes take effect immediately
    clearAdminCache();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding admin:", error);
    return NextResponse.json(
      { error: "Failed to add admin" },
      { status: 500 }
    );
  }
}
