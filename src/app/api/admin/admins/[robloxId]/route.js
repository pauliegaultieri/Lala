import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isSessionOwner, clearAdminCache, getOwnerIds } from "@/lib/admin-auth";
import { removeAdmin } from "@/lib/firestore-admin";
import { NextResponse } from "next/server";

// DELETE - Remove an admin (owners only)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!isSessionOwner(session)) {
      return NextResponse.json(
        { error: "Unauthorized - Owner access required" },
        { status: 403 }
      );
    }
    
    const { robloxId } = await params;
    
    if (!robloxId) {
      return NextResponse.json(
        { error: "Roblox ID is required" },
        { status: 400 }
      );
    }
    
    // Prevent removing owners
    const ownerIds = getOwnerIds();
    if (ownerIds.includes(robloxId)) {
      return NextResponse.json(
        { error: "Cannot remove an owner" },
        { status: 400 }
      );
    }
    
    const result = await removeAdmin(robloxId);
    
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
    console.error("Error removing admin:", error);
    return NextResponse.json(
      { error: "Failed to remove admin" },
      { status: 500 }
    );
  }
}
