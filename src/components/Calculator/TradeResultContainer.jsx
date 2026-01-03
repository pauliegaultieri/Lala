import TradeResultRow from "./TradeResultRow";
import { formatLGCValue } from "@/lib/trade-utils";

export default function TradeResultContainer({ youItems = [], themItems = [], onClearAll }) {
  function getItemValueLGC(item) {
    if (!item) return 0;
    const value = item.valueLGC ?? item.finalValueLGC ?? item.baseValueLGC ?? 0;
    return Number(value) || 0;
  }

  // Calculate total values for each side
  const youTotal = youItems
    .filter(item => item !== null)
    .reduce((sum, item) => sum + getItemValueLGC(item), 0);
    
  const themTotal = themItems
    .filter(item => item !== null)
    .reduce((sum, item) => sum + getItemValueLGC(item), 0);
  
  // Calculate difference
  const difference = Math.abs(youTotal - themTotal);
  const maxValue = Math.max(youTotal, themTotal);
  const percentDiff = maxValue > 0 ? (difference / maxValue) * 100 : 0;
  
  // Determine win/loss/fair
  let result = "fair";
  if (percentDiff > 5) {
    result = youTotal > themTotal ? "win" : "lose";
  }
  
  // Format values for display
  const formattedYouTotal = formatLGCValue(youTotal);
  const formattedThemTotal = formatLGCValue(themTotal);
  const formattedDifference = formatLGCValue(difference);
  const formattedPercent = percentDiff > 0 ? `${Math.round(percentDiff * 10) / 10}%` : "0%";
  
  // Determine if there are any items to calculate
  const hasItems = youItems.some(item => item !== null) || themItems.some(item => item !== null);
  
  return (
    <div
      className="
        bg-white dark:bg-slate-900
        border border-[#E5E7EB] dark:border-slate-700
        rounded-[20px] sm:rounded-[25px]
        p-4 sm:p-6
        flex flex-col
        justify-between
        gap-4 sm:gap-6
        w-full lg:w-[clamp(260px,22vw,320px)]
        transition-colors
      "
    >
      {/* Title */}
      <h2
        className="
          text-center
          font-urbanist
          font-medium
          text-[1.5rem] sm:text-[2rem] lg:text-[2.1875rem]
          text-[#020617] dark:text-white
        "
      >
        Result
      </h2>

      {/* Middle content */}
      <div className="flex flex-col gap-3 sm:gap-[20px]">
        <TradeResultRow 
          label="You" 
          value={hasItems ? formattedYouTotal : "N/A"} 
          valueColor={result === "win" ? "text-green-500" : undefined}
        />
        <TradeResultRow 
          label="Them" 
          value={hasItems ? formattedThemTotal : "N/A"} 
          valueColor={result === "lose" ? "text-green-500" : undefined}
        />
        <TradeResultRow 
          label="Difference" 
          value={hasItems ? (
            <>
              <span className="inline-block">{formattedDifference}</span>
              <span className="inline-block ml-1">({formattedPercent})</span>
            </>
          ) : "N/A"} 
          valueColor={result === "fair" ? "text-yellow-500" : "text-gray-500"}
        />
        <TradeResultRow 
          label="Result" 
          value={hasItems ? result.toUpperCase() : "N/A"} 
          valueColor={
            result === "win" ? "text-green-500" : 
            result === "lose" ? "text-red-500" : 
            "text-yellow-500"
          }
        />
      </div>

      {/* Bottom button */}
      <div className="flex justify-center">
        <button
          onClick={onClearAll}
          className="
            border border-[#E5E7EB] dark:border-slate-700
            rounded-[8px]
            w-full sm:w-[clamp(180px,16vw,230px)]
            h-[44px] sm:h-[50px]
            font-urbanist
            font-medium
            text-sm sm:text-[1rem]
            text-[#4B5563] dark:text-gray-300
            transition-colors duration-200
            hover:bg-[#F9FAFB] dark:hover:bg-slate-800
            hover:border-[#D1D5DB] dark:hover:border-slate-600
            hover:cursor-pointer
          "
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
