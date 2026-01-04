import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isSessionAdmin } from "@/lib/admin-auth";
import { getCredits, addCredit } from "@/lib/firestore-admin";
import { NextResponse } from "next/server";

// GET - List all credits
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const credits = await getCredits();
    return NextResponse.json({ credits });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}

// POST - Add a new credit
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, title, imageUrl, link } = body;
    
    if (!name || !title) {
      return NextResponse.json(
        { error: "Name and title are required" },
        { status: 400 }
      );
    }
    
    const credit = await addCredit({ name, title, imageUrl, link });
    return NextResponse.json(credit, { status: 201 });
  } catch (error) {
    console.error("Error adding credit:", error);
    return NextResponse.json(
      { error: "Failed to add credit" },
      { status: 500 }
    );
  }
}
