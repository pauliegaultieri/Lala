import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";
    
    let query = adminDb.collection("mutations");
    
    if (activeOnly) {
      query = query.where("isActive", "==", true);
    }
    
    query = query.orderBy("multiplier", "desc");
    
    const snapshot = await query.get();
    
    const mutations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json({
      mutations,
      count: mutations.length,
    });
  } catch (error) {
    console.error("Error fetching mutations:", error);
    return NextResponse.json(
      { error: "Failed to fetch mutations" },
      { status: 500 }
    );
  }
}
