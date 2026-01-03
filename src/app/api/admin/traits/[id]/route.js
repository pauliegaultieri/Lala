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

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const id = String(resolvedParams?.id || "");
    if (!id) return NextResponse.json({ error: "Missing trait ID" }, { status: 400 });

    const ref = adminDb.collection("traits").doc(id);
    const doc = await ref.get();

    if (!doc.exists) return NextResponse.json({ error: "Trait not found" }, { status: 404 });

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching trait:", error);
    return NextResponse.json({ error: "Failed to fetch trait" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const id = String(resolvedParams?.id || "");
    if (!id) return NextResponse.json({ error: "Missing trait ID" }, { status: 400 });

    const ref = adminDb.collection("traits").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "Trait not found" }, { status: 404 });

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

    const update = {
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
      updatedAt: FieldValue.serverTimestamp(),
    };

    await ref.update(update);

    return NextResponse.json({ id, ...update });
  } catch (error) {
    console.error("Error updating trait:", error);
    return NextResponse.json({ error: "Failed to update trait" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const id = String(resolvedParams?.id || "");
    if (!id) return NextResponse.json({ error: "Missing trait ID" }, { status: 400 });

    const ref = adminDb.collection("traits").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "Trait not found" }, { status: 404 });

    await ref.delete();

    return NextResponse.json({ message: "Trait deleted successfully" });
  } catch (error) {
    console.error("Error deleting trait:", error);
    return NextResponse.json({ error: "Failed to delete trait" }, { status: 500 });
  }
}
