"use client";

import { useState, useRef, useEffect } from "react";

export default function ValueRangeDropdown({ value, setValue }) {
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

  return (
    <div ref={ref} className="relative">
      {/* === TRIGGER === */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="
          relative
          border border-[#E5E7EB] dark:border-slate-700
          rounded-[10px]
          flex items-center justify-between
          px-[clamp(8px,0.8vw,10px)]
          py-[clamp(4px,0.4vw,5px)]
          w-[clamp(150px,14vw,200px)]
          h-[clamp(40px,4vw,50px)]
          font-urbanist
          text-[clamp(0.75rem,0.8vw,0.875rem)]
          text-black dark:text-white
          bg-white dark:bg-slate-800
        "
      >
        <span>
          {value !== null ? `Value: ${value}` : "Value range"}
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
            className={`
              w-[clamp(12px,1.2vw,16px)]
              h-[clamp(12px,1.2vw,16px)]
              transition-transform duration-200
              stroke-black dark:stroke-white
              ${open ? "rotate-180" : ""}
            `}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* === DROPDOWN === */}
      <div
        className={`
          absolute left-0 mt-2 w-full
          bg-white dark:bg-slate-800
          border border-[#E5E7EB] dark:border-slate-700
          rounded-[10px]
          shadow-sm
          transition-all duration-300 ease-out
          z-20
          overflow-hidden
          ${open ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-4 py-4 flex flex-col gap-3">
          {/* Labels */}
          <div className="flex justify-between text-sm font-urbanist text-black dark:text-white">
            <span>0</span>
            <span className="font-medium text-[#4F46E5]">
              {value ?? 0}
            </span>
            <span>100</span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={100}
            value={value ?? 0}
            onChange={e => setValue(Number(e.target.value))}
            className="range-purple"
          />
        </div>
      </div>
    </div>
  );
}
