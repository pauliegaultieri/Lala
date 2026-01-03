"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import CompletedTradeCard from "./CompletedTradeCard";
import { FadeIn } from "@/components/Animations";
import { useSession } from "next-auth/react";
import { formatTimeAgo, formatLGCValue, getTradeResultForUser } from "@/lib/trade-utils";
import { formatMutationsForDisplay, formatTraitsForDisplay } from "@/lib/mutation-trait-utils";

export default function CompletedTradesContainer() {
  const { data: session } = useSession();
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const viewerRobloxId = session?.user?.robloxId;

  const povTrades = useMemo(() => {
    if (!viewerRobloxId) return trades;
    return trades.map((trade) => {
      const ownerRobloxId = trade?._original?.ownerRobloxId;
      const povResult = getTradeResultForUser({ result: trade.result, ownerRobloxId }, viewerRobloxId) || trade.result;
      return { ...trade, povResult };
    });
  }, [trades, viewerRobloxId]);

  useEffect(() => {
    async function fetchCompletedTrades() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/trades/completed?limit=50");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch completed trades");
        }

        // Transform trades to the expected format
        const formattedTrades = await Promise.all((data.trades || []).map(async (trade) => ({
          id: trade.id,
          user1: {
            username: trade.ownerUsername,
            avatar: trade.ownerAvatarUrl || "/images/temp/roblox.webp",
            items: await Promise.all((trade.offeringItems || []).map(async (item) => {
              const [mutation] = item.mutation || item.mutationName
                ? await formatMutationsForDisplay([item.mutation || item.mutationName])
                : [null];

              const traitsArray = item.traits || item.traitNames || [];
              const traits = traitsArray.length > 0 ? await formatTraitsForDisplay(traitsArray) : [];

              return {
                name: item.name,
                imageUrl: item.imageUrl || "/images/temp/roblox.webp",
                value: item.finalValueLGC,
                mutation: mutation || null,
                traits,
              };
            })),
            totalValue: trade.offeringTotalLGC,
          },
          user2: {
            username: trade.joinedByUsername,
            avatar: trade.joinedByAvatarUrl || "/images/temp/roblox.webp",
            items: await Promise.all((trade.lookingForItems || []).map(async (item) => {
              const [mutation] = item.mutation || item.mutationName
                ? await formatMutationsForDisplay([item.mutation || item.mutationName])
                : [null];

              const traitsArray = item.traits || item.traitNames || [];
              const traits = traitsArray.length > 0 ? await formatTraitsForDisplay(traitsArray) : [];

              return {
                name: item.name,
                imageUrl: item.imageUrl || "/images/temp/roblox.webp",
                value: item.finalValueLGC,
                mutation: mutation || null,
                traits,
              };
            })),
            totalValue: trade.lookingForTotalLGC,
          },
          completedAt: formatTimeAgo(trade.completedAt),
          result: trade.result,
          resultPercentage: trade.resultPercentage,
          _original: trade,
        })));

        setTrades(formattedTrades);
      } catch (err) {
        console.error("Error fetching completed trades:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompletedTrades();
  }, []);

  const filters = [
    { id: "all", label: "All", count: povTrades.length },
    { id: "win", label: "Wins", count: povTrades.filter(t => (t.povResult || t.result) === "win").length, icon: TrendingUp, color: "text-emerald-500" },
    { id: "fair", label: "Fair", count: povTrades.filter(t => (t.povResult || t.result) === "fair").length, icon: Minus, color: "text-amber-500" },
    { id: "loss", label: "Losses", count: povTrades.filter(t => (t.povResult || t.result) === "loss").length, icon: TrendingDown, color: "text-red-500" },
  ];

  const filteredTrades = povTrades
    .filter(trade => activeFilter === "all" || (trade.povResult || trade.result) === activeFilter)
    .filter(trade => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        trade.user1.username.toLowerCase().includes(query) ||
        trade.user2.username.toLowerCase().includes(query) ||
        trade.id.includes(query)
      );
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        {/* Back Button */}
        <Link href="/trades" className="w-fit">
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

        {/* Title */}
        <FadeIn duration={0.6} distance={30}>
          <div className="text-center">
            <h1 className="font-pp-mori font-semibold text-[2rem] sm:text-[2.5rem] lg:text-[3rem] text-[#020617] dark:text-white">
              Completed <span className="text-[#4F46E5]">Trades</span>
            </h1>
            <p className="mt-2 font-urbanist text-sm sm:text-base text-[#6B7280]">
              Browse all recently completed trades across the platform
            </p>
          </div>
        </FadeIn>

        {/* Filters and Search Row */}
        <FadeIn delay={0.15} duration={0.5} distance={20} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 p-1.5 bg-[#F3F4F6] dark:bg-slate-800 rounded-[14px]">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-[10px] text-sm font-medium font-urbanist
                    transition-all duration-200 cursor-pointer
                    ${activeFilter === filter.id
                      ? "bg-white dark:bg-slate-900 text-[#020617] dark:text-white shadow-sm"
                      : "text-[#6B7280] hover:text-[#020617] dark:hover:text-white"
                    }
                  `}
                >
                  {Icon && <Icon size={14} className={activeFilter === filter.id ? filter.color : ""} />}
                  <span className="hidden sm:inline">{filter.label}</span>
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-xs font-semibold
                    ${activeFilter === filter.id
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#E5E7EB] dark:bg-slate-700 text-[#6B7280]"
                    }
                  `}>
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search by username or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full sm:w-[280px] pl-9 pr-4 py-2.5 rounded-[10px]
                bg-white dark:bg-slate-900
                border border-[#E5E7EB] dark:border-slate-700
                text-[#020617] dark:text-white text-sm font-urbanist
                placeholder:text-[#9CA3AF]
                focus:outline-none focus:border-[#4F46E5]/50
                transition-colors
              "
            />
          </div>
        </FadeIn>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-20">
          <p className="text-red-500 font-urbanist">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#6366F1] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Trades List */}
      {!isLoading && !error && (
        <div className="flex flex-col gap-4">
          {filteredTrades.length > 0 ? (
            filteredTrades.map((trade) => (
              <FadeIn key={trade.id} duration={0.5} distance={20}>
                <CompletedTradeCard trade={trade} />
              </FadeIn>
            ))
          ) : (
            /* Empty State */
            <FadeIn delay={0.25} duration={0.5} distance={20}>
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700">
                <div className="w-20 h-20 rounded-[20px] bg-[#F3F4F6] dark:bg-slate-800 flex items-center justify-center mb-6">
                  <Search size={36} className="text-[#6B7280]" />
                </div>
                <h3 className="font-pp-mori font-semibold text-xl text-[#020617] dark:text-white mb-2">
                  No trades found
                </h3>
                <p className="font-urbanist text-sm text-[#6B7280] max-w-sm">
                  {searchQuery 
                    ? "Try adjusting your search query or filters."
                    : "No completed trades match your current filters."
                  }
                </p>
              </div>
            </FadeIn>
          )}
          
          {/* Results Count */}
          {filteredTrades.length > 0 && (
            <p className="text-center font-urbanist text-sm text-[#6B7280] mt-4">
              Showing {filteredTrades.length} of {trades.length} completed trades
            </p>
          )}
        </div>
      )}
    </div>
  );
}
