"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { FadeIn } from "@/components/Animations";
import Link from "next/link";

function getTimeAgo(dateString) {
  if (!dateString) return { amount: 0, unit: "min" };
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays > 0) return { amount: diffDays, unit: diffDays === 1 ? "day" : "days" };
  if (diffHours > 0) return { amount: diffHours, unit: diffHours === 1 ? "hour" : "hours" };
  return { amount: diffMins || 1, unit: diffMins === 1 ? "min" : "mins" };
}

function ValueChangeIndicator({ oldValue, newValue }) {
  if (oldValue === undefined || oldValue === null || newValue === undefined || newValue === null) {
    return null;
  }

  const change = newValue - oldValue;
  const percentChange = oldValue !== 0 ? ((change / oldValue) * 100) : 0;
  const isIncrease = change > 0;
  const isDecrease = change < 0;

  if (change === 0) return null;

  return (
    <div className={`flex items-center gap-1 ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {isIncrease ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      <span className="text-xs font-urbanist font-semibold">
        {isIncrease ? '+' : ''}{percentChange.toFixed(1)}%
      </span>
    </div>
  );
}

function DemandChangeIndicator({ oldDemand, newDemand }) {
  const demandMap = { "low": 1, "high": 2, "very-high": 3 };
  const oldLevel = demandMap[oldDemand] || 0;
  const newLevel = demandMap[newDemand] || 0;
  
  if (oldLevel === newLevel || !oldDemand) return null;

  const isIncrease = newLevel > oldLevel;

  return (
    <div className={`flex items-center gap-1 ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {isIncrease ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      <span className="text-xs font-urbanist font-semibold">
        {oldDemand} → {newDemand}
      </span>
    </div>
  );
}

function getModifierChanges(previousConfig, currentConfig, modifiersById) {
  const changes = [];
  const prevOverrides = previousConfig?.overridesById || {};
  const currOverrides = currentConfig?.overridesById || {};
  
  const allIds = new Set([...Object.keys(prevOverrides), ...Object.keys(currOverrides)]);
  
  for (const id of allIds) {
    const prevMult = prevOverrides[id]?.multiplier;
    const currMult = currOverrides[id]?.multiplier;
    
    if (prevMult !== currMult) {
      const modifier = modifiersById?.[id];
      const defaultMultiplier = modifier?.multiplier || 1;
      
      changes.push({
        id,
        name: modifier?.name || `ID: ${id}`,
        color: modifier?.color,
        gradient: modifier?.gradient,
        oldMultiplier: prevMult,
        newMultiplier: currMult,
        defaultMultiplier,
      });
    }
  }
  
  return changes;
}

function getModifierTextStyle(modifier) {
  if (!modifier) return undefined;
  if (modifier?.gradient?.from && modifier?.gradient?.to) {
    const angle = Number.isFinite(Number(modifier.gradient.angle)) ? Number(modifier.gradient.angle) : 90;
    return {
      backgroundImage: `linear-gradient(${angle}deg, ${modifier.gradient.from}, ${modifier.gradient.to})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }
  if (modifier?.color) return { color: modifier.color };
  return undefined;
}

function UpdateCard({ update }) {
  const timeAgo = getTimeAgo(update.updatedAt);
  const hasValueChange = update.previousValueLGC !== undefined && update.previousValueLGC !== update.valueLGC;
  const hasDemandChange = update.previousDemand && update.previousDemand !== update.demand;
  
  const mutationChanges = update.previousMutationsConfig 
    ? getModifierChanges(update.previousMutationsConfig, update.mutationsConfig, update.mutationsById)
    : [];
  
  const traitChanges = update.previousTraitsConfig
    ? getModifierChanges(update.previousTraitsConfig, update.traitsConfig, update.traitsById)
    : [];
  
  const hasModifierChanges = mutationChanges.length > 0 || traitChanges.length > 0;

  return (
    <Link href={`/values/brainrots/${update.slug || update.id}`}>
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[16px] p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <div className="flex gap-4">
          {/* Image */}
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-[12px] overflow-hidden bg-gray-100 dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700">
              <img 
                src={update.imageUrl || "/images/temp/roblox.webp"} 
                alt={update.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-pp-mori font-semibold text-base text-[#020617] dark:text-white mb-2 truncate group-hover:text-[#4F46E5] transition-colors">
              {update.name}
            </h3>

            <div className="space-y-2">
              {/* Value - Always show current value */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-urbanist text-[#6B7280] dark:text-gray-400 min-w-[60px]">Value:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-urbanist font-semibold text-[#020617] dark:text-white">
                    {Number(update.valueLGC || 0).toFixed(2)} LGC
                  </span>
                  {hasValueChange && (
                    <ValueChangeIndicator oldValue={update.previousValueLGC} newValue={update.valueLGC} />
                  )}
                </div>
              </div>

              {/* Demand - Always show current demand */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-urbanist text-[#6B7280] dark:text-gray-400 min-w-[60px]">Demand:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-urbanist font-semibold text-[#020617] dark:text-white capitalize">
                    {update.demand || 'N/A'}
                  </span>
                  {hasDemandChange && (
                    <DemandChangeIndicator oldDemand={update.previousDemand} newDemand={update.demand} />
                  )}
                </div>
              </div>

              {/* Modifier Changes */}
              {hasModifierChanges && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <div className="space-y-2">
                    {mutationChanges.length > 0 && (
                      <div>
                        <span className="text-xs font-urbanist font-semibold text-[#6B7280] dark:text-gray-400">
                          Mutation Changes:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {mutationChanges.map((change) => (
                            <div
                              key={change.id}
                              className="text-xs font-urbanist bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700"
                            >
                              <span 
                                className="font-semibold"
                                style={getModifierTextStyle(change)}
                              >
                                {change.name}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {change.oldMultiplier ? `${change.oldMultiplier}x` : `${change.defaultMultiplier}x (default)`} → {change.newMultiplier ? `${change.newMultiplier}x` : `${change.defaultMultiplier}x (default)`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {traitChanges.length > 0 && (
                      <div>
                        <span className="text-xs font-urbanist font-semibold text-[#6B7280] dark:text-gray-400">
                          Trait Changes:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {traitChanges.map((change) => (
                            <div
                              key={change.id}
                              className="text-xs font-urbanist bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700"
                            >
                              <span 
                                className="font-semibold"
                                style={getModifierTextStyle(change)}
                              >
                                {change.name}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {change.oldMultiplier ? `${change.oldMultiplier}x` : `${change.defaultMultiplier}x (default)`} → {change.newMultiplier ? `${change.newMultiplier}x` : `${change.defaultMultiplier}x (default)`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-xs font-urbanist text-[#9CA3AF] dark:text-gray-500">
                <span>{timeAgo.amount} {timeAgo.unit} ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ValueUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [days, setDays] = useState(7);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: "50",
          days: days.toString(),
        });

        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }

        const res = await fetch(`/api/value-updates?${params.toString()}`);
        const data = await res.json();
        
        setUpdates(data.updates || []);
        setTotalCount(data.total || 0);
      } catch (error) {
        console.error("Error fetching value updates:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUpdates();
  }, [searchQuery, days]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <FadeIn duration={0.6} distance={30}>
          <h1 className="text-center font-pp-mori font-semibold text-[1.75rem] sm:text-[2.5rem] lg:text-[3.75rem] text-black dark:text-white">
            Value Updates
          </h1>
        </FadeIn>

        <FadeIn delay={0.1} duration={0.6} distance={20}>
          <p className="mt-4 sm:mt-6 text-center font-urbanist font-light text-sm sm:text-base lg:text-lg text-[#64748B] dark:text-gray-400 max-w-[600px]">
            Track recent changes to brainrot values and demands
          </p>
        </FadeIn>

        {/* Search and Filters */}
        <FadeIn delay={0.2} duration={0.6} distance={20} className="mt-8 w-full max-w-[800px]">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-auto sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search brainrots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#020617] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-urbanist text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
              />
            </div>

            {/* Days Filter */}
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-2 rounded-[10px] text-sm font-urbanist font-medium transition-all ${
                    days === d
                      ? 'bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/25'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="mt-4 text-center text-sm font-urbanist text-[#6B7280] dark:text-gray-400">
            {totalCount} update{totalCount !== 1 ? 's' : ''} in last {days} days
          </div>
        </FadeIn>

        {/* Updates Grid */}
        <div className="mt-8 w-full max-w-[1000px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-urbanist text-[#6B7280] dark:text-gray-400">
                {searchQuery ? "No updates match your search" : "No updates found"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {updates.map((update, index) => (
                <FadeIn key={update.id} delay={index * 0.03} duration={0.4} distance={15}>
                  <UpdateCard update={update} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
