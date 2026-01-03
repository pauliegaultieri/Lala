"use client";

import Image from "next/image";
import { ExternalLink, User } from "lucide-react";

export default function TradeParticipant({ label, user, timestamp, timestampFull }) {
  if (!user) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[14px] border border-[#E5E7EB] dark:border-slate-700 p-4 transition-colors hover:border-[#4F46E5]/30">
      {/* Label */}
      <span className="font-urbanist text-xs text-[#6B7280] uppercase tracking-wide">
        {label}
      </span>

      {/* User Info */}
      <div className="flex items-center gap-3 mt-3">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0 ring-2 ring-[#4F46E5]/20">
          {user.avatar ? (
            <Image
              src={user.avatar || "/images/temp/roblox.webp"}
              alt={user.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={24} className="text-[#6B7280]" />
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-urbanist font-semibold text-[#020617] dark:text-white truncate">
              {user.username}
            </span>
            <a
              href={`https://www.roblox.com/users/${user.robloxId}/profile`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md hover:bg-[#F3F4F6] dark:hover:bg-slate-700 transition-colors"
              title="View Roblox Profile"
            >
              <ExternalLink size={14} className="text-[#4F46E5]" />
            </a>
          </div>
          <p className="font-urbanist text-xs text-[#6B7280] mt-0.5 cursor-help sm:cursor-default" title={timestampFull}>
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}
