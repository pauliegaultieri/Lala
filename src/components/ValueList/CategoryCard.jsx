"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function CategoryCard({ id, name, imageSrc, itemsAvailable, color }) {
  const href = `/values/categories/${id || encodeURIComponent(name.toLowerCase().replace(" ", "-"))}`;

  return (
    <Link href={href} className="block">
      <div
        className="
    relative
    bg-white dark:bg-slate-900
    rounded-[20px]
    w-full
    px-[20px]
    py-[20px]
    flex flex-col
    gap-4
    border border-[#E5E7EB] dark:border-slate-700
    transition-all duration-200
    cursor-pointer
    hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/30
    hover:shadow-xl hover:shadow-indigo-500/10
    motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.01]
    active:scale-[0.99]
  "
      >
        <div className="absolute top-4 right-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full hover:opacity-80 transition"
            style={{ backgroundColor: color || "#4F46E5" }}
          >
            <ArrowUpRight size={18} className="text-white" />
          </div>
        </div>

        <div className="flex items-center justify-center mt-4">
          <img
            src={imageSrc}
            alt={name}
            className="max-h-[180px] w-auto object-contain"
          />
        </div>

        <div className="flex justify-between items-center mt-auto">
          <span className="font-urbanist font-medium text-[1.25rem] text-black dark:text-white">
            {name}
          </span>

          <span className="bg-[#4F46E5] text-white text-[0.875rem] font-urbanist font-medium px-3 py-1 rounded-full">
            {itemsAvailable}+ available
          </span>
        </div>
      </div>
    </Link>
  );
}
