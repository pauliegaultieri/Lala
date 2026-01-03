"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight, Clock, CheckCircle, XCircle, ExternalLink, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import TradeItemSlot from "./TradeItemSlot";
import { useToast } from "@/components/Providers/ToastProvider";

const statusStyles = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    label: "Pending",
    icon: Clock,
  },
  completed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    label: "Completed",
    icon: CheckCircle,
  },
  failed: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
    label: "Failed",
    icon: XCircle,
  },
};

export default function TradeActivityCard({ activity, currentUser, onTradeUpdate }) {
  const toast = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState(null);
  const status = statusStyles[activity.status] || statusStyles.pending;
  const StatusIcon = status.icon;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(activity.id);
      toast.success("Copied", "Trade ID copied");
    } catch {
      toast.error("Copy failed", "Could not copy Trade ID");
    }
  };

  const tradeId = activity._original?.id || activity.id;

  async function handleAccept() {
    if (!tradeId) return;
    setIsAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/trades/${tradeId}/accept`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept trade");
      }

      if (onTradeUpdate) onTradeUpdate();
    } catch (err) {
      console.error("Error accepting trade:", err);
      setError(err.message);
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleDecline() {
    if (!tradeId) return;
    setIsDeclining(true);
    setError(null);

    try {
      const response = await fetch(`/api/trades/${tradeId}/decline`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to decline trade");
      }

      if (onTradeUpdate) onTradeUpdate();
    } catch (err) {
      console.error("Error declining trade:", err);
      setError(err.message);
    } finally {
      setIsDeclining(false);
    }
  }

  // Determine if user can accept/decline (is participant and hasn't accepted yet)
  const canAccept = activity.status === "pending" && activity.isOwner !== undefined && (
    (activity.isOwner && !activity.ownerAccepted) || 
    (!activity.isOwner && !activity.joinerAccepted)
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 overflow-hidden transition-colors">
      {/* Status Header */}
      <div className={`px-5 py-3 ${status.bg} border-b ${status.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <StatusIcon size={18} className={status.text} />
          <span className={`font-urbanist font-semibold text-sm ${status.text}`}>
            {status.label}
          </span>
          {activity.failReason && (
            <span className="font-urbanist text-xs text-[#6B7280] ml-2">
              • {activity.failReason}
            </span>
          )}
        </div>
        <Link href={`/trades/${tradeId}`}>
          <button className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <ExternalLink size={16} className="text-[#6B7280]" />
          </button>
        </Link>
      </div>

      {/* Trade Content */}
      <div className="p-5">
        <div className="max-w-[820px] mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800">
                  <Image
                    src={activity.otherUser.avatar || "/images/temp/roblox.webp"}
                    alt={activity.otherUser.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-urbanist font-medium text-sm text-[#020617] dark:text-white">
                  {activity.otherUser.username}
                </span>
              </div>
            </div>

            <div className="shrink-0 w-10" />

            <div className="flex-1">
              <div className="flex items-center gap-2 justify-end">
                <span className="font-urbanist font-medium text-sm text-[#4F46E5]">
                  You
                </span>
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
                  {currentUser?.image ? (
                    <Image
                      src={currentUser.image}
                      alt="You"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-bold">
                      {currentUser?.name?.[0]?.toUpperCase() || "Y"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-4">
            <div>
              <div className="w-fit bg-[#F9FAFB] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-[16px] p-3">
                <div className="grid grid-cols-[repeat(3,3.5rem)] grid-rows-[repeat(3,3.5rem)] sm:grid-cols-[repeat(3,4rem)] sm:grid-rows-[repeat(3,4rem)] gap-2">
                  {Array.from({ length: 9 }).map((_, idx) => {
                    const item = activity.theirItems[idx];
                    return (
                      <TradeItemSlot
                        key={idx}
                        item={item}
                        className="w-full h-full"
                        roundedClassName="rounded-[12px]"
                        imagePaddingClassName="p-1"
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="shrink-0 px-1">
              <div className="pt-3 pb-3 grid grid-rows-[repeat(3,3.5rem)] sm:grid-rows-[repeat(3,4rem)] gap-2">
                <div />
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#F3F4F6] dark:bg-slate-800 flex items-center justify-center">
                    <ArrowLeftRight size={18} className="text-[#6B7280]" />
                  </div>
                </div>
                <div />
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-fit bg-[#F9FAFB] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-[16px] p-3">
                <div className="grid grid-cols-[repeat(3,3.5rem)] grid-rows-[repeat(3,3.5rem)] sm:grid-cols-[repeat(3,4rem)] sm:grid-rows-[repeat(3,4rem)] gap-2">
                  {Array.from({ length: 9 }).map((_, idx) => {
                    const item = activity.yourItems[idx];
                    return (
                      <TradeItemSlot
                        key={idx}
                        item={item}
                        className="w-full h-full"
                        roundedClassName="rounded-[12px]"
                        imagePaddingClassName="p-1"
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-[#F9FAFB] dark:bg-slate-800/50 border-t border-[#E5E7EB] dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-urbanist text-xs text-[#6B7280]">Trade ID:</span>
            <code className="font-mono text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-[#E5E7EB] dark:border-slate-700 text-[#020617] dark:text-white">
              {activity.id}
            </code>
            <button
              onClick={handleCopyId}
              className="p-1 rounded hover:bg-[#E5E7EB] dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Copy Trade ID"
            >
              <Copy size={12} className="text-[#6B7280]" />
            </button>
          </div>
          <span className="text-[#6B7280]">•</span>
          <span className="font-urbanist text-xs text-[#6B7280]">
            {activity.timeAgo}
          </span>
        </div>

        {/* Action Buttons for Pending */}
        {canAccept && (
          <div className="flex gap-2">
            <button 
              onClick={handleDecline}
              disabled={isDeclining}
              className="
                px-4 py-1.5 rounded-[8px]
                border border-[#E5E7EB] dark:border-slate-700
                bg-white dark:bg-slate-800
                text-[#020617] dark:text-white
                text-xs font-medium font-urbanist
                hover:border-red-500/50 hover:text-red-500
                transition-all duration-200
                cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-1
              "
            >
              {isDeclining && <Loader2 size={12} className="animate-spin" />}
              Decline
            </button>
            <button 
              onClick={handleAccept}
              disabled={isAccepting}
              className="
                px-4 py-1.5 rounded-[8px]
                bg-[#4F46E5] text-white
                text-xs font-medium font-urbanist
                hover:bg-[#6366F1]
                transition-all duration-200
                cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-1
              "
            >
              {isAccepting && <Loader2 size={12} className="animate-spin" />}
              Accept
            </button>
          </div>
        )}

        {/* Already accepted - waiting for other party */}
        {activity.status === "pending" && activity.isOwner !== undefined && (
          (activity.isOwner && activity.ownerAccepted) || 
          (!activity.isOwner && activity.joinerAccepted)
        ) && (
          <span className="font-urbanist text-xs text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full flex items-center gap-1">
            <CheckCircle size={12} />
            Accepted - waiting for other party
          </span>
        )}

        {/* View Details Link */}
        {activity.status !== "pending" && (
          <Link href={`/trades/${tradeId}`}>
            <button className="
              px-4 py-1.5 rounded-[8px]
              border border-[#E5E7EB] dark:border-slate-700
              bg-white dark:bg-slate-800
              text-[#020617] dark:text-white
              text-xs font-medium font-urbanist
              hover:border-[#4F46E5]/50
              transition-all duration-200
              cursor-pointer
              flex items-center gap-1
            ">
              <ExternalLink size={12} />
              View Details
            </button>
          </Link>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-5 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="font-urbanist text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
