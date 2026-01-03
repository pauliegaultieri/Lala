export default function TradeResultRow({ label, value = "N/A", valueColor }) {
  return (
    <div
      className="
        flex flex-wrap items-end justify-between
        pb-2
        border-b
        border-[#D8D8D8] dark:border-slate-700
        gap-x-2
      "
    >
      <span
        className="
          font-pp-mori
          font-normal
          text-sm sm:text-[1rem]
          text-black dark:text-white
          mr-auto
        "
      >
        {label}
      </span>

      <span
        className={`
          font-pp-mori
          font-normal
          text-right
          ${label === "Difference" ? "text-base sm:text-[1.25rem]" : "text-lg sm:text-[1.5rem]"}
          ${valueColor || "text-black dark:text-white"}
          break-words
          max-w-full sm:max-w-[60%]
        `}
      >
        {value}
      </span>
    </div>
  );
}
