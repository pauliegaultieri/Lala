import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const guidesRef = adminDb.collection("guides")
      .where("published", "==", true)
      .orderBy("publishedAt", "desc");
    
    const snapshot = await guidesRef.get();
    
    const guides = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      slug: doc.data().slug,
      description: doc.data().description,
      tag: doc.data().tag,
      coverImage: doc.data().coverImage,
      author: doc.data().author,
      publishedAt: doc.data().publishedAt?.toMillis() || null,
    }));

    return NextResponse.json(guides);
  } catch (error) {
    console.error("Error fetching guides:", error);
    return NextResponse.json({ error: "Failed to fetch guides" }, { status: 500 });
  }
}
