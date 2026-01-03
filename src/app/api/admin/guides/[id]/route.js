import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { isSessionAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing guide ID" }, { status: 400 });
    }

    const guideDoc = await adminDb.collection("guides").doc(resolvedParams.id).get();
    
    if (!guideDoc.exists) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }
    
    const guide = {
      id: guideDoc.id,
      ...guideDoc.data(),
      createdAt: guideDoc.data().createdAt?.toMillis() || null,
      updatedAt: guideDoc.data().updatedAt?.toMillis() || null,
      publishedAt: guideDoc.data().publishedAt?.toMillis() || null,
    };
    
    return NextResponse.json(guide);
  } catch (error) {
    console.error("Error fetching guide:", error);
    return NextResponse.json({ error: "Failed to fetch guide" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing guide ID" }, { status: 400 });
    }

    const guideDoc = await adminDb.collection("guides").doc(resolvedParams.id).get();
    
    if (!guideDoc.exists) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }
    
    const body = await request.json();
    const { title, description, content, tag, coverImage, published } = body;
    
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const guideData = {
      title: title.trim(),
      description: description?.trim() || "",
      content: content,
      tag: tag?.trim() || "Guide",
      coverImage: coverImage?.trim() || "",
      published: published !== undefined ? published : guideDoc.data().published,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Set publishedAt if publishing for the first time
    if (published && !guideDoc.data().publishedAt) {
      guideData.publishedAt = FieldValue.serverTimestamp();
    }

    await guideDoc.ref.update(guideData);
    
    return NextResponse.json({ 
      id: guideDoc.id,
      ...guideData,
      author: guideDoc.data().author,
      createdAt: guideDoc.data().createdAt?.toMillis() || null,
      updatedAt: Date.now(),
      publishedAt: guideDoc.data().publishedAt?.toMillis() || (published ? Date.now() : null),
    });
  } catch (error) {
    console.error("Error updating guide:", error);
    return NextResponse.json({ error: "Failed to update guide" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing guide ID" }, { status: 400 });
    }

    const guideDoc = await adminDb.collection("guides").doc(resolvedParams.id).get();
    
    if (!guideDoc.exists) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }
    
    await guideDoc.ref.delete();
    
    return NextResponse.json({ message: "Guide deleted successfully" });
  } catch (error) {
    console.error("Error deleting guide:", error);
    return NextResponse.json({ error: "Failed to delete guide" }, { status: 500 });
  }
}
