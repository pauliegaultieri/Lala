// components/SelectItemModal/FilterPill.jsx
import { X } from "lucide-react";

export default function FilterPill({ label, onRemove }) {
  return (
    <div
      className="
        flex items-center gap-2
        px-4 py-2
        bg-[#4F46E5]
        rounded-full
        font-urbanist
        text-[0.875rem]
        text-white
      "
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:opacity-80"
      >
        <X size={14} />
      </button>
    </div>
  );
}
