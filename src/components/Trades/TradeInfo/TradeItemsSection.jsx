"use client";

import TradeItemSlot from "../TradeItemSlot";

export default function TradeItemsSection({ title, items, totalValue, variant = "looking" }) {
  const isOffering = variant === "offering";
  
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-urbanist font-medium text-[#020617] dark:text-white">
          {title}
        </span>
        <span className="font-urbanist text-sm font-semibold text-[#4F46E5]">
          {totalValue.toLocaleString()}
        </span>
      </div>

      {/* Items Container */}
      <div className={`
        flex-1 p-4 rounded-[16px] border
        ${isOffering 
          ? "bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-900/10 dark:to-emerald-800/5 border-emerald-200/50 dark:border-emerald-800/30" 
          : "bg-gradient-to-br from-indigo-50/50 to-purple-100/30 dark:from-indigo-900/10 dark:to-purple-800/5 border-indigo-200/50 dark:border-indigo-800/30"
        }
      `}>
        {/* Items Grid */}
        <div className="flex flex-wrap gap-3">
          {items.map((item, idx) => (
            <TradeItemSlot
              key={idx}
              item={item}
              showValueInTooltip
              className="w-20 h-20 sm:w-24 sm:h-24"
              roundedClassName="rounded-[12px]"
              innerClassName="transition-all duration-200 hover:border-[#4F46E5]/50 hover:shadow-lg hover:shadow-[#4F46E5]/10 hover:scale-105"
              imagePaddingClassName="p-2"
            />
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-3 border-t border-[#E5E7EB]/50 dark:border-slate-700/50 flex items-center justify-between">
          <span className="font-urbanist text-sm text-[#6B7280]">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <span className="font-urbanist text-xs text-[#6B7280]">Total Value:</span>
            <span className="font-urbanist text-sm font-bold text-[#020617] dark:text-white">
              {totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
