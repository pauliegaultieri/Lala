import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAllowedMutationIds, getAllowedTraitIds, resolveMutation, resolveTraits } from "@/lib/modifiers";

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

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams?.id ? String(resolvedParams.id).trim() : "";

    if (!slug) {
      return NextResponse.json({ error: "Missing brainrot slug" }, { status: 400 });
    }

    const brainrot = await getBrainrotBySlug(slug);
    if (!brainrot) {
      return NextResponse.json({ error: "Brainrot not found" }, { status: 404 });
    }

    const [mutations, traits] = await Promise.all([getMutations(), getTraits()]);

    const allowedMutationIds = getAllowedMutationIds(brainrot);
    const allowedTraitIds = getAllowedTraitIds(brainrot);

    // Expand allowed mutations with per-brainrot overrides applied.
    const allowedMutationsRaw = mutations
      .filter((m) => allowedMutationIds.includes(String(m.id)))
      .map((m) => {
        const { mutation, mutationImageUrl } = resolveMutation({
          mutations: [m],
          brainrot,
          selectedMutationId: String(m.id),
        });

        return mutation
          ? {
              id: String(m.id),
              slug: String(m.slug || m.id),
              name: m.name || null,
              multiplier: Number(mutation.multiplier || m.multiplier || 1),
              color: m.color || null,
              gradient: m.gradient || null,
              imageUrl: mutationImageUrl || m.imageUrl || null,
              isActive: m.isActive !== false,
            }
          : null;
      })
      .filter(Boolean);

    // Expand allowed traits with per-brainrot overrides applied.
    const allowedTraitsRaw = resolveTraits({
      traits: traits.filter((t) => allowedTraitIds.includes(String(t.id))),
      brainrot,
      selectedTraitIds: allowedTraitIds,
    }).map((t) => ({
      id: String(t.id),
      slug: String(t.slug || t.id),
      name: t.name || null,
      multiplier: Number(t.multiplier || 1),
      color: t.color || null,
      gradient: t.gradient || null,
      isActive: t.isActive !== false,
    }));

    return NextResponse.json({
      brainrot: {
        id: brainrot.slug || brainrot.id,
        slug: brainrot.slug || null,
        name: brainrot.name || null,
      },
      mutations: allowedMutationsRaw,
      traits: allowedTraitsRaw,
      count: {
        mutations: allowedMutationsRaw.length,
        traits: allowedTraitsRaw.length,
      },
    });
  } catch (error) {
    console.error("Error fetching brainrot modifiers:", error);
    return NextResponse.json(
      { error: "Failed to fetch brainrot modifiers" },
      { status: 500 }
    );
  }
}
