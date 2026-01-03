"use client";

import Image from "next/image";
import Link from "next/link";
import TradeItemSlot from "./TradeItemSlot";

export default function TradeListingCard({
  username,
  avatarUrl,
  userRobloxId,
  timeAgo,
  offeringItems,
  lookingForItems,
  onViewClick,
}) {
  const userHref = userRobloxId ? `/profile/${userRobloxId}` : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 p-5 flex flex-col gap-4 w-full transition-colors">
      {/* Header: User Info */}
      <div className="flex items-center justify-between">
        {userHref ? (
          <Link href={userHref} className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800">
              <Image
                src={avatarUrl || "/images/temp/roblox.webp"}
                alt={username}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-urbanist font-medium text-black dark:text-white text-base">
              {username}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800">
              <Image
                src={avatarUrl || "/images/temp/roblox.webp"}
                alt={username}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-urbanist font-medium text-black dark:text-white text-base">
              {username}
            </span>
          </div>
        )}
        <span className="font-urbanist text-[#9CA3AF] dark:text-gray-400 text-sm">
          {timeAgo}
        </span>
      </div>

      {/* Trade Content */}
      <div className="flex gap-4">
        {/* Offering Column */}
        <div className="flex-1 flex flex-col gap-2">
          <span className="font-urbanist text-black dark:text-white text-sm">Offering</span>
          <div className="bg-[#F9FAFB] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-[16px] p-4 aspect-square">
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
              {Array.from({ length: 9 }).map((_, i) => {
                const item = offeringItems[i];
                return (
                  <TradeItemSlot
                    key={i}
                    item={item}
                    className="w-full h-full"
                    innerClassName="rounded-[8px]"
                    imagePaddingClassName="p-0.5"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Looking For Column */}
        <div className="flex-1 flex flex-col gap-2">
          <span className="font-urbanist text-black dark:text-white text-sm">Looking for</span>
          <div className="bg-[#F9FAFB] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-[16px] p-4 aspect-square">
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
              {Array.from({ length: 9 }).map((_, i) => {
                const item = lookingForItems[i];
                return (
                  <TradeItemSlot
                    key={i}
                    item={item}
                    className="w-full h-full"
                    innerClassName="rounded-[8px]"
                    imagePaddingClassName="p-0.5"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-2">
        <button
          onClick={onViewClick}
          className="w-full h-[48px] rounded-[10px] bg-[#4F46E5] text-white font-urbanist font-medium hover:bg-[#4338CA] transition-colors cursor-pointer"
        >
          View Trade
        </button>
      </div>
    </div>
  );
}
