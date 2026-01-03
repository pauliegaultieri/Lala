"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import TradeActivityCard from "./TradeActivityCard";
import { FadeIn } from "@/components/Animations";
import { formatTimeAgo } from "@/lib/trade-utils";
import { formatMutationsForDisplay, formatTraitsForDisplay } from "@/lib/mutation-trait-utils";

export default function TradeActivityContainer({ session }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchActivity() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/trades/activity?limit=50");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch trade activity");
        }

        // Transform trades to activity format
        const formattedActivities = (data.trades || []).map(async (trade) => {
          const isOwner = session?.user?.robloxId === trade.ownerRobloxId;
          
          // Determine the other user
          const otherUser = isOwner
            ? {
                username: trade.joinedByUsername || "Waiting for someone...",
                avatar: trade.joinedByAvatarUrl || "/images/temp/roblox.webp",
              }
            : {
                username: trade.ownerUsername,
                avatar: trade.ownerAvatarUrl || "/images/temp/roblox.webp",
              };

          // Your items vs their items depends on if you're owner or joiner
          const yourSourceItems = isOwner ? (trade.offeringItems || []) : (trade.lookingForItems || []);
          const theirSourceItems = isOwner ? (trade.lookingForItems || []) : (trade.offeringItems || []);

          const yourItems = await Promise.all(
            yourSourceItems.map(async (item) => {
              const [mutation] = item.mutation || item.mutationName
                ? await formatMutationsForDisplay([item.mutation || item.mutationName])
                : [null];

              const traitsArray = item.traits || item.traitNames || [];
              const traits = traitsArray.length > 0 ? await formatTraitsForDisplay(traitsArray) : [];

              return {
                name: item.name,
                imageUrl: item.imageUrl || "/images/temp/roblox.webp",
                mutation: mutation || null,
                traits,
              };
            })
          );

          const theirItems = await Promise.all(
            theirSourceItems.map(async (item) => {
              const [mutation] = item.mutation || item.mutationName
                ? await formatMutationsForDisplay([item.mutation || item.mutationName])
                : [null];

              const traitsArray = item.traits || item.traitNames || [];
              const traits = traitsArray.length > 0 ? await formatTraitsForDisplay(traitsArray) : [];

              return {
                name: item.name,
                imageUrl: item.imageUrl || "/images/temp/roblox.webp",
                mutation: mutation || null,
                traits,
              };
            })
          );

          // Map status - treat "active" and "cancelled" appropriately
          let status = trade.status;
          if (status === "active") status = "pending";
          if (status === "cancelled") status = "failed";

          return {
            id: trade.id,
            status,
            otherUser,
            yourItems,
            theirItems,
            timeAgo: formatTimeAgo(trade.createdAt),
            initiatedBy: isOwner ? "you" : "them",
            failReason: trade.failReason
              ? trade.failReason === "owner_declined"
                ? "Declined by owner"
                : trade.failReason === "joiner_declined"
                ? "Declined by joiner"
                : trade.failReason === "expired"
                ? "Trade expired"
                : trade.failReason === "cancelled"
                ? "Cancelled"
                : "Failed"
              : null,
            ownerAccepted: trade.ownerAccepted,
            joinerAccepted: trade.joinerAccepted,
            isOwner,
            _original: trade,
          };
        });

        setActivities(await Promise.all(formattedActivities));
      } catch (err) {
        console.error("Error fetching trade activity:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivity();
  }, [session?.user?.robloxId]);

  function handleTradeUpdate() {
    // Refetch activities when a trade is updated
    async function refetch() {
      try {
        const response = await fetch("/api/trades/activity?limit=50");
        const data = await response.json();
        if (response.ok) {
          const formattedActivities = (data.trades || []).map(async (trade) => {
            const isOwner = session?.user?.robloxId === trade.ownerRobloxId;
            const otherUser = isOwner
              ? {
                  username: trade.joinedByUsername || "Waiting for someone...",
                  avatar: trade.joinedByAvatarUrl || "/images/temp/roblox.webp",
                }
              : {
                  username: trade.ownerUsername,
                  avatar: trade.ownerAvatarUrl || "/images/temp/roblox.webp",
                };

            const yourSourceItems = isOwner ? (trade.offeringItems || []) : (trade.lookingForItems || []);
            const theirSourceItems = isOwner ? (trade.lookingForItems || []) : (trade.offeringItems || []);

            const yourItems = await Promise.all(
              yourSourceItems.map(async (item) => {
                const [mutation] = item.mutation || item.mutationName
                  ? await formatMutationsForDisplay([item.mutation || item.mutationName])
                  : [null];

                const traitsArray = item.traits || item.traitNames || [];
                const traits = traitsArray.length > 0 ? await formatTraitsForDisplay(traitsArray) : [];

                return {
                  name: item.name,
                  imageUrl: item.imageUrl || "/images/temp/roblox.webp",
                  mutation: mutation || null,
                  traits,
                };
              })
            );

            const theirItems = await Promise.all(
              theirSourceItems.map(async (item) => {
                const [mutation] = item.mutation || item.mutationName
                  ? await formatMutationsForDisplay([item.mutation || item.mutationName])
                  : [null];

                const traitsArray = item.traits || item.traitNames || [];
                const traits = traitsArray.length > 0 ? await formatTraitsForDisplay(traitsArray) : [];

                return {
                  name: item.name,
                  imageUrl: item.imageUrl || "/images/temp/roblox.webp",
                  mutation: mutation || null,
                  traits,
                };
              })
            );
            let status = trade.status;
            if (status === "active") status = "pending";
            if (status === "cancelled") status = "failed";
            return {
              id: trade.id,
              status,
              otherUser,
              yourItems,
              theirItems,
              timeAgo: formatTimeAgo(trade.createdAt),
              initiatedBy: isOwner ? "you" : "them",
              failReason: trade.failReason
                ? trade.failReason === "owner_declined"
                  ? "Declined by owner"
                  : trade.failReason === "joiner_declined"
                  ? "Declined by joiner"
                  : trade.failReason === "expired"
                  ? "Trade expired"
                  : trade.failReason === "cancelled"
                  ? "Cancelled"
                  : "Failed"
                : null,
              ownerAccepted: trade.ownerAccepted,
              joinerAccepted: trade.joinerAccepted,
              isOwner,
              _original: trade,
            };
          });
          setActivities(await Promise.all(formattedActivities));
        }
      } catch (err) {
        console.error("Error refetching activities:", err);
      }
    }
    refetch();
  }

  const filters = [
    { id: "all", label: "All", count: activities.length },
    { id: "pending", label: "Pending", count: activities.filter(a => a.status === "pending").length },
    { id: "completed", label: "Completed", count: activities.filter(a => a.status === "completed").length },
    { id: "failed", label: "Failed", count: activities.filter(a => a.status === "failed").length },
  ];

  const filteredActivities = activeFilter === "all"
    ? activities
    : activities.filter(a => a.status === activeFilter);

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
              Trade <span className="text-[#4F46E5]">Activity</span>
            </h1>
            <p className="mt-2 font-urbanist text-sm sm:text-base text-[#6B7280]">
              Track all your pending, completed, and failed trades
            </p>
          </div>
        </FadeIn>

        {/* Filter Tabs */}
        <FadeIn delay={0.15} duration={0.5} distance={20} className="flex justify-center">
          <div className="flex gap-2 p-1.5 bg-[#F3F4F6] dark:bg-slate-800 rounded-[14px]">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-[10px] text-sm font-medium font-urbanist
                  transition-all duration-200 cursor-pointer
                  ${activeFilter === filter.id
                    ? "bg-white dark:bg-slate-900 text-[#020617] dark:text-white shadow-sm"
                    : "text-[#6B7280] hover:text-[#020617] dark:hover:text-white"
                  }
                `}
              >
                {filter.label}
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${activeFilter === filter.id
                    ? "bg-[#4F46E5] text-white"
                    : "bg-[#E5E7EB] dark:bg-slate-700 text-[#6B7280]"
                  }
                `}>
                  {filter.count}
                </span>
              </button>
            ))}
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

      {/* Activity List */}
      {!isLoading && !error && (
        <div className="flex flex-col gap-4">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <FadeIn key={activity.id} duration={0.5} distance={20}>
                <TradeActivityCard
                  activity={activity}
                  currentUser={session?.user}
                  onTradeUpdate={handleTradeUpdate}
                />
              </FadeIn>
            ))
          ) : (
            /* Empty State */
            <FadeIn delay={0.25} duration={0.5} distance={20}>
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700">
                <div className="w-20 h-20 rounded-[20px] bg-[#F3F4F6] dark:bg-slate-800 flex items-center justify-center mb-6">
                  {activeFilter === "pending" && <Clock size={36} className="text-amber-500" />}
                  {activeFilter === "completed" && <CheckCircle size={36} className="text-emerald-500" />}
                  {activeFilter === "failed" && <XCircle size={36} className="text-red-500" />}
                  {activeFilter === "all" && <AlertCircle size={36} className="text-[#6B7280]" />}
                </div>
                <h3 className="font-pp-mori font-semibold text-xl text-[#020617] dark:text-white mb-2">
                  No {activeFilter === "all" ? "" : activeFilter} trades found
                </h3>
                <p className="font-urbanist text-sm text-[#6B7280] max-w-sm">
                  {activeFilter === "pending" && "You don't have any pending trades at the moment."}
                  {activeFilter === "completed" && "You haven't completed any trades yet."}
                  {activeFilter === "failed" && "You don't have any failed trades."}
                  {activeFilter === "all" && "You haven't participated in any trades yet."}
                </p>
              </div>
            </FadeIn>
          )}
          
          {/* Results Count */}
          {filteredActivities.length > 0 && (
            <p className="text-center font-urbanist text-sm text-[#6B7280] mt-4">
              Showing {filteredActivities.length} of {activities.length} trades
            </p>
          )}
        </div>
      )}
    </div>
  );
}
