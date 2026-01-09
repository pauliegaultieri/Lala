"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toTitleCase } from "@/lib/stringUtils";
import BrainrotImageCard from "@/components/ValueList/ValueInfo/BrainrotImageCard";
import BrainrotInfo from "@/components/ValueList/ValueInfo/BrainrotInfo";
import SimilarValues from "@/components/ValueList/ValueInfo/SimilarValues";
import ModifierSelectModal from "@/components/Modals/ModifierSelectModal/ModifierSelectModal";
import Breadcrumbs from "@/components/SEO/Breadcrumbs";
import {
  calculateFinalValueLGC,
  getAllowedMutationIds,
  getAllowedTraitIds,
  resolveMutation,
  resolveTraits,
} from "@/lib/modifiers";

function getModifierTextStyle(modifier) {
  if (!modifier) return undefined;
  if (modifier?.gradient?.from && modifier?.gradient?.to) {
    const angle = Number.isFinite(Number(modifier.gradient.angle)) ? Number(modifier.gradient.angle) : 90;
    return {
      backgroundImage: `linear-gradient(${angle}deg, ${modifier.gradient.from}, ${modifier.gradient.to})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }
  if (modifier?.color) return { color: modifier.color };
  return undefined;
}

export default function Page() {
  const params = useParams();
  const brainrotId = params.brainrot;
  const router = useRouter();

  const [brainrot, setBrainrot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mutations, setMutations] = useState([]);
  const [traits, setTraits] = useState([]);
  const [selectedMutationId, setSelectedMutationId] = useState(null);
  const [selectedTraitIds, setSelectedTraitIds] = useState([]);
  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [isTraitsModalOpen, setIsTraitsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchBrainrot() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/brainrots/${brainrotId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "Failed to fetch brainrot");
        setBrainrot(data);
      } catch (err) {
        console.error("Error fetching brainrot:", err);
        setError(err?.message || "Failed to fetch brainrot");
      } finally {
        setIsLoading(false);
      }
    }

    if (brainrotId) fetchBrainrot();
  }, [brainrotId]);

  useEffect(() => {
    async function fetchModifiers() {
      try {
        const [mutationsRes, traitsRes] = await Promise.all([
          fetch("/api/mutations?active=true"),
          fetch("/api/traits"),
        ]);

        if (mutationsRes.ok) {
          const data = await mutationsRes.json();
          setMutations(Array.isArray(data?.mutations) ? data.mutations : []);
        }

        if (traitsRes.ok) {
          const data = await traitsRes.json();
          const list = Array.isArray(data?.traits) ? data.traits : [];
          setTraits(list.filter((t) => t?.isActive !== false));
        }
      } catch (err) {
        console.error("Error fetching modifiers:", err);
      }
    }

    fetchModifiers();
  }, []);

  useEffect(() => {
    if (!brainrot) return;
    const allowedMutationIds = getAllowedMutationIds(brainrot);
    const allowedTraitIds = getAllowedTraitIds(brainrot);

    setSelectedMutationId((prev) => (prev && allowedMutationIds.includes(String(prev)) ? prev : null));
    setSelectedTraitIds((prev) => prev.filter((id) => allowedTraitIds.includes(String(id))));
  }, [brainrot]);

  const name = useMemo(() => {
    if (brainrot?.name) return brainrot.name;
    if (!brainrotId) return "";
    return toTitleCase(String(brainrotId).split("-").join(" "));
  }, [brainrot?.name, brainrotId]);

  const rarity = useMemo(() => {
    if (!brainrot?.rarity) return "";
    return toTitleCase(String(brainrot.rarity).split("-").join(" "));
  }, [brainrot?.rarity]);

  const cost = useMemo(() => {
    if (!brainrot?.cost) return "";
    return String(brainrot.cost);
  }, [brainrot?.cost]);

  const allowedMutationIds = useMemo(() => getAllowedMutationIds(brainrot), [brainrot]);
  const allowedTraitIds = useMemo(() => getAllowedTraitIds(brainrot), [brainrot]);

  const allowedMutations = useMemo(() => {
    if (!allowedMutationIds.length) return [];
    return mutations.filter((m) => allowedMutationIds.includes(String(m.id)));
  }, [mutations, allowedMutationIds]);

  const allowedTraits = useMemo(() => {
    if (!allowedTraitIds.length) return [];
    return traits.filter((t) => allowedTraitIds.includes(String(t.id)));
  }, [traits, allowedTraitIds]);

  const resolved = useMemo(() => {
    if (!brainrot) return { mutation: null, traits: [], mutationImageUrl: null };
    const { mutation, mutationImageUrl } = resolveMutation({
      mutations: allowedMutations,
      brainrot,
      selectedMutationId,
    });
    const resolvedTraits = resolveTraits({
      traits: allowedTraits,
      brainrot,
      selectedTraitIds,
    });

    return { mutation, traits: resolvedTraits, mutationImageUrl };
  }, [allowedMutations, allowedTraits, brainrot, selectedMutationId, selectedTraitIds]);

  const calculated = useMemo(() => {
    if (!brainrot) return null;
    return calculateFinalValueLGC({
      baseValueLGC: Number(brainrot.valueLGC || 0),
      mutation: resolved.mutation,
      traits: resolved.traits,
    });
  }, [brainrot, resolved.mutation, resolved.traits]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section
        className="mx-auto w-full max-w-350 px-4 sm:px-8 md:px-12"
        style={{
          marginTop: "clamp(2.5rem, 7vw, 6rem)",
          marginBottom: "clamp(2.5rem, 7vw, 6rem)",
        }}
      >
        {!isLoading && !error && brainrot && (
          <Breadcrumbs items={[
            { name: "Values", url: "/values" },
            { name: rarity || "Brainrot", url: `/values/categories/${brainrot.rarity}` },
            { name: name, url: `/values/brainrots/${brainrotId}` }
          ]} />
        )}
        {isLoading ? (
          <div className="w-full flex items-center justify-center py-24">
            <span className="loading loading-spinner loading-lg text-[#4F46E5]" />
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="w-full text-center py-10">
            <p className="font-urbanist text-[#6B7280] dark:text-gray-400">{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && !brainrot ? (
          <div className="w-full text-center py-10">
            <p className="font-urbanist text-[#6B7280] dark:text-gray-400">Brainrot not found</p>
          </div>
        ) : null}

        {isLoading || error || !brainrot ? null : (
        <h1 className="font-pp-mori font-semibold text-[3.75rem] text-[#020617] dark:text-white text-center mb-7.5">
          {" "}
          {name}{" "}
        </h1>
        )}

        {isLoading || error || !brainrot ? null : (
          <>
            {/* Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-10 lg:gap-16 items-start">
              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-8">
                {/* Main square card */}
                {/* THIS IS FOR DISPLAYING THE BRAINROT's IMAGE. */}
                <BrainrotImageCard name={name} imageSrc={resolved.mutationImageUrl || brainrot.imageUrl} />

                {(allowedMutations.length > 0 || allowedTraits.length > 0) && (
                  <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full p-6 border border-[#E5E7EB] dark:border-slate-700 transition-colors">
                    <h2 className="font-pp-mori font-semibold text-[1.5rem] text-[#020617] dark:text-white mb-4">
                      Mutations & Traits
                    </h2>

                    {allowedMutations.length > 0 && (
                      <div className="rounded-[18px] border border-[#E5E7EB] dark:border-slate-700 p-4 bg-[#F9FAFB] dark:bg-slate-800/50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-urbanist text-sm text-[#64748B] dark:text-gray-400">Mutation (choose 1)</p>
                            <p
                              className="mt-1 font-pp-mori text-[1.1rem] text-[#020617] dark:text-white"
                              style={getModifierTextStyle(resolved.mutation)}
                            >
                              {resolved.mutation?.name || "None"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsMutationModalOpen(true)}
                            className="px-4 py-2 rounded-[10px] bg-white dark:bg-slate-800 text-[#020617] dark:text-white border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/40 transition-colors font-urbanist cursor-pointer"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    )}

                    {allowedTraits.length > 0 && (
                      <div className="mt-4 rounded-[18px] border border-[#E5E7EB] dark:border-slate-700 p-4 bg-[#F9FAFB] dark:bg-slate-800/50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-urbanist text-sm text-[#64748B] dark:text-gray-400">Traits (choose any)</p>
                            {resolved.traits.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {resolved.traits.map((t) => (
                                  <span
                                    key={t.id}
                                    className="px-3 py-1.5 rounded-[999px] text-sm font-urbanist bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 text-[#020617] dark:text-white"
                                    style={getModifierTextStyle(t)}
                                  >
                                    {t.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 font-pp-mori text-[1.1rem] text-[#020617] dark:text-white">None</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsTraitsModalOpen(true)}
                            className="px-4 py-2 rounded-[10px] bg-white dark:bg-slate-800 text-[#020617] dark:text-white border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/40 transition-colors font-urbanist cursor-pointer"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN FOR DISPLAYING THE INFO OF THE BRAINROT */}
              <BrainrotInfo
                value={`${Number(calculated?.finalValueLGC ?? brainrot.valueLGC ?? 0).toFixed(2)} LGC`}
                demand={brainrot.demand === "very-high" ? 3 : brainrot.demand === "high" ? 2 : 1}
                rarity={rarity}
                cost={cost}
                published={brainrot.createdAt || null}
                lastUpdated={brainrot.updatedAt || null}
                onAddToCalculator={() => {
                  try {
                    const baseValueLGC = Number(brainrot.valueLGC || 0);
                    const finalValueLGC = Number(calculated?.finalValueLGC ?? baseValueLGC);
                    const selectedImageUrl =
                      resolved.mutationImageUrl || brainrot.imageUrl || "/images/temp/roblox.webp";
                    localStorage.setItem(
                      "calculator_prefill_item",
                      JSON.stringify({
                        id: brainrot.id,
                        name: brainrot.name,
                        img: selectedImageUrl,
                        imageUrl: selectedImageUrl,
                        baseValueLGC,
                        valueLGC: finalValueLGC,
                        mutationId: resolved.mutation?.id || null,
                        traitIds: resolved.traits.map((t) => String(t.id)),
                        mutation: resolved.mutation || null,
                        traits: resolved.traits || [],
                        rarity: brainrot.rarity,
                        demand: brainrot.demand,
                      })
                    );
                  } catch {}
                  router.push("/calculator");
                }}
                onTrade={() => {
                  try {
                    const baseValueLGC = Number(brainrot.valueLGC || 0);
                    const finalValueLGC = Number(calculated?.finalValueLGC ?? baseValueLGC);
                    const selectedImageUrl =
                      resolved.mutationImageUrl || brainrot.imageUrl || "/images/temp/roblox.webp";
                    localStorage.setItem(
                      "trade_post_prefill_offering_item",
                      JSON.stringify({
                        id: brainrot.id,
                        name: brainrot.name,
                        img: selectedImageUrl,
                        imageUrl: selectedImageUrl,
                        baseValueLGC,
                        valueLGC: finalValueLGC,
                        mutationId: resolved.mutation?.id || null,
                        traitIds: resolved.traits.map((t) => String(t.id)),
                        mutation: resolved.mutation || null,
                        traits: resolved.traits || [],
                        rarity: brainrot.rarity,
                        demand: brainrot.demand,
                      })
                    );
                  } catch {}
                  router.push("/trades/post");
                }}
              />
            </div>

            {/* Similar Values Section - Full Width */}
            <SimilarValues />
          </>
        )}

        <ModifierSelectModal
          isOpen={isMutationModalOpen}
          title="Mutation"
          subtitle={name}
          items={allowedMutations}
          selectedIds={selectedMutationId ? [selectedMutationId] : []}
          isMulti={false}
          includeNone
          noneLabel="None"
          onToggle={(id) =>
            setSelectedMutationId((prev) => (String(prev) === String(id) ? null : String(id)))
          }
          onClear={() => setSelectedMutationId(null)}
          onClose={() => setIsMutationModalOpen(false)}
        />

        <ModifierSelectModal
          isOpen={isTraitsModalOpen}
          title="Traits"
          subtitle={name}
          items={allowedTraits}
          selectedIds={selectedTraitIds}
          isMulti
          includeNone={false}
          onToggle={(id) =>
            setSelectedTraitIds((prev) =>
              prev.includes(String(id)) ? prev.filter((x) => x !== String(id)) : [...prev, String(id)]
            )
          }
          onClear={() => setSelectedTraitIds([])}
          onClose={() => setIsTraitsModalOpen(false)}
        />
      </section>
    </div>
  );
}
