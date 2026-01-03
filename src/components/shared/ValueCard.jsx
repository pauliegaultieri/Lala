"use client";

import { ArrowUpRight, Plus } from "lucide-react";

export default function ValueCard({
  imageSrc,
  name,
  value,
  demand,
  postedAmount,
  postedUnit,
  className = "",
  onSelect,
  action = "navigate",
}) {
  return (
    <div
      onClick={onSelect}
      className={`
        bg-white dark:bg-slate-900
        rounded-[20px]
        px-[20px]
        py-[32px]
        flex flex-col
        gap-6
        border border-[#E5E7EB] dark:border-slate-700 border-[1px]
        transition-all duration-200
        cursor-pointer
        relative
        hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/30
        hover:shadow-xl hover:shadow-indigo-500/10
        hover:z-10
        motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.01]
        active:scale-[0.99]
        ${className || "w-full"}
      `}
    >
      {/* Image */}
      <div className="flex items-center justify-center">
        <img
          src={imageSrc}
          alt={name}
          className="
            max-h-[180px]
            w-auto
            object-contain
          "
        />
      </div>

      {/* Bottom info row */}
      <div className="flex items-end justify-between">
        {/* Left info */}
        <div className="flex flex-col gap-1">
          {/* Name */}
          <span
            className="
              font-urbanist
              font-medium
              text-[1.5rem]
              text-black dark:text-white
            "
          >
            {name}
          </span>

          {/* Value */}
          <span
            className="
              font-pp-mori
              font-normal
              text-[1rem]
              text-black dark:text-white
            "
          >
            Value: {value}
          </span>

          {/* Demand stars */}
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < demand
                    ? "text-[#FACC15] text-[1rem]"
                    : "text-[#D1D5DB] text-[1rem]"
                }
              >
                ★
              </span>
            ))}
          </div>

          {/* Posted */}
          <span
            className="
              font-urbanist
              text-[1rem]
              text-[#6B7280]
            "
          >
            Posted: {postedAmount} {postedUnit}{postedAmount > 1 ? 's' : ''} ago
          </span>
        </div>

        {/* Plus button */}
        <div
          className="
            flex items-center justify-center
            w-[40px] h-[40px]
            rounded-full
            bg-[#4F46E5]
            shrink-0
            transition-transform duration-200
            hover:scale-110
          "
        >
          {action === "add" ? (
            <Plus size={20} className="text-white" />
          ) : (
            <ArrowUpRight size={20} className="text-white" />
          )}
        </div>
      </div>
    </div>
  );
}
