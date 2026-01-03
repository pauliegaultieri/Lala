import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  calculateFinalValueLGC,
  getAllowedMutationIds,
  getAllowedTraitIds,
  resolveMutation,
  resolveTraits,
} from "@/lib/modifiers";

async function getBrainrotBySlug(slug) {
  const collectionRef = adminDb.collection("brainrots");

  let doc = await collectionRef.doc(slug).get();
  if (!doc.exists) {
    const snapshot = await collectionRef.where("slug", "==", slug).limit(1).get();
    doc = snapshot.empty ? doc : snapshot.docs[0];
  }

  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getMutations() {
  const snapshot = await adminDb.collection("mutations").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getTraits() {
  const snapshot = await adminDb.collection("traits").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function POST(request) {
  try {
    const body = await request.json();

    const brainrotSlug = String(body?.brainrotSlug || body?.slug || "").trim();
    const mutationId = body?.mutationId == null || body?.mutationId === "" ? null : String(body.mutationId);
    const traitIds = Array.isArray(body?.traitIds) ? body.traitIds.map(String) : [];

    if (!brainrotSlug) {
      return NextResponse.json({ error: "brainrotSlug is required" }, { status: 400 });
    }

    const brainrot = await getBrainrotBySlug(brainrotSlug);
    if (!brainrot) {
      return NextResponse.json({ error: "Brainrot not found" }, { status: 404 });
    }

    const [mutations, traits] = await Promise.all([getMutations(), getTraits()]);

    const allowedMutationIds = getAllowedMutationIds(brainrot);
    const allowedTraitIds = getAllowedTraitIds(brainrot);

    const allowedMutations = mutations.filter((m) => allowedMutationIds.includes(String(m.id)));
    const allowedTraits = traits.filter((t) => allowedTraitIds.includes(String(t.id)));

    const effectiveMutationId = mutationId && allowedMutationIds.includes(String(mutationId)) ? mutationId : null;
    const effectiveTraitIds = traitIds.filter((id) => allowedTraitIds.includes(String(id)));

    const resolvedMutation = resolveMutation({
      mutations: allowedMutations,
      brainrot,
      selectedMutationId: effectiveMutationId,
    });

    const resolvedTraits = resolveTraits({
      traits: allowedTraits,
      brainrot,
      selectedTraitIds: effectiveTraitIds,
    });

    const calculation = calculateFinalValueLGC({
      baseValueLGC: Number(brainrot.valueLGC || 0),
      mutation: resolvedMutation.mutation,
      traits: resolvedTraits,
    });

    return NextResponse.json({
      brainrot: {
        id: brainrot.slug || brainrot.id,
        slug: brainrot.slug || null,
        name: brainrot.name || null,
        rarity: brainrot.rarity || null,
        valueLGC: Number(brainrot.valueLGC || 0),
      },
      input: {
        mutationId: mutationId,
        traitIds,
      },
      applied: {
        mutationId: effectiveMutationId,
        traitIds: effectiveTraitIds,
      },
      allowed: {
        mutationIds: allowedMutationIds,
        traitIds: allowedTraitIds,
      },
      multipliers: {
        mutationMultiplier: calculation.mutationMultiplier,
        traitsMultiplier: calculation.traitsMultiplier,
        totalMultiplier: calculation.totalMultiplier,
      },
      finalValueLGC: calculation.finalValueLGC,
    });
  } catch (error) {
    console.error("Error calculating value:", error);
    return NextResponse.json(
      { error: "Failed to calculate value" },
      { status: 500 }
    );
  }
}
