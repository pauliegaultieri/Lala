import { Plus, X } from "lucide-react";

function getModifierTextStyle(modifier) {
  if (!modifier) return undefined;
  if (Array.isArray(modifier?.gradient?.colors) && modifier.gradient.colors.length > 0) {
    const angle = Number.isFinite(Number(modifier.gradient.angle)) ? Number(modifier.gradient.angle) : 90;
    return {
      backgroundImage: `linear-gradient(${angle}deg, ${modifier.gradient.colors.join(", ")})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }
  if (modifier?.gradient?.from && modifier?.gradient?.to) {
    const angle = Number.isFinite(Number(modifier.gradient.angle)) ? Number(modifier.gradient.angle) : 90;
    return {
      backgroundImage: `linear-gradient(${angle}deg, ${modifier.gradient.from}, ${modifier.gradient.to})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }
  if (modifier?.color) return { color: modifier.color };
  return undefined;
}

function ItemHoverTooltip({ item }) {
  if (!item) return null;

  const hasMutation = Boolean(item.mutation?.name);
  const traits = Array.isArray(item.traits) ? item.traits.filter(Boolean) : [];

  return (
    <div
      className="
        absolute left-1/2 -translate-x-1/2 bottom-full mb-2
        w-max max-w-[240px] p-2.5 rounded-[12px]
        bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 shadow-lg
        opacity-0 group-hover:opacity-100
        transition-all duration-200
        pointer-events-none
        z-30
        transform-gpu translate-y-2 group-hover:translate-y-0
        font-urbanist
      "
    >
      <div className="font-pp-mori font-semibold text-[13px] text-[#020617] dark:text-white mb-2 line-clamp-2">
        {item.name}
      </div>

      {hasMutation && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-urbanist text-[#6B7280] dark:text-gray-400">Mutation:</span>
          <span className="text-xs font-urbanist font-semibold" style={getModifierTextStyle(item.mutation)}>
            {item.mutation.name}
          </span>
        </div>
      )}

      {traits.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-urbanist text-[#6B7280] dark:text-gray-400">Traits:</span>
          <div className="flex flex-wrap gap-1">
            {traits.map((trait, idx) => (
              <span
                key={`${trait?.name || "trait"}-${idx}`}
                className="px-2 py-1 rounded-[6px] text-xs font-urbanist font-medium bg-gray-100 dark:bg-slate-800"
                style={getModifierTextStyle(trait)}
              >
                {trait?.name || "Unknown"}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#E5E7EB] dark:border-t-slate-700" />
      <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-white dark:border-t-slate-900" />
    </div>
  );
}

export default function TradeSlot({ isEmpty, onAdd, onRemove, value }) {
  return (
    <div
      onClick={value ? undefined : onAdd}
      className={`
        relative group
        flex items-center justify-center
        border border-[#E5E7EB] dark:border-slate-700
        rounded-[12px] sm:rounded-[18px]
        bg-white dark:bg-slate-800
        w-[clamp(56px,20vw,100px)] sm:w-[clamp(64px,7vw,100px)]
        h-[clamp(56px,20vw,100px)] sm:h-[clamp(64px,7vw,100px)]
        ${!value && onAdd ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition" : ""}
      `}
    >
      {value ? (
        <>
          <img src={value.img} alt={value.name} className="max-w-[80%] max-h-[80%]" />
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="
                absolute -top-2 -right-2
                w-6 h-6 sm:w-7 sm:h-7
                flex items-center justify-center
                bg-red-500 hover:bg-red-600
                rounded-full
                transition-all duration-200
                cursor-pointer
                shadow-md
              "
            >
              <X size={14} className="sm:w-4 sm:h-4 text-white" />
            </button>
          )}
          <ItemHoverTooltip item={value} />
        </>
      ) : (
        isEmpty && <Plus size={24} className="sm:w-7 sm:h-7 text-[#9CA3AF] dark:text-gray-500" />
      )}
    </div>
  );
}
