"use client";

import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";

export default function DemandDropdown({ value = [], setValue }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStar = (star) => {
    if (value.includes(star)) {
      setValue(value.filter((v) => v !== star));
    } else {
      setValue([...value, star]);
    }
  };

  const STARS = [1, 2, 3];

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          relative border border-[#E5E7EB] dark:border-slate-700 rounded-[10px]
          flex items-center justify-between px-[clamp(8px,0.8vw,10px)]
          py-[clamp(4px,0.4vw,5px)]
          w-[clamp(150px,14vw,200px)]
          h-[clamp(40px,4vw,50px)]
          font-urbanist text-[clamp(0.75rem,0.8vw,0.875rem)]
          text-black dark:text-white
          bg-white dark:bg-slate-800
        "
      >
        <span className="truncate">
          {value?.length > 0
            ? `Demand: ${value.sort().join(", ")}★`
            : "Demand"}
        </span>

        {/* Arrow */}
        <div
          className="
            flex items-center justify-center
            w-[clamp(20px,2vw,30px)]
            h-[clamp(20px,2vw,30px)]
            border border-[#E5E7EB] dark:border-slate-600
            rounded-[5px]
            absolute right-2 top-1/2 -translate-y-1/2
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className={`w-[clamp(12px,1.2vw,16px)] h-[clamp(12px,1.2vw,16px)] transition-transform duration-200 stroke-black dark:stroke-white ${open ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown list */}
      <div
        className={`
          absolute left-0 mt-2 w-full
          bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700
          rounded-[10px] shadow-sm
          overflow-hidden
          transition-all duration-300 ease-out z-20
          ${open ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <ul className="flex flex-col">
          {STARS.map((star) => (
            <li
              key={star}
              onClick={() => toggleStar(star)}
              className="
                flex items-center justify-between
                px-4 py-2 cursor-pointer
                hover:bg-[#F3F4F6] dark:hover:bg-slate-700
                font-urbanist text-[0.875rem] text-black dark:text-white
              "
            >
              <span>{"⭐".repeat(star)}</span>
              {value.includes(star) && <Check size={18} className="text-[#4F46E5]" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
