export default function QuickTradeCard({ name, imageUrl, value, demand, onTrade, isActive = false }) {
  return (
    <div
      className={`flex items-center w-full h-full rounded-[12px] sm:rounded-[16px] border bg-white dark:bg-[#0F172A] px-3 sm:px-4 py-2 sm:py-3 gap-3 sm:gap-4 transition-all duration-500 ${
        isActive 
          ? 'border-[#4F46E5] shadow-lg dark:shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
          : 'border-[#E5E7EB] dark:border-white/10 opacity-50'
      }`}
    >
      {/* Image */}
      <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-[10px] sm:rounded-[12px] overflow-hidden bg-[#F9FAFB] dark:bg-[#020617]/50 flex items-center justify-center transition-colors duration-300">
        <img src={imageUrl} alt={name} className="object-contain w-full h-full p-1" />
      </div>
      {/* Info */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="font-pp-mori font-semibold text-[#020617] dark:text-white text-sm sm:text-base mb-0.5 sm:mb-1 truncate transition-colors duration-300">{name}</div>
        <div className="flex flex-col gap-0 sm:gap-0.5 font-urbanist text-xs sm:text-sm text-[#64748B] dark:text-gray-400 transition-colors duration-300">
          <div>Value: <span className="font-medium text-[#020617] dark:text-gray-200 transition-colors duration-300">{value}</span></div>
          <div>Demand: <span className="text-yellow-500">{Array.from({ length: demand }).map((_, i) => '★').join('')}</span></div>
        </div>
      </div>
      {/* Trade Button */}
      {isActive && (
        <div className="flex flex-col justify-center">
          <button
            onClick={onTrade}
            className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-[8px] sm:rounded-[10px] bg-[#4F46E5] text-white text-xs sm:text-sm font-medium hover:bg-[#4338CA] transition-colors cursor-pointer font-urbanist"
          >
            Trade
          </button>
        </div>
      )}
    </div>
  );
}
