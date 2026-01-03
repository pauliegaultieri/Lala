import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { isSessionAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const faqRef = adminDb.collection("faq");
    
    const snapshot = await faqRef.orderBy("order", "asc").get();
    
    const faqs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || null,
      updatedAt: doc.data().updatedAt?.toMillis() || null,
    }));

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, order } = body;
    
    if (!question || !answer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const faqData = {
      question: question.trim(),
      answer: answer.trim(),
      order: typeof order === "number" ? order : 0,
      published: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("faq").add(faqData);
    
    return NextResponse.json({ 
      id: docRef.id,
      ...faqData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}
