import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { FieldValue } from "firebase-admin/firestore";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { isSessionAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb.collection("traits").orderBy("multiplier", "desc").get();
    const traits = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ traits, count: traits.length });
  } catch (error) {
    console.error("Error fetching traits (admin):", error);
    return NextResponse.json({ error: "Failed to fetch traits" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isSessionAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body?.name || "").trim();
    const color = String(body?.color || "").trim();
    const gradientFrom = String(body?.gradient?.from || "").trim();
    const gradientTo = String(body?.gradient?.to || "").trim();
    const gradientAngle = Number(body?.gradient?.angle);
    const multiplier = Number(body?.multiplier);
    const isActive = Boolean(body?.isActive);

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!color) return NextResponse.json({ error: "Color is required" }, { status: 400 });
    if ((gradientFrom && !gradientTo) || (!gradientFrom && gradientTo)) {
      return NextResponse.json({ error: "Gradient colors are required" }, { status: 400 });
    }
    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      return NextResponse.json({ error: "Multiplier must be a positive number" }, { status: 400 });
    }

    const slug = toSlug(name);

    const data = {
      name,
      slug,
      color,
      gradient: gradientFrom && gradientTo
        ? {
            from: gradientFrom,
            to: gradientTo,
            angle: Number.isFinite(gradientAngle) ? gradientAngle : 90,
          }
        : null,
      multiplier,
      isActive,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("traits").add(data);

    return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
  } catch (error) {
    console.error("Error creating trait:", error);
    return NextResponse.json({ error: "Failed to create trait" }, { status: 500 });
  }
}
