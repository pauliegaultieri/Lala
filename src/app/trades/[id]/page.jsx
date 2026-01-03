"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import TradeInfoCard from "@/components/Trades/TradeInfo/TradeInfoCard";
import { FadeIn } from "@/components/Animations";
import { formatTimeAgo, normalizeTradeItemsForTooltip } from "@/lib/trade-utils";

export default function TradeDetailsPage() {
  const params = useParams();
  const tradeId = params.id;
  const [trade, setTrade] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrade() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/trades/${tradeId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch trade");
        }

        // Transform API response to component format
        const formattedTrade = {
          id: data.trade.id,
          status: data.trade.status,
          ownerRobloxId: data.trade.ownerRobloxId,
          postedBy: {
            username: data.trade.ownerUsername,
            robloxId: data.trade.ownerRobloxId,
            avatar: data.trade.ownerAvatarUrl || "/images/temp/roblox.webp",
          },
          acceptedBy: data.trade.joinedByUsername ? {
            username: data.trade.joinedByUsername,
            robloxId: data.trade.joinedByRobloxId,
            avatar: data.trade.joinedByAvatarUrl || "/images/temp/roblox.webp",
          } : null,
          offeringItems: normalizeTradeItemsForTooltip(data.trade.offeringItems),
          lookingForItems: normalizeTradeItemsForTooltip(data.trade.lookingForItems),
          offeringTotal: data.trade.offeringTotalLGC || 0,
          lookingForTotal: data.trade.lookingForTotalLGC || 0,
          result: data.trade.result,
          timestamps: {
            posted: formatTimeAgo(data.trade.createdAt),
            postedAt: data.trade.createdAt ? new Date(data.trade.createdAt).toLocaleString() : null,
            accepted: data.trade.joinedAt ? formatTimeAgo(data.trade.joinedAt) : null,
            acceptedAt: data.trade.joinedAt ? new Date(data.trade.joinedAt).toLocaleString() : null,
            completed: data.trade.completedAt ? formatTimeAgo(data.trade.completedAt) : null,
            completedAt: data.trade.completedAt ? new Date(data.trade.completedAt).toLocaleString() : null,
            failed: data.trade.failedAt ? formatTimeAgo(data.trade.failedAt) : null,
            failedAt: data.trade.failedAt ? new Date(data.trade.failedAt).toLocaleString() : null,
          },
          views: data.trade.views || 0,
          ownerAccepted: data.trade.ownerAccepted,
          joinerAccepted: data.trade.joinerAccepted,
          failReason: data.trade.failReason,
          _original: data.trade,
        };

        setTrade(formattedTrade);
      } catch (err) {
        console.error("Error fetching trade:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (tradeId) {
      fetchTrade();
    }
  }, [tradeId]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-[900px]">
          {/* Back Button */}
          <FadeIn duration={0.4} distance={20}>
            <Link href="/trades" className="inline-block mb-6">
              <button className="
                flex items-center gap-2 px-4 py-2 rounded-[10px]
                bg-white dark:bg-slate-900 text-[#020617] dark:text-white
                text-sm font-medium font-urbanist
                border border-[#E5E7EB] dark:border-slate-700
                hover:border-[#4F46E5]/50 hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-200
                cursor-pointer
              ">
                <ArrowLeft size={18} />
                Back to Trades
              </button>
            </Link>
          </FadeIn>

          {/* Page Title */}
          <FadeIn duration={0.5} distance={25}>
            <div className="text-center mb-8">
              <h1 className="font-pp-mori font-semibold text-[2rem] sm:text-[2.5rem] lg:text-[3rem] text-[#020617] dark:text-white">
                Trade <span className="text-[#4F46E5]">Details</span>
              </h1>
              <p className="mt-2 font-urbanist text-sm sm:text-base text-[#6B7280]">
                View complete information about this trade
              </p>
            </div>
          </FadeIn>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-20">
              <p className="text-red-500 font-urbanist text-lg mb-2">Trade not found</p>
              <p className="text-[#6B7280] font-urbanist text-sm">{error}</p>
              <Link href="/trades">
                <button className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#6366F1] transition-colors">
                  Back to Trades
                </button>
              </Link>
            </div>
          )}

          {/* Trade Info Card */}
          {!isLoading && !error && trade && (
            <FadeIn duration={0.6} distance={30}>
              <TradeInfoCard trade={trade} />
            </FadeIn>
          )}
        </div>
      </section>
    </div>
  );
}
