"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Package, CheckCircle, Loader2, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/Animations";
import TradeListingCard from "@/components/Trades/TradeListingCard";
import { formatTimeAgo, normalizeTradeItemsForTooltip } from "@/lib/trade-utils";

function sortTrades(trades, sortBy) {
  const list = Array.isArray(trades) ? [...trades] : [];

  if (sortBy === "oldest") {
    return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }
  if (sortBy === "value-high") {
    return list.sort((a, b) => Number(b.offeringTotalLGC || 0) - Number(a.offeringTotalLGC || 0));
  }
  if (sortBy === "value-low") {
    return list.sort((a, b) => Number(a.offeringTotalLGC || 0) - Number(b.offeringTotalLGC || 0));
  }
  return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function getTabTrades(trades, tabId) {
  if (!Array.isArray(trades)) return [];
  if (tabId === "completed") return trades.filter((t) => t?.status === "completed");
  return trades.filter((t) => t?.status !== "completed");
}

function getPostedOnlyTrades(trades, subjectRobloxId) {
  if (!subjectRobloxId) return Array.isArray(trades) ? trades : [];
  const target = String(subjectRobloxId);
  if (!Array.isArray(trades)) return [];
  return trades.filter((t) => String(t?.ownerRobloxId || "") === target);
}

export default function ProfileListings({ session, tradesEndpoint, subjectRobloxId }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [sortBy, setSortBy] = useState("latest");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrades() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(tradesEndpoint || "/api/trades/activity?limit=100");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch trade history");
        }

        setTrades(Array.isArray(data?.trades) ? data.trades : []);
      } catch (err) {
        console.error("Error fetching trade history:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrades();
  }, [tradesEndpoint]);

  const visibleTrades = useMemo(() => {
    const targetRobloxId = subjectRobloxId || session?.user?.robloxId;
    if (!targetRobloxId) return [];
    return getPostedOnlyTrades(trades, targetRobloxId);
  }, [trades, subjectRobloxId, session?.user?.robloxId]);

  const tabTrades = useMemo(() => getTabTrades(visibleTrades, activeTab), [visibleTrades, activeTab]);
  const sortedTrades = useMemo(() => sortTrades(tabTrades, sortBy), [tabTrades, sortBy]);

  const cards = useMemo(() => {
    return sortedTrades.map((trade) => ({
      id: trade.id,
      username: trade.ownerUsername || "Unknown",
      userRobloxId: trade.ownerRobloxId,
      avatarUrl: trade.ownerAvatarUrl || "/images/temp/roblox.webp",
      timeAgo: formatTimeAgo(trade.createdAt),
      offeringItems: normalizeTradeItemsForTooltip(trade.offeringItems),
      lookingForItems: normalizeTradeItemsForTooltip(trade.lookingForItems),
      participation: null,
    }));
  }, [sortedTrades]);

  const tabs = [
    { id: "active", label: "Active Listings", count: getTabTrades(visibleTrades, "active").length, icon: Package },
    { id: "completed", label: "Completed", count: getTabTrades(visibleTrades, "completed").length, icon: CheckCircle },
  ];

  const sortOptions = [
    { value: "latest", label: "Latest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "value-high", label: "Highest Value" },
    { value: "value-low", label: "Lowest Value" },
  ];

  const currentSort = sortOptions.find(opt => opt.value === sortBy);

  return (
    <FadeIn delay={0.3} duration={0.6} distance={25}>
      <div className="w-full bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex flex-col gap-4 p-5 sm:p-6 border-b border-[#E5E7EB] dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-pp-mori font-semibold text-xl sm:text-2xl text-[#020617] dark:text-white">
            Trade History
          </h2>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-[10px]
                border border-[#E5E7EB] dark:border-slate-700
                bg-white dark:bg-slate-800
                text-[#020617] dark:text-white
                text-sm font-medium font-urbanist
                hover:border-[#4F46E5]/50
                transition-all duration-200
                cursor-pointer
              "
            >
              {currentSort?.label}
              <ChevronDown size={16} className={`transition-transform duration-200 text-[#6B7280] ${isSortOpen ? "rotate-180" : ""}`} />
            </button>

            {isSortOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[9998]" 
                  onClick={() => setIsSortOpen(false)} 
                />
                <div className="
                  absolute right-0 top-full mt-2 z-[9999]
                  w-44 py-2
                  bg-white dark:bg-slate-800
                  rounded-[10px]
                  border border-[#E5E7EB] dark:border-slate-700
                  shadow-xl
                ">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm font-urbanist
                        transition-colors duration-150 cursor-pointer
                        ${sortBy === option.value
                          ? "bg-[#4F46E5]/10 text-[#4F46E5]"
                          : "text-[#020617] dark:text-white hover:bg-[#F3F4F6] dark:hover:bg-slate-700"
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 p-1 bg-[#F3F4F6] dark:bg-slate-800 rounded-[12px] w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-medium font-urbanist
                  transition-all duration-200 cursor-pointer
                  ${activeTab === tab.id
                    ? "bg-white dark:bg-slate-900 text-[#020617] dark:text-white shadow-sm"
                    : "text-[#6B7280] hover:text-[#020617] dark:hover:text-white"
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
                <span className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${activeTab === tab.id
                    ? "bg-[#4F46E5] text-white"
                    : "bg-[#E5E7EB] dark:bg-slate-700 text-[#6B7280]"
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 sm:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-[20px] bg-[#F3F4F6] dark:bg-slate-800 flex items-center justify-center mb-6">
              <AlertCircle size={36} className="text-red-500" />
            </div>
            <h3 className="font-pp-mori font-semibold text-xl text-[#020617] dark:text-white mb-2">
              Couldn’t load trade history
            </h3>
            <p className="font-urbanist text-sm text-[#6B7280] dark:text-gray-400 max-w-sm mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
            {cards.map((card) => (
              <FadeIn key={card.id} duration={0.5} distance={25}>
                <div className="relative">
                  <TradeListingCard
                    username={card.username}
                    userRobloxId={card.userRobloxId}
                    avatarUrl={card.avatarUrl}
                    timeAgo={card.timeAgo}
                    offeringItems={card.offeringItems}
                    lookingForItems={card.lookingForItems}
                    onViewClick={() => router.push(`/trades/${card.id}`)}
                  />

                  {card.participation && (
                    <div className="pointer-events-none absolute top-[58px] right-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-urbanist font-semibold border ${
                          card.participation === "posted"
                            ? "bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20"
                            : "bg-[#F3F4F6] dark:bg-slate-800 text-[#6B7280] dark:text-gray-300 border-[#E5E7EB] dark:border-slate-700"
                        }`}
                      >
                        {card.participation === "posted" ? "Posted" : "Joined"}
                      </span>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-[20px] bg-[#F3F4F6] dark:bg-slate-800 flex items-center justify-center mb-6">
              {activeTab === "active" ? (
                <Package size={36} className="text-[#6B7280]" />
              ) : (
                <CheckCircle size={36} className="text-[#6B7280]" />
              )}
            </div>
            <h3 className="font-pp-mori font-semibold text-xl text-[#020617] dark:text-white mb-2">
              {activeTab === "active" ? "No active listings" : "No completed trades"}
            </h3>
            <p className="font-urbanist text-sm text-[#6B7280] dark:text-gray-400 max-w-sm mb-6">
              {activeTab === "active"
                ? "Start trading by creating your first listing. It only takes a few seconds!"
                : "Your completed trades will appear here once you finish some trades."}
            </p>

            {activeTab === "active" && (
              <Link href="/trades/post">
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-[10px] bg-[#4F46E5] text-white text-sm font-medium font-urbanist hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <Plus size={18} />
                  Create Listing
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
    </FadeIn>
  );
}
