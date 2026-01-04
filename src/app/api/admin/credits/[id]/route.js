import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isSessionAdmin } from "@/lib/admin-auth";
import { updateCredit, deleteCredit } from "@/lib/firestore-admin";
import { NextResponse } from "next/server";

// PUT - Update a credit
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    const { name, title, imageUrl, link } = body;
    
    if (!name || !title) {
      return NextResponse.json(
        { error: "Name and title are required" },
        { status: 400 }
      );
    }
    
    const result = await updateCredit(id, { name, title, imageUrl, link });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating credit:", error);
    return NextResponse.json(
      { error: "Failed to update credit" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a credit
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const result = await deleteCredit(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting credit:", error);
    return NextResponse.json(
      { error: "Failed to delete credit" },
      { status: 500 }
    );
  }
}
