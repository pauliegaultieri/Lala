import { getCredits } from "@/lib/firestore-admin";
import { NextResponse } from "next/server";

// GET - Public endpoint to fetch all credits
export async function GET() {
  try {
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
