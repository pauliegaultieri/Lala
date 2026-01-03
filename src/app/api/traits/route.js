import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request) {
  try {
    const snapshot = await adminDb
      .collection("traits")
      .orderBy("multiplier", "desc")
      .get();
    
    const traits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json({
      traits,
      count: traits.length,
    });
  } catch (error) {
    console.error("Error fetching traits:", error);
    return NextResponse.json(
      { error: "Failed to fetch traits" },
      { status: 500 }
    );
  }
}
