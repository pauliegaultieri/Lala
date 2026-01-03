"use client";

import { useState, useEffect } from "react";
import { Plus, Activity, CheckCircle, Loader2, Filter, X } from "lucide-react";
import Link from "next/link";
import TradeListingCard from "@/components/Trades/TradeListingCard";
import TradeDetailsModal from "@/components/Modals/TradeDetailsModal/TradeDetailsModal";
import SelectItemModal from "@/components/Modals/SelectItemModal/SelectItemModal";
import { FadeIn } from "@/components/Animations";
import { formatTimeAgo, formatLGCValue } from "@/lib/trade-utils";
import { formatMutationsForDisplay, formatTraitsForDisplay } from "@/lib/mutation-trait-utils";

export default function TradesPage() {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formattedTrades, setFormattedTrades] = useState([]);
  
  // Filter state
  const [offeringFilter, setOfferingFilter] = useState(null);
  const [lookingForFilter, setLookingForFilter] = useState(null);
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [isLookingForModalOpen, setIsLookingForModalOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    async function fetchTrades() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Build query parameters for filtering
        const params = new URLSearchParams({
          status: "active",
          limit: "50",
        });
        
        if (offeringFilter) {
          const offeringKey = offeringFilter.id ?? offeringFilter.name;
          if (offeringKey) params.append("offering", String(offeringKey));
        }
        
        if (lookingForFilter) {
          const lookingForKey = lookingForFilter.id ?? lookingForFilter.name;
          if (lookingForKey) params.append("lookingFor", String(lookingForKey));
        }
        
        const response = await fetch(`/api/trades?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch trades");
        }

        setTrades(data.trades || []);
        
        // Format trades with proper colors/gradients
        const formatted = await Promise.all(
          (data.trades || []).map(trade => formatTradeForCard(trade))
        );
        setFormattedTrades(formatted);
      } catch (err) {
        console.error("Error fetching trades:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrades();
  }, [offeringFilter, lookingForFilter]);

  const handleViewTrade = (formattedTrade) => {
    setSelectedTrade(formattedTrade);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrade(null);
  };

  // Filter handlers
  const handleSelectOffering = (brainrot) => {
    setOfferingFilter(brainrot);
    setIsOfferingModalOpen(false);
  };

  const handleSelectLookingFor = (brainrot) => {
    setLookingForFilter(brainrot);
    setIsLookingForModalOpen(false);
  };

  const clearOfferingFilter = () => {
    setOfferingFilter(null);
  };

  const clearLookingForFilter = () => {
    setLookingForFilter(null);
  };

  const clearAllFilters = () => {
    setOfferingFilter(null);
    setLookingForFilter(null);
  };

  // Transform trade data for TradeListingCard
  async function formatTradeForCard(trade) {
    const offeringItems = await Promise.all(
      (trade.offeringItems || []).map(async (item) => {
        // Handle mutation - use helper to get proper colors/gradients
        let mutation = null;
        if (item.mutation || item.mutationName) {
          const mutations = await formatMutationsForDisplay([item.mutation || item.mutationName]);
          mutation = mutations[0] || null;
        }
        
        // Handle traits - could be array of objects or strings
        let traits = [];
        const traitsArray = item.traits || item.traitNames || [];
        if (traitsArray.length > 0) {
          traits = await formatTraitsForDisplay(traitsArray);
        }
        
        return {
          name: item.name,
          imageUrl: item.imageUrl || "/images/temp/roblox.webp",
          value: formatLGCValue(item.finalValueLGC),
          mutation: mutation,
          traits: traits,
          tags: [
            mutation?.name,
            ...traits.map(t => t.name),
          ].filter(Boolean),
        };
      })
    );

    const lookingForItems = await Promise.all(
      (trade.lookingForItems || []).map(async (item) => {
        // Handle mutation - use helper to get proper colors/gradients
        let mutation = null;
        if (item.mutation || item.mutationName) {
          const mutations = await formatMutationsForDisplay([item.mutation || item.mutationName]);
          mutation = mutations[0] || null;
        }
        
        // Handle traits - could be array of objects or strings
        let traits = [];
        const traitsArray = item.traits || item.traitNames || [];
        if (traitsArray.length > 0) {
          traits = await formatTraitsForDisplay(traitsArray);
        }
        
        return {
          name: item.name,
          imageUrl: item.imageUrl || "/images/temp/roblox.webp",
          value: formatLGCValue(item.finalValueLGC),
          mutation: mutation,
          traits: traits,
          tags: [
            mutation?.name,
            ...traits.map(t => t.name),
          ].filter(Boolean),
        };
      })
    );

    return {
      id: trade.id,
      username: trade.ownerUsername,
      userRobloxId: trade.ownerRobloxId,
      avatarUrl: trade.ownerAvatarUrl,
      timeAgo: formatTimeAgo(trade.createdAt),
      offeringItems,
      lookingForItems,
      views: trade.views >= 1000 ? `${(trade.views / 1000).toFixed(1)}k` : String(trade.views || 0),
      result: trade.result,
      resultPercentage: trade.resultPercentage,
      status: trade.status,
      // Keep original trade data for modal
      _original: trade,
    };
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <FadeIn duration={0.6} distance={30}>
          <h1
            className="text-[2.5rem] sm:text-[3rem] font-semibold text-center mb-8 font-pp-mori"
          >
            <span className="text-[#4F46E5] dark:text-[#6366F1] transition-colors duration-300">Recent</span>{" "}
            <span className="text-[#020617] dark:text-white transition-colors duration-300">Trades</span>
          </h1>
        </FadeIn>

        {/* Action Buttons */}
        <FadeIn delay={0.1} duration={0.5} distance={20} className="flex flex-wrap justify-center gap-3 mb-10">
          <Link href="/trades/post">
            <button
              className="
                flex items-center gap-2 px-6 py-3 rounded-[10px]
                bg-[#4F46E5] text-white text-sm font-medium font-urbanist
                hover:bg-[#6366F1] hover:scale-[1.02]
                hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)]
                active:scale-[0.98]
                transition-all duration-200
                cursor-pointer
              "
            >
              <Plus size={18} />
              Post a Trade
            </button>
          </Link>
          <Link href="/trades/activity">
            <button
              className="
                flex items-center gap-2 px-6 py-3 rounded-[10px]
                bg-white dark:bg-slate-900 text-[#020617] dark:text-white
                text-sm font-medium font-urbanist
                border border-[#E5E7EB] dark:border-slate-700
                hover:border-[#4F46E5]/50 hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-200
                cursor-pointer
              "
            >
              <Activity size={18} />
              See Activity
            </button>
          </Link>
          <Link href="/trades/completed">
            <button
              className="
                flex items-center gap-2 px-6 py-3 rounded-[10px]
                bg-white dark:bg-slate-900 text-[#020617] dark:text-white
                text-sm font-medium font-urbanist
                border border-[#E5E7EB] dark:border-slate-700
                hover:border-[#4F46E5]/50 hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-200
                cursor-pointer
              "
            >
              <CheckCircle size={18} />
              Completed Trades
            </button>
          </Link>
        </FadeIn>

        {/* Filters Section */}
        <FadeIn delay={0.2} duration={0.5} distance={20} className="mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 overflow-hidden">
            {/* Collapsible Header */}
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Filter size={20} className="text-[#4F46E5]" />
                <h2 className="text-lg font-semibold text-[#020617] dark:text-white font-pp-mori">
                  Filter Trades
                </h2>
                {(offeringFilter || lookingForFilter) && (
                  <span className="text-xs text-[#4F46E5] font-urbanist">
                    ({(offeringFilter ? 1 : 0) + (lookingForFilter ? 1 : 0)} active)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(offeringFilter || lookingForFilter) && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters();
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        clearAllFilters();
                      }
                    }}
                    className="text-sm text-[#6B7280] hover:text-red-500 transition-colors font-urbanist cursor-pointer"
                  >
                    Clear All
                  </span>
                )}
                <div className={`transform transition-transform duration-200 ${isFilterExpanded ? 'rotate-180' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#6B7280]">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {/* Collapsible Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isFilterExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6 border-t border-[#E5E7EB] dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Offering Filter */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-[#6B7280] dark:text-gray-400 font-urbanist block">
                      Offering
                    </label>
                    {offeringFilter ? (
                      <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] dark:bg-slate-800 rounded-lg border border-[#E5E7EB] dark:border-slate-700">
                        <img 
                          src={offeringFilter.imageUrl || offeringFilter.img || "/images/temp/roblox.webp"} 
                          alt={offeringFilter.name}
                          className="w-10 h-10 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#020617] dark:text-white font-urbanist truncate">
                            {offeringFilter.name}
                          </h3>
                          <p className="text-xs text-[#64748B] dark:text-gray-400 font-urbanist">
                            Selected for filtering
                          </p>
                        </div>
                        <button
                          onClick={clearOfferingFilter}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsOfferingModalOpen(true)}
                        className="group w-full p-4 bg-[#F9FAFB] dark:bg-slate-800 rounded-lg border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 hover:shadow-[0_0_0_1px_rgba(79,70,229,0.2),0_0_8px_rgba(79,70,229,0.1)] transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-lg bg-[#E5E7EB] dark:bg-slate-700 flex items-center justify-center group-hover:bg-[#4F46E5] group-hover:shadow-[0_0_0_1px_rgba(79,70,229,0.3),0_0_12px_rgba(79,70,229,0.2)] transition-all duration-200">
                            <Plus size={18} className="text-[#6B7280] group-hover:text-white transition-colors duration-200" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#6B7280] dark:text-gray-400 font-urbanist group-hover:text-[#4F46E5] transition-colors duration-200">
                              Select brainrot to offer...
                            </p>
                            <p className="text-xs text-[#9CA3AF] dark:text-gray-500 font-urbanist mt-0.5 group-hover:text-[#6366F1] transition-colors duration-200">
                              Click to browse all brainrots
                            </p>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Looking For Filter */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-[#6B7280] dark:text-gray-400 font-urbanist block">
                      Looking For
                    </label>
                    {lookingForFilter ? (
                      <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] dark:bg-slate-800 rounded-lg border border-[#E5E7EB] dark:border-slate-700">
                        <img 
                          src={lookingForFilter.imageUrl || lookingForFilter.img || "/images/temp/roblox.webp"} 
                          alt={lookingForFilter.name}
                          className="w-10 h-10 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#020617] dark:text-white font-urbanist truncate">
                            {lookingForFilter.name}
                          </h3>
                          <p className="text-xs text-[#64748B] dark:text-gray-400 font-urbanist">
                            Selected for filtering
                          </p>
                        </div>
                        <button
                          onClick={clearLookingForFilter}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsLookingForModalOpen(true)}
                        className="group w-full p-4 bg-[#F9FAFB] dark:bg-slate-800 rounded-lg border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 hover:shadow-[0_0_0_1px_rgba(79,70,229,0.2),0_0_8px_rgba(79,70,229,0.1)] transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-lg bg-[#E5E7EB] dark:bg-slate-700 flex items-center justify-center group-hover:bg-[#4F46E5] group-hover:shadow-[0_0_0_1px_rgba(79,70,229,0.3),0_0_12px_rgba(79,70,229,0.2)] transition-all duration-200">
                            <Plus size={18} className="text-[#6B7280] group-hover:text-white transition-colors duration-200" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#6B7280] dark:text-gray-400 font-urbanist group-hover:text-[#4F46E5] transition-colors duration-200">
                              Select brainrot you want...
                            </p>
                            <p className="text-xs text-[#9CA3AF] dark:text-gray-500 font-urbanist mt-1 group-hover:text-[#6366F1] transition-colors duration-200">
                              Click to browse all brainrots
                            </p>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Filters Summary */}
                {(offeringFilter || lookingForFilter) && (
                  <div className="pt-4 mt-6 border-t border-[#E5E7EB] dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-gray-400 font-urbanist">
                      <span>Active filters:</span>
                      {offeringFilter && (
                        <span className="px-2 py-1 bg-[#F3F4F6] dark:bg-slate-700 text-[#374151] dark:text-gray-300 rounded-full font-medium">
                          Offering: {offeringFilter.name}
                        </span>
                      )}
                      {lookingForFilter && (
                        <span className="px-2 py-1 bg-[#F3F4F6] dark:bg-slate-700 text-[#374151] dark:text-gray-300 rounded-full font-medium">
                          Looking For: {lookingForFilter.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
            <p className="text-red-500 font-urbanist">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#6366F1] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && formattedTrades.length === 0 && (
          <div className="flex justify-center py-16">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[20px] p-8 sm:p-10 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-[#F3F4F6] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center">
                <Filter size={28} className="text-[#4F46E5]" />
              </div>

              <h3 className="mt-6 text-2xl font-semibold text-[#020617] dark:text-white font-pp-mori">
                No Trades Found
              </h3>

              <p className="mt-2 text-sm text-[#6B7280] dark:text-gray-400 font-urbanist leading-relaxed">
                {(offeringFilter || lookingForFilter)
                  ? "No trades match your current filters. Try adjusting your criteria or clearing filters."
                  : "There are no active trades right now. Be the first to post one!"}
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                {(offeringFilter || lookingForFilter) && (
                  <button
                    onClick={clearAllFilters}
                    className="px-5 py-3 rounded-[12px] bg-[#F3F4F6] dark:bg-slate-800 text-[#020617] dark:text-white border border-[#E5E7EB] dark:border-slate-700 hover:bg-[#E5E7EB] dark:hover:bg-slate-700 transition-colors font-urbanist font-medium cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}

                <Link href="/trades/post">
                  <button
                    className="px-5 py-3 rounded-[12px] bg-[#4F46E5] text-white hover:bg-[#6366F1] transition-colors font-urbanist font-medium cursor-pointer"
                  >
                    Post Your Trade
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Trades Grid - Auto-fit responsive */}
        {!isLoading && !error && formattedTrades.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
            {formattedTrades.map((formattedTrade) => (
              <FadeIn key={formattedTrade.id} duration={0.5} distance={25}>
                <TradeListingCard
                  username={formattedTrade.username}
                  userRobloxId={formattedTrade.userRobloxId}
                  avatarUrl={formattedTrade.avatarUrl}
                  timeAgo={formattedTrade.timeAgo}
                  offeringItems={formattedTrade.offeringItems}
                  lookingForItems={formattedTrade.lookingForItems}
                  views={formattedTrade.views}
                  onViewClick={() => handleViewTrade(formattedTrade)}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      {/* Trade Details Modal */}
      <TradeDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        trade={selectedTrade}
      />

      {/* Offering Filter Modal */}
      <SelectItemModal
        isOpen={isOfferingModalOpen}
        onClose={() => setIsOfferingModalOpen(false)}
        onSelectItem={handleSelectOffering}
      />

      {/* Looking For Filter Modal */}
      <SelectItemModal
        isOpen={isLookingForModalOpen}
        onClose={() => setIsLookingForModalOpen(false)}
        onSelectItem={handleSelectLookingFor}
      />
    </main>
  );
}
