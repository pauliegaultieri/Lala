import { Plus, X } from "lucide-react";

export default function TradeSlot({ isEmpty, onAdd, onRemove, value }) {
  return (
    <div
      onClick={value ? undefined : onAdd}
      className={`
        relative
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
        </>
      ) : (
        isEmpty && <Plus size={24} className="sm:w-7 sm:h-7 text-[#9CA3AF] dark:text-gray-500" />
      )}
    </div>
  );
}
