"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Search } from "lucide-react";

function getModifierTextStyle(modifier) {
  if (!modifier) return undefined;
  if (modifier?.gradient?.colors && Array.isArray(modifier.gradient.colors)) {
    // Handle rainbow gradient with multiple colors
    const colors = modifier.gradient.colors.join(', ');
    return {
      backgroundImage: `linear-gradient(90deg, ${colors})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }
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

function normalizeString(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export default function MutationsAdminList({ mutations = [] }) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [sort, setSort] = useState("multiplier_desc");

  const filteredMutations = useMemo(() => {
    const q = normalizeString(search);

    let list = Array.isArray(mutations) ? [...mutations] : [];

    if (q) list = list.filter((m) => normalizeString(m?.name).includes(q));

    if (active !== "all") {
      const isActive = active === "active";
      list = list.filter((m) => Boolean(m?.isActive) === isActive);
    }

    if (sort === "multiplier_desc") list.sort((a, b) => (Number(b?.multiplier) || 0) - (Number(a?.multiplier) || 0));
    if (sort === "multiplier_asc") list.sort((a, b) => (Number(a?.multiplier) || 0) - (Number(b?.multiplier) || 0));
    if (sort === "name_asc") list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
    if (sort === "name_desc") list.sort((a, b) => String(b?.name || "").localeCompare(String(a?.name || "")));

    return list;
  }, [active, mutations, search, sort]);

  return (
    <div>
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-7">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mutations by name..."
                className="w-full pl-9 pr-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-urbanist text-[#020617] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="multiplier_desc">Sort: Multiplier (High→Low)</option>
              <option value="multiplier_asc">Sort: Multiplier (Low→High)</option>
              <option value="name_asc">Sort: Name (A→Z)</option>
              <option value="name_desc">Sort: Name (Z→A)</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4">
          <div className="ml-auto text-sm font-urbanist text-gray-500 dark:text-gray-400">
            Showing {filteredMutations.length} / {mutations.length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[20px] overflow-hidden transition-colors">
        {filteredMutations.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredMutations.map((mutation) => (
              <li key={mutation.id} className="px-6 py-5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 
                      className="text-lg font-medium text-gray-900 dark:text-white truncate"
                      style={getModifierTextStyle(mutation)}
                    >
                      {mutation?.name || "Untitled"}
                    </h3>
                    <div className="flex items-center mt-1 gap-2">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: mutation?.color || "#4F46E5", color: "white" }}
                      >
                        {Number(mutation?.multiplier) || 1}x
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {mutation?.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/mutations/${mutation.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium font-urbanist text-[#020617] dark:text-white bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Link>

                    <Link
                      href={`/admin/mutations/${mutation.id}/delete`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium font-urbanist text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No mutations match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
