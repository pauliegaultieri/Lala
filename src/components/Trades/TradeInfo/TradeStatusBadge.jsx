"use client";

import { Clock, CheckCircle, XCircle, AlertCircle, Hourglass } from "lucide-react";

const statusConfig = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/30",
    label: "Pending",
    icon: Clock,
  },
  accepted: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/30",
    label: "Accepted",
    icon: Hourglass,
  },
  completed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/30",
    label: "Completed",
    icon: CheckCircle,
  },
  cancelled: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/30",
    label: "Cancelled",
    icon: XCircle,
  },
  expired: {
    bg: "bg-gray-500/10",
    text: "text-gray-500",
    border: "border-gray-500/30",
    label: "Expired",
    icon: AlertCircle,
  },
};

export default function TradeStatusBadge({ status, size = "md" }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div className={`
      inline-flex items-center rounded-full font-urbanist font-semibold
      ${config.bg} ${config.text} ${config.border} border
      ${sizeClasses[size]}
    `}>
      <Icon size={iconSizes[size]} />
      <span>{config.label}</span>
    </div>
  );
}
