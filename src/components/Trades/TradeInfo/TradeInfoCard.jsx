"use client";

import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/Providers/ToastProvider";
import { useSession } from "next-auth/react";
import { getTradeResultForUser } from "@/lib/trade-utils";
import { 
  Copy, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeftRight,
  Eye,
  Share2
} from "lucide-react";
import TradeStatusBadge from "./TradeStatusBadge";
import TradeItemsSection from "./TradeItemsSection";
import TradeParticipant from "./TradeParticipant";
import TradeTimeline from "./TradeTimeline";

export default function TradeInfoCard({ trade }) {
  const toast = useToast();
  const { data: session, status: sessionStatus } = useSession();

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(trade.id);
      toast.success("Copied", "Trade ID copied");
    } catch {
      toast.error("Copy failed", "Could not copy Trade ID");
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/trades/${trade.id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", "Trade link copied to clipboard");
    } catch {
      toast.error("Copy failed", "Could not copy trade link");
    }
  };

  const viewerRobloxId =
    sessionStatus === "authenticated"
      ? session?.user?.robloxId || session?.user?.id
      : sessionStatus === "unauthenticated"
      ? "__guest__"
      : null;
  const ownerRobloxId = trade?.ownerRobloxId || trade?.postedBy?.robloxId || trade?._original?.ownerRobloxId;
  const isOwner = viewerRobloxId && ownerRobloxId
    ? String(viewerRobloxId) === String(ownerRobloxId)
    : sessionStatus === "authenticated"
    ? false
    : false;

  const offeringTotal = Number(trade.offeringTotal || 0);
  const lookingForTotal = Number(trade.lookingForTotal || 0);
  const valueDiff = isOwner ? lookingForTotal - offeringTotal : offeringTotal - lookingForTotal;

  const maxValue = Math.max(offeringTotal, lookingForTotal);
  const valueDiffPercent = maxValue > 0 ? ((Math.abs(valueDiff) / maxValue) * 100).toFixed(1) : 0;

  const povResult = getTradeResultForUser({ result: trade.result, ownerRobloxId }, viewerRobloxId) || trade.result;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-[#E5E7EB] dark:border-slate-700 overflow-hidden transition-colors">
      {/* Header Section */}
      <div className="p-6 sm:p-8 border-b border-[#E5E7EB] dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Trade ID and Status */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-urbanist text-sm text-[#6B7280]">Trade ID:</span>
                <code className="font-mono text-sm bg-[#F3F4F6] dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 text-[#020617] dark:text-white font-semibold">
                  #{trade.id}
                </code>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy Trade ID"
                >
                  <Copy size={16} className="text-[#6B7280]" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TradeStatusBadge status={trade.status} />
              <div className="flex items-center gap-1.5 text-[#6B7280]">
                <Eye size={14} />
                <span className="font-urbanist text-xs">{trade.views} views</span>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="
              flex items-center gap-2 px-4 py-2.5 rounded-[10px]
              bg-[#4F46E5] text-white
              text-sm font-medium font-urbanist
              hover:bg-[#4338CA] hover:scale-[1.02]
              active:scale-[0.98]
              transition-all duration-200
              cursor-pointer
            "
          >
            <Share2 size={16} />
            Share Trade
          </button>
        </div>
      </div>

      {/* Participants Section */}
      <div className="p-6 sm:p-8 border-b border-[#E5E7EB] dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-800/30">
        <h3 className="font-pp-mori font-semibold text-lg text-[#020617] dark:text-white mb-5">
          Participants
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TradeParticipant 
            label="Posted By"
            user={trade.postedBy}
            timestamp={trade.timestamps.posted}
            timestampFull={trade.timestamps.postedAt}
          />
          {trade.acceptedBy && (
            <TradeParticipant 
              label="Accepted By"
              user={trade.acceptedBy}
              timestamp={trade.timestamps.accepted}
              timestampFull={trade.timestamps.acceptedAt}
            />
          )}
        </div>
      </div>

      {/* Trade Items Section */}
      <div className="p-6 sm:p-8 border-b border-[#E5E7EB] dark:border-slate-700">
        <h3 className="font-pp-mori font-semibold text-lg text-[#020617] dark:text-white mb-5">
          Trade Items
        </h3>
        
        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-6">
          {/* Looking For */}
          <TradeItemsSection 
            title="Looking For"
            items={trade.lookingForItems}
            totalValue={trade.lookingForTotal}
            variant="looking"
          />

          {/* Swap Icon & Result */}
          <div className="flex lg:flex-col items-center justify-center gap-3 py-4 lg:py-0">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] dark:bg-slate-800 flex items-center justify-center border border-[#E5E7EB] dark:border-slate-700">
              <ArrowLeftRight size={20} className="text-[#6B7280]" />
            </div>
            {sessionStatus !== "loading" && povResult ? (
              <ResultBadge result={povResult} valueDiff={valueDiff} valueDiffPercent={valueDiffPercent} />
            ) : null}
          </div>

          {/* Offering */}
          <TradeItemsSection 
            title="Offering"
            items={trade.offeringItems}
            totalValue={trade.offeringTotal}
            variant="offering"
          />
        </div>

        {/* Value Comparison Bar */}
        {trade.status === "completed" && (
          <div className="mt-6 p-4 bg-[#F9FAFB] dark:bg-slate-800/50 rounded-[14px] border border-[#E5E7EB] dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-urbanist text-sm text-[#6B7280]">Value Comparison</span>
              <span className={`font-urbanist text-sm font-semibold ${
                valueDiff > 0 ? "text-emerald-500" : valueDiff < 0 ? "text-red-500" : "text-amber-500"
              }`}>
                {valueDiff > 0 ? "+" : ""}{valueDiff} ({valueDiff >= 0 ? "+" : ""}{valueDiffPercent}%)
              </span>
            </div>
            <div className="h-3 bg-[#E5E7EB] dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (trade.offeringTotal / (trade.offeringTotal + trade.lookingForTotal)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-urbanist text-xs text-[#6B7280]">Offering: {trade.offeringTotal}</span>
              <span className="font-urbanist text-xs text-[#6B7280]">Looking For: {trade.lookingForTotal}</span>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className="p-6 sm:p-8">
        <h3 className="font-pp-mori font-semibold text-lg text-[#020617] dark:text-white mb-5">
          Timeline
        </h3>
        <TradeTimeline trade={trade} />
      </div>
    </div>
  );
}

function ResultBadge({ result, valueDiff, valueDiffPercent }) {
  const resultStyles = {
    win: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      border: "border-emerald-500/30",
      label: "Win",
      icon: TrendingUp,
    },
    fair: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      border: "border-amber-500/30",
      label: "Fair",
      icon: Minus,
    },
    loss: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      border: "border-red-500/30",
      label: "Loss",
      icon: TrendingDown,
    },
  };

  const style = resultStyles[result];
  const Icon = style.icon;

  return (
    <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-[12px] ${style.bg} ${style.border} border`}>
      <div className="flex items-center gap-1.5">
        <Icon size={16} className={style.text} />
        <span className={`text-sm font-semibold font-urbanist ${style.text}`}>
          {style.label}
        </span>
      </div>
      <span className={`text-xs font-urbanist ${style.text}`}>
        {valueDiff > 0 ? "+" : ""}{valueDiff}
      </span>
    </div>
  );
}
