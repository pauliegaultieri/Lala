"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X, Loader2 } from "lucide-react";
import ValueCard from "@/components/shared/ValueCard";
import CategoryDropdown from "./CategoryDropdown";
import ValueRangeDropdown from "./ValueDropdown";
import DemandDropdown from "./DemandDropdown";
import { getTimeAgo } from "@/lib/time-ago";
import FilterPill from "./FilterPill";
import { useLenis } from "@/components/Providers/SmoothScrollProvider";
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

export default function SelectItemModal({ isOpen, onClose, onSelectItem }) {
  // Modal-level state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [valueRange, setValueRange] = useState(null);
  const [demand, setDemand] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [brainrots, setBrainrots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutations, setMutations] = useState([]);
  const [traits, setTraits] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 30;

  const [configBrainrot, setConfigBrainrot] = useState(null);
  const [configMutationId, setConfigMutationId] = useState(null);
  const [configTraitIds, setConfigTraitIds] = useState([]);
  const [isConfigMutationsOpen, setIsConfigMutationsOpen] = useState(false);
  const [isConfigTraitsOpen, setIsConfigTraitsOpen] = useState(false);
  const [configMutationSearch, setConfigMutationSearch] = useState("");
  const [configTraitSearch, setConfigTraitSearch] = useState("");
  const lenisRef = useLenis();

  const modalRef = useRef(null);

  // Fetch brainrots from API with pagination and search
  useEffect(() => {
    async function fetchBrainrots() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }

        if (selectedCategories.length > 0) {
          params.append('rarity', selectedCategories.map(c => c.toLowerCase().replaceAll(" ", "-")).join(','));
        }

        if (valueRange !== null) {
          params.append('maxValue', valueRange.toString());
        }

        const res = await fetch(`/api/brainrots?${params.toString()}`);
        const data = await res.json();
        
        if (page === 1) {
          setBrainrots(data.brainrots || []);
        } else {
          setBrainrots(prev => [...prev, ...(data.brainrots || [])]);
        }
        
        setHasMore(data.hasMore || false);
        setTotalCount(data.total || 0);
      } catch (error) {
        console.error("Error fetching brainrots:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchBrainrots();
    }
  }, [isOpen, page, searchQuery, selectedCategories, valueRange]);

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
      } catch (error) {
        console.error("Error fetching modifiers:", error);
      }
    }

    if (isOpen) fetchModifiers();
  }, [isOpen]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setBrainrots([]);
    }
  }, [searchQuery, selectedCategories, valueRange, isOpen]);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Disable background scroll and stop Lenis when modal is open
  useEffect(() => {
    const lenis = lenisRef?.current;
    const modal = modalRef.current;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (lenis) {
        lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (lenis) {
        lenis.start();
      }
    }

    // Handle wheel events to allow modal scrolling
    const handleWheel = (e) => {
      if (modal && modal.contains(e.target)) {
        e.stopPropagation();
      }
    };

    if (isOpen) {
      window.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("wheel", handleWheel);
      if (lenis) {
        lenis.start();
      }
    };
  }, [isOpen, lenisRef]);

  // Memoized filtered lists (must be before early return)
  const configAllowedMutationIds = configBrainrot ? getAllowedMutationIds(configBrainrot) : [];
  const configAllowedTraitIds = configBrainrot ? getAllowedTraitIds(configBrainrot) : [];

  const configAllowedMutations = mutations.filter((m) => configAllowedMutationIds.includes(String(m.id)));
  const configAllowedTraits = traits.filter((t) => configAllowedTraitIds.includes(String(t.id)));

  const filteredConfigMutations = useMemo(() => {
    const q = configMutationSearch.trim().toLowerCase();
    if (!q) return configAllowedMutations;
    return configAllowedMutations.filter((m) => String(m?.name || "").toLowerCase().includes(q));
  }, [configAllowedMutations, configMutationSearch]);

  const filteredConfigTraits = useMemo(() => {
    const q = configTraitSearch.trim().toLowerCase();
    if (!q) return configAllowedTraits;
    return configAllowedTraits.filter((t) => String(t?.name || "").toLowerCase().includes(q));
  }, [configAllowedTraits, configTraitSearch]);

  if (!shouldRender) return null;

  const configResolved = configBrainrot
    ? (() => {
        const { mutation, mutationImageUrl } = resolveMutation({
          mutations: configAllowedMutations,
          brainrot: configBrainrot,
          selectedMutationId: configMutationId,
        });
        const resolvedTraits = resolveTraits({
          traits: configAllowedTraits,
          brainrot: configBrainrot,
          selectedTraitIds: configTraitIds,
        });
        const calculated = calculateFinalValueLGC({
          baseValueLGC: Number(configBrainrot.valueLGC || 0),
          mutation,
          traits: resolvedTraits,
        });

        return { mutation, traits: resolvedTraits, mutationImageUrl, calculated };
      })()
    : null;

  const customizeOverlay =
    configBrainrot && configResolved && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 11001 }}>
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setConfigBrainrot(null)}
            />
            <div className="relative w-full max-w-[600px] max-h-[90vh] bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-[24px] shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="relative bg-[#4F46E5] p-6 text-white shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-pp-mori font-bold text-2xl">Customize Your Brainrot</h3>
                    <p className="font-urbanist text-white/80 text-sm mt-1">Choose mutations and traits to enhance value</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfigBrainrot(null)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div 
                className="p-6 space-y-6 overflow-y-auto modal-scrollbar flex-1"
                onWheel={(e) => e.stopPropagation()}
              >
                {/* Brainrot Info */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-[#4F46E5]/10 dark:from-indigo-900/20 dark:to-[#4F46E5]/20 rounded-[16px] border border-[#4F46E5]/20">
                  <img
                    src={configResolved.mutationImageUrl || configBrainrot.imageUrl || "/images/temp/roblox.webp"}
                    alt={configBrainrot.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-urbanist font-semibold text-lg text-gray-900 dark:text-white">{configBrainrot.name}</h4>
                    <p className="font-pp-mori text-sm text-gray-600 dark:text-gray-400">
                      Base: {Number(configBrainrot.valueLGC || 0).toFixed(2)} LGC
                    </p>
                  </div>
                </div>

                {/* Mutations Section */}
                {configAllowedMutations.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#4F46E5]"></div>
                      <h4 className="font-urbanist font-semibold text-gray-900 dark:text-white">Mutation</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">(choose 1)</span>
                    </div>
                    
                    {configAllowedMutations.length > 6 && (
                      <input
                        type="text"
                        placeholder="Search mutations..."
                        value={configMutationSearch}
                        onChange={(e) => setConfigMutationSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] text-sm font-urbanist border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                      />
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setConfigMutationId(null)}
                        className={`px-4 py-3 rounded-[12px] text-sm font-urbanist font-medium transition-all cursor-pointer ${
                          !configMutationId
                            ? "bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/25 transform scale-105"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600"
                        }`}
                      >
                        None
                      </button>
                      {filteredConfigMutations.map((m) => {
                        const isSelected = String(configMutationId) === String(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setConfigMutationId(String(m.id))}
                            className={`px-4 py-3 rounded-[12px] text-sm font-urbanist font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/25 transform scale-105"
                                : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600"
                            }`}
                            style={!isSelected ? getModifierTextStyle(m) : {}}
                          >
                            {m.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Traits Section */}
                {configAllowedTraits.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#4F46E5]"></div>
                      <h4 className="font-urbanist font-semibold text-gray-900 dark:text-white">Traits</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">(choose any)</span>
                    </div>
                    
                    {configAllowedTraits.length > 6 && (
                      <input
                        type="text"
                        placeholder="Search traits..."
                        value={configTraitSearch}
                        onChange={(e) => setConfigTraitSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] text-sm font-urbanist border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
                      />
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {filteredConfigTraits.map((t) => {
                        const id = String(t.id);
                        const isSelected = configTraitIds.includes(id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() =>
                              setConfigTraitIds((prev) =>
                                isSelected ? prev.filter((x) => x !== id) : [...prev, id]
                              )
                            }
                            className={`px-4 py-3 rounded-[12px] text-sm font-urbanist font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/25 transform scale-105"
                                : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600"
                            }`}
                            style={!isSelected ? getModifierTextStyle(t) : {}}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Footer */}
              <div className="p-6 pt-0 space-y-4 shrink-0">
                {/* Final Value Display */}
                <div className="bg-gradient-to-r from-indigo-50 to-[#4F46E5]/10 dark:from-indigo-900/20 dark:to-[#4F46E5]/20 rounded-[16px] p-6 border border-[#4F46E5]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-urbanist font-semibold text-gray-900 dark:text-white">Final Value</h4>
                      <p className="font-urbanist text-sm text-gray-600 dark:text-gray-400">With selected modifiers</p>
                    </div>
                    <div className="text-right">
                      <div className="font-pp-mori text-2xl font-bold text-[#4F46E5] dark:text-[#6366F1]">
                        {Number(configResolved.calculated?.finalValueLGC ?? configBrainrot.valueLGC ?? 0).toFixed(2)} LGC
                      </div>
                      {configResolved.calculated?.finalValueLGC > configBrainrot.valueLGC && (
                        <div className="font-urbanist text-xs text-[#4F46E5] dark:text-[#6366F1] font-medium">
                          +{((configResolved.calculated.finalValueLGC - configBrainrot.valueLGC) / configBrainrot.valueLGC * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfigBrainrot(null)}
                    className="flex-1 px-6 py-3 rounded-[12px] bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-urbanist font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const baseValueLGC = Number(configBrainrot.valueLGC || 0);
                      const finalValueLGC = Number(configResolved.calculated?.finalValueLGC ?? baseValueLGC);
                      const selectedImageUrl =
                        configResolved.mutationImageUrl || configBrainrot.imageUrl || "/images/temp/roblox.webp";
                      onSelectItem({
                        id: configBrainrot.id,
                        name: configBrainrot.name,
                        img: selectedImageUrl,
                        imageUrl: selectedImageUrl,
                        baseValueLGC,
                        value: finalValueLGC,
                        valueLGC: finalValueLGC,
                        mutationId: configResolved.mutation?.id || null,
                        traitIds: configResolved.traits.map((t) => String(t.id)),
                        mutation: configResolved.mutation || null,
                        traits: configResolved.traits || [],
                        rarity: configBrainrot.rarity,
                        demand: configBrainrot.demand === "very-high" ? 3 : configBrainrot.demand === "high" ? 2 : 1,
                      });
                      setConfigBrainrot(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-[12px] bg-[#4F46E5] text-white hover:bg-[#6366F1] transition-colors font-urbanist font-medium cursor-pointer shadow-lg shadow-[#4F46E5]/25"
                  >
                    Add to Trade
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 11000 }}>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />

      {/* Modal */}
      <div 
        ref={modalRef}
        className={`
          relative bg-white dark:bg-slate-900 rounded-[20px] 
          w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] max-w-[1100px] max-h-[85vh] 
          overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 
          flex flex-col gap-6 sm:gap-8 modal-scrollbar overscroll-contain
          transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
      >
        {/* Title */}
        <div className="flex items-center justify-between">
          <h2 className="font-pp-mori font-semibold text-[2.5rem] text-[#020617] dark:text-white">
            Select brainrot
          </h2>
          <button onClick={onClose} className="p-2 cursor-pointer">
            <X size={32} className="text-[#020617] dark:text-white" />
          </button>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex flex-wrap gap-4">
            <CategoryDropdown
              selected={selectedCategories}
              setSelected={setSelectedCategories}
            />
            <ValueRangeDropdown value={valueRange} setValue={setValueRange} />
            <DemandDropdown value={demand} setValue={setDemand} />
          </div>

          <div className="relative w-[clamp(180px,20vw,300px)] min-w-[150px]">
            <input
              type="text"
              placeholder="Search brainrots…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-urbanist text-[0.875rem] border border-[#E5E7EB] dark:border-slate-700 rounded-md px-[clamp(12px,1vw,16px)] py-[clamp(8px,0.8vw,12px)] w-full bg-white dark:bg-slate-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-[10px] bg-[#4F46E5] flex items-center justify-center"
            >
              <ArrowUpRight size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Filter pills */}
        {(selectedCategories.length > 0 || valueRange !== null || demand.length > 0) && (
          <div className="flex flex-wrap gap-3">
            {selectedCategories.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                onRemove={() =>
                  setSelectedCategories((prev) => prev.filter((c) => c !== cat))
                }
              />
            ))}

            {valueRange !== null && (
              <FilterPill
                label={`Value ≤ ${valueRange}`}
                onRemove={() => setValueRange(null)}
              />
            )}

            {demand.map((star) => (
              <FilterPill
                key={star}
                label={`${star}★ Demand`}
                onRemove={() => setDemand((prev) => prev.filter((s) => s !== star))}
              />
            ))}
          </div>
        )}

        {/* Grid */}
        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
          </div>
        ) : brainrots.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-urbanist text-[#6B7280] dark:text-gray-400">
              {searchQuery || selectedCategories.length > 0 
                ? "No brainrots match your filters" 
                : "No brainrots found"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {brainrots.map((brainrot) => (
              <ValueCard
                key={brainrot.id}
                imageSrc={brainrot.imageUrl || "/images/temp/roblox.webp"}
                name={brainrot.name}
                value={`${brainrot.valueLGC?.toFixed(2)} LGC`}
                demand={brainrot.demand === "very-high" ? 3 : brainrot.demand === "high" ? 2 : 1}
                postedAmount={getTimeAgo(brainrot.createdAt)?.amount || 0}
                postedUnit={getTimeAgo(brainrot.createdAt)?.unit || ''}
                action="add"
                onSelect={onSelectItem ? () => {
                  const allowedMutationIds = getAllowedMutationIds(brainrot);
                  const allowedTraitIds = getAllowedTraitIds(brainrot);

                  if (allowedMutationIds.length > 0 || allowedTraitIds.length > 0) {
                    setConfigBrainrot(brainrot);
                    setConfigMutationId(null);
                    setConfigTraitIds([]);
                    setIsConfigMutationsOpen(false);
                    setIsConfigTraitsOpen(false);
                    setConfigMutationSearch("");
                    setConfigTraitSearch("");
                    return;
                  }

                  onSelectItem({
                    id: brainrot.id,
                    name: brainrot.name,
                    img: brainrot.imageUrl || "/images/temp/roblox.webp",
                    imageUrl: brainrot.imageUrl || "/images/temp/roblox.webp",
                    baseValueLGC: brainrot.valueLGC,
                    value: brainrot.valueLGC,
                    valueLGC: brainrot.valueLGC,
                    mutationId: null,
                    traitIds: [],
                    mutation: null,
                    traits: [],
                    rarity: brainrot.rarity,
                    demand: brainrot.demand === "very-high" ? 3 : brainrot.demand === "high" ? 2 : 1,
                  });
                } : undefined}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="px-6 py-3 rounded-[12px] bg-[#4F46E5] text-white hover:bg-[#6366F1] transition-colors font-urbanist font-medium cursor-pointer shadow-lg shadow-[#4F46E5]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load More (${brainrots.length} of ${totalCount})`
                )}
              </button>
            </div>
          )}
        </>
        )}

      </div>

      {customizeOverlay}
    </div>
  );
}
