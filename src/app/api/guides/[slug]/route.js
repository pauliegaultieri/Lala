import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.slug) {
      return NextResponse.json({ error: "Missing guide slug" }, { status: 400 });
    }

    const guideDoc = await adminDb.collection("guides").doc(resolvedParams.slug).get();
    
    if (!guideDoc.exists || !guideDoc.data().published) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }
    
    const guide = {
      id: guideDoc.id,
      title: guideDoc.data().title,
      slug: guideDoc.data().slug,
      description: guideDoc.data().description,
      content: guideDoc.data().content,
      tag: guideDoc.data().tag,
      coverImage: guideDoc.data().coverImage,
      author: guideDoc.data().author,
      publishedAt: guideDoc.data().publishedAt?.toMillis() || null,
      updatedAt: guideDoc.data().updatedAt?.toMillis() || null,
    };
    
    return NextResponse.json(guide);
  } catch (error) {
    console.error("Error fetching guide:", error);
    return NextResponse.json({ error: "Failed to fetch guide" }, { status: 500 });
  }
}
