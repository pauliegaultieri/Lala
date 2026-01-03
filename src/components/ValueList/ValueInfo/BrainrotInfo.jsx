import { timeAgo } from "@/lib/stringUtils";

export default function BrainrotInfo({
  value,
  demand,
  rarity,
  cost,
  published,
  lastUpdated,
  onAddToCalculator,
  onTrade,
}) {
  const rows = [
    { label: "Value", value },
    { label: "Demand", value: "⭐".repeat(demand) },
    { label: "Rarity", value: rarity },
    ...(cost ? [{ label: "Cost", value: cost }] : []),
    { label: "Created At", value: timeAgo(published) },
    { label: "Updated At", value: timeAgo(lastUpdated) },
  ];

  return (
    <div className="
      bg-white dark:bg-slate-900
      rounded-[40px]
      w-full
      max-w-[540px]       /* wider on large screens */
      min-h-[600px]       /* taller */
      p-6
      flex flex-col justify-between
      mx-auto             /* center horizontally */
      transition-colors
    ">
      <div className="flex flex-col gap-5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center border-b border-[#D8D8D8] dark:border-slate-700 pb-2"
          >
            <span className="text-[1.5rem] text-black dark:text-white font-pp-mori">{row.label}</span>
            <span className="text-[1.5rem] text-black dark:text-white font-pp-mori">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={onAddToCalculator}
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 text-[#020617] dark:text-white rounded-[10px] text-base font-normal cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-urbanist"
        >
          Add to calculator
        </button>
        <button
          type="button"
          onClick={onTrade}
          className="flex-1 px-4 py-3 bg-[#6366F1] text-white rounded-[10px] text-base font-normal cursor-pointer hover:bg-[#4F46E5] transition-colors font-urbanist"
        >
          Trade it!
        </button>
      </div>
    </div>
  );
}
