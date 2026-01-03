"use client";

import { Clock, CheckCircle, XCircle, Send, UserCheck, Flag } from "lucide-react";

const timelineConfig = {
  posted: {
    icon: Send,
    color: "bg-[#4F46E5]",
    textColor: "text-[#4F46E5]",
    label: "Trade Posted",
  },
  accepted: {
    icon: UserCheck,
    color: "bg-blue-500",
    textColor: "text-blue-500",
    label: "Trade Joined",
  },
  completed: {
    icon: CheckCircle,
    color: "bg-emerald-500",
    textColor: "text-emerald-500",
    label: "Trade Completed",
  },
  cancelled: {
    icon: XCircle,
    color: "bg-red-500",
    textColor: "text-red-500",
    label: "Trade Cancelled",
  },
  failed: {
    icon: XCircle,
    color: "bg-red-500",
    textColor: "text-red-500",
    label: "Trade Failed",
  },
  expired: {
    icon: Clock,
    color: "bg-gray-500",
    textColor: "text-gray-500",
    label: "Trade Expired",
  },
};

export default function TradeTimeline({ trade }) {
  const events = [];

  // Always add posted event
  if (trade.timestamps.posted) {
    events.push({
      type: "posted",
      timestamp: trade.timestamps.posted,
      timestampFull: trade.timestamps.postedAt,
      user: trade.postedBy?.username,
      description: `${trade.postedBy?.username} created this trade listing`,
    });
  }

  // Add accepted event if exists
  if (trade.timestamps.accepted && trade.acceptedBy) {
    events.push({
      type: "accepted",
      timestamp: trade.timestamps.accepted,
      timestampFull: trade.timestamps.acceptedAt,
      user: trade.acceptedBy?.username,
      description: `${trade.acceptedBy?.username} accepted the trade`,
    });
  }

  // Add completed event if exists
  if (trade.status === "completed" && trade.timestamps.completed) {
    events.push({
      type: "completed",
      timestamp: trade.timestamps.completed,
      timestampFull: trade.timestamps.completedAt,
      user: trade.completedBy,
      description: `Trade was successfully completed`,
    });
  }

  // Add cancelled event if status is cancelled
  if (trade.status === "cancelled") {
    events.push({
      type: "cancelled",
      timestamp: trade.timestamps.cancelled || "Recently",
      timestampFull: trade.timestamps.cancelledAt,
      description: `Trade was cancelled`,
    });
  }

  // Add failed event if status is failed
  if (trade.status === "failed" && trade.timestamps.failed) {
    events.push({
      type: "failed",
      timestamp: trade.timestamps.failed,
      timestampFull: trade.timestamps.failedAt,
      description: trade.failReason === "owner_declined" 
        ? "Trade was declined by the owner"
        : trade.failReason === "joiner_declined"
        ? "Trade was declined by the joiner"
        : "Trade failed",
    });
  }

  // Add expired event if status is expired
  if (trade.status === "expired") {
    events.push({
      type: "expired",
      timestamp: trade.timestamps.expired || "Recently",
      timestampFull: trade.timestamps.expiredAt,
      description: `Trade listing expired`,
    });
  }

  return (
    <div className="relative">
      {events.map((event, index) => {
        const config = timelineConfig[event.type];
        const Icon = config.icon;
        const isLast = index === events.length - 1;

        return (
          <div key={index} className="relative flex gap-4">
            {/* Timeline Line */}
            {!isLast && (
              <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-[#E5E7EB] to-transparent dark:from-slate-700" />
            )}

            {/* Icon */}
            <div className={`
              relative z-10 flex-shrink-0
              w-10 h-10 rounded-full 
              ${config.color}
              flex items-center justify-center
              shadow-lg shadow-${config.color}/20
            `}>
              <Icon size={18} className="text-white" />
            </div>

            {/* Content */}
            <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
              <div className="bg-[#F9FAFB] dark:bg-slate-800/50 rounded-[12px] border border-[#E5E7EB] dark:border-slate-700 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                  <span className={`font-urbanist font-semibold ${config.textColor}`}>
                    {config.label}
                  </span>
                  <span 
                    className="font-urbanist text-xs text-[#6B7280] cursor-help sm:cursor-default"
                    title={event.timestampFull}
                  >
                    {event.timestamp}
                  </span>
                </div>
                <p className="font-urbanist text-sm text-[#6B7280] mt-1">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Pending State Indicator */}
      {trade.status === "pending" && (
        <div className="relative flex gap-4 mt-4">
          <div className="
            relative z-10 flex-shrink-0
            w-10 h-10 rounded-full 
            bg-[#F3F4F6] dark:bg-slate-800
            border-2 border-dashed border-[#E5E7EB] dark:border-slate-600
            flex items-center justify-center
          ">
            <Clock size={18} className="text-[#9CA3AF] animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="bg-[#F9FAFB]/50 dark:bg-slate-800/30 rounded-[12px] border border-dashed border-[#E5E7EB] dark:border-slate-700 p-4">
              <span className="font-urbanist text-sm text-[#9CA3AF]">
                Waiting for someone to accept this trade...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Accepted but not completed indicator */}
      {trade.status === "accepted" && (
        <div className="relative flex gap-4 mt-4">
          <div className="
            relative z-10 flex-shrink-0
            w-10 h-10 rounded-full 
            bg-[#F3F4F6] dark:bg-slate-800
            border-2 border-dashed border-[#E5E7EB] dark:border-slate-600
            flex items-center justify-center
          ">
            <Flag size={18} className="text-[#9CA3AF] animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="bg-[#F9FAFB]/50 dark:bg-slate-800/30 rounded-[12px] border border-dashed border-[#E5E7EB] dark:border-slate-700 p-4">
              <span className="font-urbanist text-sm text-[#9CA3AF]">
                Trade accepted, waiting for completion...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
