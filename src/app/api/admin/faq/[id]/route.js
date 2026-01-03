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
      return NextResponse.json({ error: "Missing FAQ ID" }, { status: 400 });
    }

    const faqDoc = await adminDb.collection("faq").doc(resolvedParams.id).get();
    
    if (!faqDoc.exists) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    
    const faq = {
      id: faqDoc.id,
      ...faqDoc.data(),
      createdAt: faqDoc.data().createdAt?.toMillis() || null,
      updatedAt: faqDoc.data().updatedAt?.toMillis() || null,
    };
    
    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return NextResponse.json({ error: "Failed to fetch FAQ" }, { status: 500 });
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
      return NextResponse.json({ error: "Missing FAQ ID" }, { status: 400 });
    }

    const faqDoc = await adminDb.collection("faq").doc(resolvedParams.id).get();
    
    if (!faqDoc.exists) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    
    const body = await request.json();
    const { question, answer, order, published } = body;
    
    if (!question || !answer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const faqData = {
      question: question.trim(),
      answer: answer.trim(),
      order: typeof order === "number" ? order : faqDoc.data().order || 0,
      published: published !== undefined ? published : faqDoc.data().published,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await faqDoc.ref.update(faqData);
    
    return NextResponse.json({ 
      id: faqDoc.id,
      ...faqData,
      createdAt: faqDoc.data().createdAt?.toMillis() || null,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
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
      return NextResponse.json({ error: "Missing FAQ ID" }, { status: 400 });
    }

    const faqDoc = await adminDb.collection("faq").doc(resolvedParams.id).get();
    
    if (!faqDoc.exists) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    
    await faqDoc.ref.delete();
    
    return NextResponse.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
