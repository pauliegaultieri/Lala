import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { isSessionAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    
    let guidesRef = adminDb.collection("guides");
    
    if (published === "true") {
      guidesRef = guidesRef.where("published", "==", true);
    } else if (published === "false") {
      guidesRef = guidesRef.where("published", "==", false);
    }
    
    const snapshot = await guidesRef.orderBy("publishedAt", "desc").get();
    
    const guides = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || null,
      updatedAt: doc.data().updatedAt?.toMillis() || null,
      publishedAt: doc.data().publishedAt?.toMillis() || null,
    }));

    return NextResponse.json(guides);
  } catch (error) {
    console.error("Error fetching guides:", error);
    return NextResponse.json({ error: "Failed to fetch guides" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, content, tag, coverImage, published } = body;
    
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const slug = generateSlug(title);
    
    // Check if slug already exists
    const existingGuide = await adminDb.collection("guides").doc(slug).get();
    if (existingGuide.exists) {
      return NextResponse.json({ error: "A guide with this title already exists" }, { status: 400 });
    }

    const guideData = {
      title: title.trim(),
      slug,
      description: description?.trim() || "",
      content: content,
      tag: tag?.trim() || "Guide",
      coverImage: coverImage?.trim() || "",
      published: published || false,
      author: {
        userId: session.user.robloxId || session.user.email || "",
        username: session.user.robloxUsername || session.user.name || "",
        displayName: session.user.robloxDisplayName || session.user.name || "",
        avatar: session.user.image || "",
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: published ? FieldValue.serverTimestamp() : null,
    };

    await adminDb.collection("guides").doc(slug).set(guideData);
    
    return NextResponse.json({ 
      id: slug,
      ...guideData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      publishedAt: published ? Date.now() : null,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating guide:", error);
    return NextResponse.json({ error: "Failed to create guide" }, { status: 500 });
  }
}
