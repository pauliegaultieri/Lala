import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function serializeBrainrot(doc) {
  const data = doc.data() || {};
  const createdAt = typeof data?.createdAt?.toDate === "function" ? data.createdAt.toDate().toISOString() : data.createdAt || null;
  const updatedAt = typeof data?.updatedAt?.toDate === "function" ? data.updatedAt.toDate().toISOString() : data.updatedAt || null;

  return {
    id: data.slug || doc.id,
    ...data,
    createdAt,
    updatedAt,
  };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const slug = String(id || "").trim();
    if (!slug) {
      return NextResponse.json(
        { error: "Missing brainrot slug" },
        { status: 400 }
      );
    }
    
    const collectionRef = adminDb.collection("brainrots");

    let doc = await collectionRef.doc(slug).get();
    if (!doc.exists) {
      const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
      doc = snapshot.empty ? doc : snapshot.docs[0];
    }
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Brainrot not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(serializeBrainrot(doc));
  } catch (error) {
    console.error("Error fetching brainrot:", error);
    return NextResponse.json(
      { error: "Failed to fetch brainrot" },
      { status: 500 }
    );
  }
}
