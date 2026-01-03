import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const brainrotSlug = resolvedParams?.id ? String(resolvedParams.id) : null;

    if (!brainrotSlug) {
      return NextResponse.json({ error: "Missing brainrot ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "6", 10) || 6, 1), 18);

    const collectionRef = adminDb.collection("brainrots");

    let doc = await collectionRef.doc(brainrotSlug).get();
    if (!doc.exists) {
      const snapshot = await collectionRef.where("slug", "==", brainrotSlug).limit(1).get();
      doc = snapshot.empty ? doc : snapshot.docs[0];
    }

    if (!doc.exists) {
      return NextResponse.json({ error: "Brainrot not found" }, { status: 404 });
    }

    const target = { id: doc.id, ...doc.data() };
    const targetValue = safeNumber(target.valueLGC, 0);
    const targetRarity = target.rarity || null;

    const snapshot = await adminDb.collection("brainrots").get();
    const all = snapshot.docs.map((d) => {
      const data = d.data() || {};
      return { id: data.slug || d.id, ...data };
    });

    const candidates = all.filter((b) => b.id !== (doc.data()?.slug || doc.id));

    const scored = candidates
      .map((b) => {
        const value = safeNumber(b.valueLGC, 0);
        const score = Math.abs(value - targetValue);
        const isSameRarity = Boolean(targetRarity && b.rarity === targetRarity);
        return { ...b, _score: score, _sameRarity: isSameRarity };
      })
      .sort((a, b) => {
        if (a._sameRarity !== b._sameRarity) return a._sameRarity ? -1 : 1;
        if (a._score !== b._score) return a._score - b._score;
        return String(a.name || "").localeCompare(String(b.name || ""));
      })
      .slice(0, limit)
      .map(({ _score, _sameRarity, ...rest }) => rest);

    return NextResponse.json({ brainrots: scored, count: scored.length });
  } catch (error) {
    console.error("Error fetching similar brainrots:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar brainrots" },
      { status: 500 }
    );
  }
}
