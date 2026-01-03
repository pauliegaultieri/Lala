"use client";

export default function ProfileStats() {
  const stats = [
    { value: 0, label: "Trades Posted", color: "text-emerald-500" },
    { value: 0, label: "Trades Accepted", color: "text-blue-500" },
    { value: 0, label: "Completed Trades", color: "text-amber-500" },
    { value: 0, label: "Failed Trades", color: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="
            flex flex-col gap-1 p-4 rounded-xl
            bg-gray-50 dark:bg-slate-800/50
            border border-gray-100 dark:border-slate-700/50
            transition-all duration-200
            hover:border-[#4F46E5]/30 dark:hover:border-[#4F46E5]/30
          "
        >
          <span className={`text-2xl sm:text-3xl font-bold ${stat.color}`} style={{ fontFamily: "var(--font-pp-mori)" }}>
            {stat.value}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-urbanist">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
