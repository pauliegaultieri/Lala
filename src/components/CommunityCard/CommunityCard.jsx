export default function CommunityCard({ name, imageUrl, value, demand = 0, onTrade, isActive = false }) {
  const containerStyle = isActive
    ? { boxShadow: "0 8px 30px rgba(79,70,229,0.18)", transform: "translateZ(0)" }
    : { opacity: 0.6 };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-6 px-6 py-5 rounded-xl border bg-[var(--card-bg)]"
        style={{ borderColor: "var(--border-color)", ...containerStyle }}
      >
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--card-bg)] border" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1">
          <div className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-family-pp-mori)" }}>{name}</div>
          <div className="mt-2 text-base text-white/90" style={{ fontFamily: "var(--font-urbanist)" }}>
            <div>Value: <span className="font-medium">{value}</span></div>
            <div className="mt-1">Demand: <span className="text-yellow-400">{Array.from({ length: demand }).map((_, i) => '★').join(' ')}</span></div>
          </div>
        </div>
      </div>

      {/* Trade button floats to the right, outside the card box so it can overlap */}
      <div className="absolute right-[-18px] top-1/2 -translate-y-1/2">
        <button
          onClick={onTrade}
          className="px-6 py-2 rounded-[12px] bg-[#6B46F6] text-white hover:bg-[#7c5df8] transition-colors shadow-lg"
          style={{ fontFamily: "var(--font-urbanist)" }}
        >
          Trade
        </button>
      </div>
    </div>
  );
}
