import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request) {
  try {
    const faqRef = adminDb.collection("faq").where("published", "==", true);
    
    const snapshot = await faqRef.orderBy("order", "asc").get();
    
    const faqs = snapshot.docs.map(doc => ({
      id: doc.id,
      question: doc.data().question,
      answer: doc.data().answer,
      order: doc.data().order,
    }));

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}
