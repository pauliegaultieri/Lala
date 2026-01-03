import { calculateBrainrotValue } from "@/lib/trade-utils";

function indexById(items = []) {
  const map = new Map();
  for (const item of items) {
    if (!item?.id) continue;
    map.set(String(item.id), item);
  }
  return map;
}

export function resolveMutation({ mutations = [], brainrot = null, selectedMutationId = null }) {
  if (!selectedMutationId) return { mutation: null, mutationImageUrl: null };

  const id = String(selectedMutationId);
  const mutation = indexById(mutations).get(id) || null;
  if (!mutation) return { mutation: null, mutationImageUrl: null };

  const override = brainrot?.mutationsConfig?.overridesById?.[id] || null;
  const multiplier = Number(override?.multiplier);
  const mutationImageUrl = override?.imageUrl || null;

  return {
    mutation: {
      ...mutation,
      multiplier: Number.isFinite(multiplier) && multiplier > 0 ? multiplier : mutation.multiplier,
    },
    mutationImageUrl,
  };
}

export function resolveTraits({ traits = [], brainrot = null, selectedTraitIds = [] }) {
  const traitsById = indexById(traits);

  const resolved = [];
  for (const rawId of Array.isArray(selectedTraitIds) ? selectedTraitIds : []) {
    const id = String(rawId);
    const trait = traitsById.get(id);
    if (!trait) continue;

    const override = brainrot?.traitsConfig?.overridesById?.[id] || null;
    const multiplier = Number(override?.multiplier);

    resolved.push({
      ...trait,
      multiplier: Number.isFinite(multiplier) && multiplier > 0 ? multiplier : trait.multiplier,
    });
  }

  return resolved;
}

export function calculateFinalValueLGC({ baseValueLGC = 0, mutation = null, traits = [] }) {
  const base = Number(baseValueLGC) || 0;
  return calculateBrainrotValue(base, mutation, traits);
}

export function getAllowedMutationIds(brainrot) {
  const ids = brainrot?.mutationsConfig?.enabledMutationIds;
  if (!Array.isArray(ids)) return [];
  return ids.map(String);
}

export function getAllowedTraitIds(brainrot) {
  const ids = brainrot?.traitsConfig?.enabledTraitIds;
  if (!Array.isArray(ids)) return [];
  return ids.map(String);
}
