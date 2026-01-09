"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, ChevronDown, ChevronUp, Search } from "lucide-react";
import { getRarities } from "@/lib/rarities-cache";

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

const DEMAND_LEVELS = [
  { id: "low", name: "Low (1 Star)" },
  { id: "medium", name: "Medium (2 Stars)" },
  { id: "high", name: "High (3 Stars)" },
  { id: "very-high", name: "Very High (4+ Stars)" },
];

export default function BrainrotForm({ initialData = null }) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [rarities, setRarities] = useState([]);
  const [mutations, setMutations] = useState([]);
  const [traits, setTraits] = useState([]);
  const [isMutationsSectionOpen, setIsMutationsSectionOpen] = useState(true);
  const [isTraitsSectionOpen, setIsTraitsSectionOpen] = useState(true);
  const [mutationSearch, setMutationSearch] = useState("");
  const [traitSearch, setTraitSearch] = useState("");

  const initialEnabledMutationIds = useMemo(() => {
    const ids = initialData?.mutationsConfig?.enabledMutationIds;
    if (!Array.isArray(ids)) return [];
    return ids.map(String);
  }, [initialData?.mutationsConfig?.enabledMutationIds]);

  const initialMutationOverrides = useMemo(() => {
    const overrides = initialData?.mutationsConfig?.overridesById;
    if (!overrides || typeof overrides !== "object") return {};
    return overrides;
  }, [initialData?.mutationsConfig?.overridesById]);

  const initialEnabledTraitIds = useMemo(() => {
    const ids = initialData?.traitsConfig?.enabledTraitIds;
    if (!Array.isArray(ids)) return [];
    return ids.map(String);
  }, [initialData?.traitsConfig?.enabledTraitIds]);

  const initialTraitOverrides = useMemo(() => {
    const overrides = initialData?.traitsConfig?.overridesById;
    if (!overrides || typeof overrides !== "object") return {};
    return overrides;
  }, [initialData?.traitsConfig?.overridesById]);

  const [enabledMutationIds, setEnabledMutationIds] = useState(initialEnabledMutationIds);
  const [mutationOverrides, setMutationOverrides] = useState(() => {
    const next = {};
    for (const [id, override] of Object.entries(initialMutationOverrides)) {
      next[String(id)] = {
        multiplier: override?.multiplier != null ? String(override.multiplier) : "",
        existingImageUrl: override?.imageUrl || "",
        imageFile: null,
        imagePreview: override?.imageUrl || "",
      };
    }
    return next;
  });

  const [enabledTraitIds, setEnabledTraitIds] = useState(initialEnabledTraitIds);
  const [traitOverrides, setTraitOverrides] = useState(() => {
    const next = {};
    for (const [id, override] of Object.entries(initialTraitOverrides)) {
      next[String(id)] = {
        multiplier: override?.multiplier != null ? String(override.multiplier) : "",
      };
    }
    return next;
  });
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    rarity: initialData?.rarity || "common",
    demand: initialData?.demand || "low",
    valueLGC: initialData?.valueLGC || 0,
    cost: initialData?.cost || "",
    imageUrl: initialData?.imageUrl || "",
    isTopToday: Boolean(initialData?.isTopToday),
    isQuickTrade: Boolean(initialData?.isQuickTrade),
    published: initialData?.published || false,
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredMutations = useMemo(() => {
    const q = mutationSearch.trim().toLowerCase();
    const base = isMutationsSectionOpen
      ? mutations
      : mutations.filter((m) => enabledMutationIds.includes(String(m?.id)));
    if (!q) return base;
    return base.filter((m) => String(m?.name || "").toLowerCase().includes(q));
  }, [enabledMutationIds, isMutationsSectionOpen, mutationSearch, mutations]);

  const filteredTraits = useMemo(() => {
    const q = traitSearch.trim().toLowerCase();
    const base = isTraitsSectionOpen
      ? traits
      : traits.filter((t) => enabledTraitIds.includes(String(t?.id)));
    if (!q) return base;
    return base.filter((t) => String(t?.name || "").toLowerCase().includes(q));
  }, [enabledTraitIds, isTraitsSectionOpen, traitSearch, traits]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch rarities from cache (minimizes Firestore reads)
        const raritiesData = await getRarities();
        setRarities(raritiesData);

        // Fetch mutations and traits
        const [mutationsRes, traitsRes] = await Promise.all([
          fetch("/api/admin/mutations"),
          fetch("/api/admin/traits"),
        ]);

        if (mutationsRes.ok) {
          const data = await mutationsRes.json();
          setMutations(Array.isArray(data?.mutations) ? data.mutations : []);
        }

        if (traitsRes.ok) {
          const data = await traitsRes.json();
          setTraits(Array.isArray(data?.traits) ? data.traits : []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    
    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      // Validate form
      if (!formData.name) {
        throw new Error("Name is required");
      }
      
      if (isNaN(parseFloat(formData.valueLGC))) {
        throw new Error("Value must be a valid number");
      }
      
      // Create form data for file upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("rarity", formData.rarity);
      submitData.append("demand", formData.demand);
      submitData.append("valueLGC", parseFloat(formData.valueLGC));
      submitData.append("cost", formData.cost);
      submitData.append("isTopToday", String(Boolean(formData.isTopToday)));
      submitData.append("isQuickTrade", String(Boolean(formData.isQuickTrade)));
      submitData.append("published", formData.published);

      const cleanedEnabledMutationIds = enabledMutationIds.map(String);
      const cleanedEnabledTraitIds = enabledTraitIds.map(String);

      const cleanedMutationOverrides = {};
      for (const id of cleanedEnabledMutationIds) {
        const override = mutationOverrides?.[id];
        if (!override) continue;

        const nextOverride = {};
        if (String(override.multiplier || "").trim()) {
          const parsed = Number(override.multiplier);
          if (Number.isFinite(parsed) && parsed > 0) nextOverride.multiplier = parsed;
        }

        const hasNewFile = override.imageFile instanceof File;
        const existingPreviewUrl = String(override.imagePreview || "").trim();
        if (!hasNewFile && existingPreviewUrl) nextOverride.imageUrl = existingPreviewUrl;

        if (Object.keys(nextOverride).length > 0) cleanedMutationOverrides[id] = nextOverride;

        if (hasNewFile) {
          submitData.append(`mutationImage_${id}`, override.imageFile);
        }
      }

      const cleanedTraitOverrides = {};
      for (const id of cleanedEnabledTraitIds) {
        const override = traitOverrides?.[id];
        if (!override) continue;

        const nextOverride = {};
        if (String(override.multiplier || "").trim()) {
          const parsed = Number(override.multiplier);
          if (Number.isFinite(parsed) && parsed > 0) nextOverride.multiplier = parsed;
        }

        if (Object.keys(nextOverride).length > 0) cleanedTraitOverrides[id] = nextOverride;
      }

      submitData.append("enabledMutationIds", JSON.stringify(cleanedEnabledMutationIds));
      submitData.append("mutationOverrides", JSON.stringify(cleanedMutationOverrides));
      submitData.append("enabledTraitIds", JSON.stringify(cleanedEnabledTraitIds));
      submitData.append("traitOverrides", JSON.stringify(cleanedTraitOverrides));
      
      if (imageFile) {
        submitData.append("image", imageFile);
      } else if (initialData?.imageUrl) {
        submitData.append("imageUrl", initialData.imageUrl);
      }
      
      // Submit to API
      const url = isEditing 
        ? `/api/admin/brainrots/${initialData.id}` 
        : "/api/admin/brainrots";
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        body: submitData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to save brainrot");
      }
      
      // Redirect on success
      router.push("/admin/brainrots");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/50 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Basics</div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Core details used throughout the site.</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                placeholder="Brainrot name"
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <label htmlFor="rarity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rarity *
            </label>
            <div className="mt-1">
              <select
                id="rarity"
                name="rarity"
                value={formData.rarity}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
              >
                {rarities.map((rarity) => (
                  <option key={rarity.id} value={rarity.id}>
                    {rarity.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-4">
            <label htmlFor="demand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Demand *
            </label>
            <div className="mt-1">
              <select
                id="demand"
                name="demand"
                value={formData.demand}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
              >
                {DEMAND_LEVELS.map((demand) => (
                  <option key={demand.id} value={demand.id}>
                    {demand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-4">
            <label htmlFor="valueLGC" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Value (LGC) *
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="valueLGC"
                id="valueLGC"
                value={formData.valueLGC}
                onChange={handleChange}
                required
                step="any"
                min="0"
                className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Value relative to La Grande Combinasion (1.0 LGC)
            </p>
          </div>

          <div className="lg:col-span-8">
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cost (Optional)
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="cost"
                id="cost"
                value={formData.cost}
                onChange={handleChange}
                className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                placeholder="e.g., $100M, $5B, $250K"
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Brainrot Image
            </label>

            <div className="mt-2 flex items-start">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex justify-center items-center w-full max-w-[200px] h-32 border-2 border-[#E5E7EB] dark:border-slate-700 border-dashed rounded-[12px] bg-white/60 dark:bg-slate-900/30">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <span className="relative rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 transition-colors">
                          Upload image
                        </span>
                      </div>
                    </div>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
          </div>
        </div>
      </div>

      <div>
          <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/50 p-4 sm:p-5 shadow-sm transition-colors">
            <button
              type="button"
              onClick={() => setIsMutationsSectionOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg leading-6 font-semibold text-gray-900 dark:text-white">Mutations</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                    {enabledMutationIds.length}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Choose which mutations are allowed for this brainrot. You can also override multipliers and upload
                  mutation-specific images.
                </p>
              </div>

              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                {isMutationsSectionOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
              </span>
            </button>

            {isMutationsSectionOpen && (
              <>
                {mutations.length > 0 && (
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={mutationSearch}
                        onChange={(e) => setMutationSearch(e.target.value)}
                        placeholder="Search mutations..."
                        className="block w-full pl-9 pr-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 mt-4">
                  {mutations.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No mutations found. Create some in the admin mutations section.
                    </p>
                  ) : (
                    filteredMutations.map((mutation) => {
                  const id = String(mutation.id);
                  const isEnabled = enabledMutationIds.includes(id);
                  const override = mutationOverrides[id] || {
                    multiplier: "",
                    existingImageUrl: "",
                    imageFile: null,
                    imagePreview: "",
                  };

                  return (
                    <div
                      key={id}
                      className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/40 p-4 transition-shadow duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                const nextEnabled = e.target.checked;
                                setEnabledMutationIds((prev) => {
                                  if (nextEnabled) return Array.from(new Set([...prev, id]));
                                  return prev.filter((v) => v !== id);
                                });

                                if (nextEnabled) {
                                  setMutationOverrides((prev) => ({
                                    ...prev,
                                    [id]: prev[id] || {
                                      multiplier: "",
                                      existingImageUrl: "",
                                      imageFile: null,
                                      imagePreview: "",
                                    },
                                  }));
                                }
                              }}
                              className="h-5 w-5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 accent-[#4F46E5]"
                            />
                            <div className="flex flex-col">
                              <span 
                                className="text-sm font-semibold text-gray-900 dark:text-white"
                                style={getModifierTextStyle(mutation)}
                              >
                                {mutation.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Default {mutation.multiplier}x</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            mutation.isActive === false
                              ? "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300"
                              : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300"
                          }`}
                        >
                          {mutation.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </div>

                      {isEnabled ? (
                        <div className="mt-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-950/20 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Override Multiplier</div>
                              <div className="mt-2">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={override.multiplier}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setMutationOverrides((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...(prev[id] || override),
                                        multiplier: value,
                                      },
                                    }));
                                  }}
                                  className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                                  placeholder={`${mutation.multiplier}`}
                                />
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mutated Image (Optional)</div>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-3 items-center">
                                {override.imagePreview ? (
                                  <div className="relative">
                                    <img
                                      src={override.imagePreview}
                                      alt={`${mutation.name} preview`}
                                      className="h-24 w-24 object-cover rounded-md"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMutationOverrides((prev) => ({
                                          ...prev,
                                          [id]: {
                                            ...(prev[id] || override),
                                            imageFile: null,
                                            imagePreview: "",
                                            existingImageUrl: "",
                                          },
                                        }));
                                      }}
                                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-center items-center w-24 h-24 border-2 border-[#E5E7EB] dark:border-slate-700 border-dashed rounded-[12px] bg-white/60 dark:bg-slate-900/30">
                                    <label htmlFor={`mutation-image-${id}`} className="cursor-pointer">
                                      <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-6 w-6 text-gray-400" />
                                        <div className="flex text-xs text-gray-600 dark:text-gray-400">
                                          <span className="relative rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 transition-colors">
                                            Upload
                                          </span>
                                        </div>
                                      </div>
                                      <input
                                        id={`mutation-image-${id}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          if (!file.type.startsWith("image/")) {
                                            setError("Please select an image file");
                                            return;
                                          }

                                          const reader = new FileReader();
                                          reader.onload = (event) => {
                                            setMutationOverrides((prev) => ({
                                              ...prev,
                                              [id]: {
                                                ...(prev[id] || override),
                                                imageFile: file,
                                                imagePreview: event.target.result,
                                                existingImageUrl: "",
                                              },
                                            }));
                                          };
                                          reader.readAsDataURL(file);
                                        }}
                                        className="sr-only"
                                      />
                                    </label>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                      ) : null}
                    </div>
                  );
                })
              )}
                </div>
              </>
            )}
          </div>
      </div>

      <div>
          <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/50 p-4 sm:p-5 shadow-sm transition-colors">
            <button
              type="button"
              onClick={() => setIsTraitsSectionOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg leading-6 font-semibold text-gray-900 dark:text-white">Traits</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                    {enabledTraitIds.length}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Choose which traits are allowed for this brainrot. Traits can stack; you can optionally override their
                  multipliers per brainrot.
                </p>
              </div>

              <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                {isTraitsSectionOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
              </span>
            </button>

            {isTraitsSectionOpen && (
              <>
                {traits.length > 0 && (
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={traitSearch}
                        onChange={(e) => setTraitSearch(e.target.value)}
                        placeholder="Search traits..."
                        className="block w-full pl-9 pr-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 mt-4">
                  {traits.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No traits found. Create some in the admin traits section.
                    </p>
                  ) : (
                    filteredTraits.map((trait) => {
                  const id = String(trait.id);
                  const isEnabled = enabledTraitIds.includes(id);
                  const override = traitOverrides[id] || { multiplier: "" };

                  return (
                    <div
                      key={id}
                      className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/40 p-4 transition-shadow duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                const nextEnabled = e.target.checked;
                                setEnabledTraitIds((prev) => {
                                  if (nextEnabled) return Array.from(new Set([...prev, id]));
                                  return prev.filter((v) => v !== id);
                                });

                                if (nextEnabled) {
                                  setTraitOverrides((prev) => ({
                                    ...prev,
                                    [id]: prev[id] || { multiplier: "" },
                                  }));
                                }
                              }}
                              className="h-5 w-5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 accent-[#4F46E5]"
                            />
                            <div className="flex flex-col">
                              <span 
                                className="text-sm font-semibold text-gray-900 dark:text-white"
                                style={getModifierTextStyle(trait)}
                              >
                                {trait.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Default {trait.multiplier}x</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            trait.isActive === false
                              ? "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300"
                              : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300"
                          }`}
                        >
                          {trait.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </div>

                      {isEnabled ? (
                        <div className="mt-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-950/20 p-4">
                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Override Multiplier</div>
                          <div className="mt-2 max-w-[260px]">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={override.multiplier}
                              onChange={(e) => {
                                const value = e.target.value;
                                setTraitOverrides((prev) => ({
                                  ...prev,
                                  [id]: {
                                    ...(prev[id] || override),
                                    multiplier: value,
                                  },
                                }));
                              }}
                              className="block w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors"
                              placeholder={`${trait.multiplier}`}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
                </div>
              </>
            )}
          </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/55 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Top Brainrots Today</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Manual featured slot controlled by admins.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="isTopToday"
                name="isTopToday"
                type="checkbox"
                checked={formData.isTopToday}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-500/20 peer-checked:bg-[#4F46E5] dark:peer-checked:bg-[#6366F1] transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-slate-100 rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Quick Trade cards</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Show this brainrot in quick trade surfaces.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="isQuickTrade"
                name="isQuickTrade"
                type="checkbox"
                checked={formData.isQuickTrade}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-500/20 peer-checked:bg-[#4F46E5] dark:peer-checked:bg-[#6366F1] transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-slate-100 rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/55 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Publish immediately</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">If off, this brainrot will be saved as a draft.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="published"
                name="published"
                type="checkbox"
                checked={formData.published}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-500/20 peer-checked:bg-[#4F46E5] dark:peer-checked:bg-[#6366F1] transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-slate-100 rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-[0_-10px_30px_rgba(2,6,23,0.06)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditing ? "Update Brainrot" : "Create Brainrot"}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
