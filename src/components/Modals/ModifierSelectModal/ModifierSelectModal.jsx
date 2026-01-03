"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLenis } from "@/components/Providers/SmoothScrollProvider";

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

export default function ModifierSelectModal({
  isOpen,
  title,
  subtitle,
  items,
  selectedIds,
  isMulti,
  includeNone,
  noneLabel,
  onToggle,
  onClear,
  onClose,
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lenisRef = useLenis();
  const modalRef = useRef(null);

  const shouldShowSearch = Array.isArray(items) && items.length >= 10;

  const normalizedSelectedIds = useMemo(() => {
    if (!Array.isArray(selectedIds)) return [];
    return selectedIds.map((v) => String(v));
  }, [selectedIds]);

  const filteredItems = useMemo(() => {
    if (!shouldShowSearch) return items;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => String(item?.name || "").toLowerCase().includes(q));
  }, [items, searchQuery, shouldShowSearch]);

  useEffect(() => {
    if (!shouldShowSearch && searchQuery) setSearchQuery("");
  }, [shouldShowSearch, searchQuery]);

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
      setSearchQuery("");
      const timer = setTimeout(() => setShouldRender(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const lenis = lenisRef?.current;
    const modal = modalRef.current;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (lenis) lenis.start();
    }

    const handleWheel = (e) => {
      if (modal && modal.contains(e.target)) e.stopPropagation();
    };

    if (isOpen) window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("wheel", handleWheel);
      if (lenis) lenis.start();
    };
  }, [isOpen, lenisRef]);

  if (!shouldRender || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 11000 }}>
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className={`
          relative bg-white dark:bg-slate-900 rounded-[20px]
          w-[calc(100vw-2rem)] max-w-[680px] max-h-[85vh]
          overflow-y-auto overflow-x-hidden p-5 sm:p-7
          border border-[#E5E7EB] dark:border-slate-700
          transition-all duration-200 ease-out
          ${isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"}
        `}
        data-lenis-prevent
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-pp-mori font-semibold text-[1.75rem] text-[#020617] dark:text-white">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-1 font-urbanist text-sm text-[#64748B] dark:text-gray-400">{subtitle}</p>
            ) : null}
          </div>

          <button type="button" onClick={onClose} className="p-2 cursor-pointer">
            <X size={28} className="text-[#020617] dark:text-white" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {shouldShowSearch ? (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full px-4 py-2 rounded-[12px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#020617] dark:text-white font-urbanist text-sm transition-colors"
            />
          ) : null}

          <div className="flex flex-wrap gap-2">
            {includeNone ? (
              <button
                type="button"
                onClick={() => onClear?.()}
                className={`px-3 py-2 rounded-[12px] text-sm font-urbanist border transition-colors cursor-pointer ${
                  normalizedSelectedIds.length === 0
                    ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                    : "bg-white dark:bg-slate-800 text-[#020617] dark:text-white border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/40"
                }`}
              >
                {noneLabel || "None"}
              </button>
            ) : null}

            {filteredItems.map((item) => {
              const id = String(item.id);
              const isSelected = normalizedSelectedIds.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggle(id)}
                  className={`px-3 py-2 rounded-[12px] text-sm font-urbanist border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                      : "bg-white dark:bg-slate-800 text-[#020617] dark:text-white border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/40"
                  }`}
                  style={!isSelected ? getModifierTextStyle(item) : undefined}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="font-urbanist text-sm text-[#64748B] dark:text-gray-400">
              {isMulti ? `${normalizedSelectedIds.length} selected` : null}
            </div>

            <div className="flex gap-3">
              {isMulti ? (
                <button
                  type="button"
                  onClick={() => onClear?.()}
                  className="px-4 py-2 rounded-[10px] bg-white dark:bg-slate-800 text-[#020617] dark:text-white border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/40 transition-colors font-urbanist cursor-pointer"
                >
                  Clear
                </button>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[10px] bg-[#4F46E5] text-white hover:bg-[#6366F1] transition-colors font-urbanist cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
