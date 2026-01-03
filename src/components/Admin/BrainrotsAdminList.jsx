"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import BrainrotListItem from "@/components/Admin/BrainrotListItem";

function normalizeString(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function formatOptionLabel(value) {
  const str = String(value || "");
  if (!str) return "";
  return str
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

export default function BrainrotsAdminList({ brainrots = [] }) {
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("all");
  const [demand, setDemand] = useState("all");
  const [isTopTodayOnly, setIsTopTodayOnly] = useState(false);
  const [isQuickTradeOnly, setIsQuickTradeOnly] = useState(false);
  const [sort, setSort] = useState("name_asc");

  const rarityOptions = useMemo(() => {
    const set = new Set();
    for (const b of brainrots) {
      if (b?.rarity) set.add(String(b.rarity));
    }
    return Array.from(set);
  }, [brainrots]);

  const demandOptions = useMemo(() => {
    const set = new Set();
    for (const b of brainrots) {
      if (b?.demand) set.add(String(b.demand));
    }
    return Array.from(set);
  }, [brainrots]);

  const filteredBrainrots = useMemo(() => {
    const q = normalizeString(search);

    let list = Array.isArray(brainrots) ? [...brainrots] : [];

    if (q) list = list.filter((b) => normalizeString(b?.name).includes(q));
    if (rarity !== "all") list = list.filter((b) => String(b?.rarity || "") === rarity);
    if (demand !== "all") list = list.filter((b) => String(b?.demand || "") === demand);

    if (isTopTodayOnly) list = list.filter((b) => Boolean(b?.isTopToday));
    if (isQuickTradeOnly) list = list.filter((b) => Boolean(b?.isQuickTrade));

    if (sort === "name_asc") list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
    if (sort === "name_desc") list.sort((a, b) => String(b?.name || "").localeCompare(String(a?.name || "")));
    if (sort === "value_desc") list.sort((a, b) => (Number(b?.valueLGC) || 0) - (Number(a?.valueLGC) || 0));
    if (sort === "value_asc") list.sort((a, b) => (Number(a?.valueLGC) || 0) - (Number(b?.valueLGC) || 0));

    return list;
  }, [brainrots, demand, isQuickTradeOnly, isTopTodayOnly, rarity, search, sort]);

  return (
    <div>
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brainrots by name..."
                className="w-full pl-9 pr-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <select
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              <option value="all">All rarities</option>
              {rarityOptions.map((r) => (
                <option key={r} value={r}>
                  {formatOptionLabel(r)}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              <option value="all">All demand</option>
              {demandOptions.map((d) => (
                <option key={d} value={d}>
                  {formatOptionLabel(d)}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              <option value="name_asc">Sort: Name (A→Z)</option>
              <option value="name_desc">Sort: Name (Z→A)</option>
              <option value="value_desc">Sort: Value (High→Low)</option>
              <option value="value_asc">Sort: Value (Low→High)</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm font-urbanist text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isTopTodayOnly}
              onChange={(e) => setIsTopTodayOnly(e.target.checked)}
              className="h-5 w-5 rounded-md border-2 border-[#94A3B8] dark:border-slate-600 accent-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 cursor-pointer"
            />
            Top today
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-urbanist text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isQuickTradeOnly}
              onChange={(e) => setIsQuickTradeOnly(e.target.checked)}
              className="h-5 w-5 rounded-md border-2 border-[#94A3B8] dark:border-slate-600 accent-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 cursor-pointer"
            />
            Quick trade
          </label>

          <div className="ml-auto text-sm font-urbanist text-gray-500 dark:text-gray-400">
            Showing {filteredBrainrots.length} / {brainrots.length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[20px] overflow-hidden transition-colors">
        {filteredBrainrots.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredBrainrots.map((brainrot) => (
              <li key={brainrot.id} className="px-6 py-5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <BrainrotListItem brainrot={brainrot} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No brainrots match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
