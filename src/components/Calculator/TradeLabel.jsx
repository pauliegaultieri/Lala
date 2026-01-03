import { ChevronDown, ChevronUp } from "lucide-react";

export default function TradeLabel({ type }) {
  const isYou = type === "you";

  return (
    <div
      className="
        flex items-center justify-center gap-2
        bg-[#4F46E5]
        text-white
        rounded-full
        w-[83px] h-[29px]
        font-urbanist
        font-medium
        text-[0.875rem]
      "
    >
      {isYou ? "You" : "Them"}
      {isYou ? (
        <ChevronDown size={14} className="text-white" />
      ) : (
        <ChevronUp size={14} className="text-white" />
      )}
    </div>
  );
}
