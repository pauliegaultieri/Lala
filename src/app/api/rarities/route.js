import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

// Cache for 1 hour, but can be invalidated on-demand via revalidateTag
export const revalidate = 3600;

export async function GET() {
  try {
    const raritiesRef = adminDb.collection("rarities");
    const snapshot = await raritiesRef.orderBy("order", "asc").get();
    
    const rarities = snapshot.docs.map(doc => ({
      id: doc.data().id,
      label: doc.data().label,
      color: doc.data().color,
      image: doc.data().image,
      order: doc.data().order,
      showInForm: doc.data().showInForm,
    }));

    const response = NextResponse.json(rarities);
    
    // Add cache tags for on-demand revalidation
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error("Error fetching rarities:", error);
    return NextResponse.json({ error: "Failed to fetch rarities" }, { status: 500 });
  }
}
