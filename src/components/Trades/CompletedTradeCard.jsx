"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/components/Providers/ToastProvider";
import { useSession } from "next-auth/react";
import { getTradeResultForUser } from "@/lib/trade-utils";
import TradeItemSlot from "./TradeItemSlot";

const resultStyles = {
  win: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    label: "Win",
    icon: TrendingUp,
  },
  fair: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    label: "Fair Trade",
    icon: Minus,
  },
  loss: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
    label: "Loss",
    icon: TrendingDown,
  },
};

export default function CompletedTradeCard({ trade }) {
  const toast = useToast();
  const { data: session } = useSession();
  const viewerRobloxId = session?.user?.robloxId;
  const ownerRobloxId = trade?._original?.ownerRobloxId;
  const povResultKey = getTradeResultForUser({ result: trade.result, ownerRobloxId }, viewerRobloxId) || trade.result;

  const result = resultStyles[povResultKey] || resultStyles.fair;
  const ResultIcon = result.icon;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(trade.id);
      toast.success("Copied", "Trade ID copied");
    } catch {
      toast.error("Copy failed", "Could not copy Trade ID");
    }
  };

  const offeringTotal = Number(trade?.user1?.totalValue || 0);
  const lookingForTotal = Number(trade?.user2?.totalValue || 0);
  const isOwner = viewerRobloxId && ownerRobloxId ? String(viewerRobloxId) === String(ownerRobloxId) : true;

  const valueDiff = isOwner ? offeringTotal - lookingForTotal : lookingForTotal - offeringTotal;
  const maxValue = Math.max(offeringTotal, lookingForTotal);
  const valueDiffPercent = maxValue > 0 ? ((Math.abs(valueDiff) / maxValue) * 100).toFixed(1) : "0";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 overflow-hidden transition-colors hover:border-[#4F46E5]/30 hover:shadow-lg hover:shadow-[#4F46E5]/5">
      {/* Trade Content */}
      <div className="p-5">
        <div className="flex items-stretch gap-3 sm:gap-6">
          {/* User 1 Side */}
          <div className="flex-1 flex flex-col">
            {/* User Info */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 flex-shrink-0">
                <Image
                  src={trade.user1.avatar || "/images/temp/roblox.webp"}
                  alt={trade.user1.username}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-urbanist font-medium text-sm text-[#020617] dark:text-white truncate">
                {trade.user1.username}
              </span>
            </div>
            
            {/* Items Grid */}
            <div className="flex-1 bg-[#F9FAFB] dark:bg-slate-800/50 rounded-[14px] p-3 border border-[#E5E7EB] dark:border-slate-700">
              <div className="flex flex-wrap gap-2">
                {trade.user1.items.map((item, idx) => (
                  <TradeItemSlot
                    key={idx}
                    item={item}
                    showValueInTooltip
                    className="w-14 h-14 sm:w-16 sm:h-16"
                    roundedClassName="rounded-[10px]"
                    imagePaddingClassName="p-1"
                  />
                ))}
              </div>
              {/* Total Value */}
              <div className="mt-3 pt-2 border-t border-[#E5E7EB] dark:border-slate-700">
                <span className="font-urbanist text-xs text-[#6B7280]">Total: </span>
                <span className="font-urbanist text-sm font-semibold text-[#020617] dark:text-white">
                  {trade.user1.totalValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Swap Icon & Result Badge */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] dark:bg-slate-800 flex items-center justify-center">
              <ArrowLeftRight size={18} className="text-[#6B7280]" />
            </div>
            {/* Result Badge */}
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${result.bg} ${result.border} border`}>
              <ResultIcon size={12} className={result.text} />
              <span className={`text-xs font-semibold font-urbanist ${result.text}`}>
                {result.label}
              </span>
            </div>
          </div>

          {/* User 2 Side */}
          <div className="flex-1 flex flex-col">
            {/* User Info */}
            <div className="flex items-center gap-2 mb-3 justify-end">
              <span className="font-urbanist font-medium text-sm text-[#020617] dark:text-white truncate">
                {trade.user2.username}
              </span>
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 flex-shrink-0">
                <Image
                  src={trade.user2.avatar || "/images/temp/roblox.webp"}
                  alt={trade.user2.username}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Items Grid */}
            <div className="flex-1 bg-[#F9FAFB] dark:bg-slate-800/50 rounded-[14px] p-3 border border-[#E5E7EB] dark:border-slate-700">
              <div className="flex flex-wrap gap-2 justify-end">
                {trade.user2.items.map((item, idx) => (
                  <TradeItemSlot
                    key={idx}
                    item={item}
                    showValueInTooltip
                    className="w-14 h-14 sm:w-16 sm:h-16"
                    roundedClassName="rounded-[10px]"
                    imagePaddingClassName="p-1"
                  />
                ))}
              </div>
              {/* Total Value */}
              <div className="mt-3 pt-2 border-t border-[#E5E7EB] dark:border-slate-700 text-right">
                <span className="font-urbanist text-xs text-[#6B7280]">Total: </span>
                <span className="font-urbanist text-sm font-semibold text-[#020617] dark:text-white">
                  {trade.user2.totalValue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-[#F9FAFB] dark:bg-slate-800/50 border-t border-[#E5E7EB] dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Trade ID */}
          <div className="flex items-center gap-1.5">
            <span className="font-urbanist text-xs text-[#6B7280]">Trade ID:</span>
            <code className="font-mono text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-[#E5E7EB] dark:border-slate-700 text-[#020617] dark:text-white">
              {trade.id}
            </code>
            <button
              onClick={handleCopyId}
              className="p-1 rounded hover:bg-[#E5E7EB] dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Copy Trade ID"
            >
              <Copy size={12} className="text-[#6B7280]" />
            </button>
          </div>
          
          <span className="text-[#E5E7EB] dark:text-slate-700">|</span>
          
          {/* Timestamp */}
          <span className="font-urbanist text-xs text-[#6B7280]">
            Completed {trade.completedAt}
          </span>

          <span className="text-[#E5E7EB] dark:text-slate-700 hidden sm:inline">|</span>
          
          {/* Value Difference */}
          <span className={`font-urbanist text-xs font-medium hidden sm:inline ${
            valueDiff > 0 ? "text-emerald-500" : valueDiff < 0 ? "text-red-500" : "text-[#6B7280]"
          }`}>
            {valueDiff > 0 ? "+" : ""}{valueDiff} ({valueDiff >= 0 ? "+" : ""}{valueDiffPercent}%)
          </span>
        </div>

        {/* View Details Button */}
        <Link href={`/trades/${trade.id}`}>
          <button className="
            flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
            bg-white dark:bg-slate-800
            border border-[#E5E7EB] dark:border-slate-700
            text-[#020617] dark:text-white
            text-xs font-medium font-urbanist
            hover:border-[#4F46E5]/50
            transition-all duration-200
            cursor-pointer
          ">
            <ExternalLink size={12} />
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}
