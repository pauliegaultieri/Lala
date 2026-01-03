"use client";

import { useState, useEffect } from "react";
import { ExternalLink, User, ArrowUpRight, TrendingUp, CheckCircle2, XCircle, Send, Loader2 } from "lucide-react";
import { FadeIn } from "@/components/Animations";

function AvatarImage({ robloxId, fallbackImage, alt }) {
  const [avatarUrl, setAvatarUrl] = useState(fallbackImage);

  useEffect(() => {
    if (!fallbackImage && robloxId) {
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=150x150&format=Png&isCircular=false`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.[0]?.imageUrl) {
            setAvatarUrl(data.data[0].imageUrl);
          }
        })
        .catch(() => {});
    }
  }, [robloxId, fallbackImage]);

  if (!avatarUrl) {
    return (
      <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-[20px] bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
        <User size={56} className="text-white" />
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={alt}
      className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-[20px] object-cover"
    />
  );
}

function useUserStats(statsEndpoint) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(statsEndpoint || "/api/users/me");
        if (!res.ok) {
          throw new Error("Failed to fetch user stats");
        }
        const data = await res.json();
        setStats(data.stats);
      } catch (err) {
        console.error("Error fetching user stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [statsEndpoint]);

  return { stats, loading, error };
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 p-5 flex flex-col gap-3 transition-all duration-300 hover:border-[#4F46E5]/50 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.1)]">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <span className="font-pp-mori font-semibold text-2xl sm:text-3xl text-[#020617] dark:text-white block">
          {value}
        </span>
        <span className="font-urbanist text-sm text-[#6B7280] dark:text-gray-400">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function ProfileHeader({ session, statsEndpoint }) {
  const user = session?.user;
  const { stats: userStats, loading: statsLoading } = useUserStats(statsEndpoint);

  const stats = [
    { icon: Send, value: statsLoading ? "..." : (userStats?.tradesPosted ?? 0), label: "Trades Posted", color: "bg-emerald-500" },
    { icon: TrendingUp, value: statsLoading ? "..." : (userStats?.tradesAccepted ?? 0), label: "Trades Accepted", color: "bg-blue-500" },
    { icon: CheckCircle2, value: statsLoading ? "..." : (userStats?.tradesCompleted ?? 0), label: "Completed", color: "bg-amber-500" },
    { icon: XCircle, value: statsLoading ? "..." : (userStats?.tradesFailed ?? 0), label: "Failed", color: "bg-red-500" },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Profile Card */}
      <FadeIn duration={0.6} distance={30}>
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-[#E5E7EB] dark:border-slate-700 overflow-hidden transition-colors">
        {/* Gradient Banner */}
        <div className="h-24 sm:h-32 bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#4F46E5] relative">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        </div>
        
        {/* Profile Content */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          {/* Avatar - Overlapping banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 -mt-16 sm:-mt-20">
            <div className="relative flex-shrink-0">
              <div className="p-1 bg-white dark:bg-slate-900 rounded-[24px]">
                <AvatarImage 
                  robloxId={user?.robloxId} 
                  fallbackImage={user?.image} 
                  alt={user?.name || "User"} 
                />
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 flex flex-col items-center sm:items-start justify-between gap-4 pt-0 sm:pt-24 text-center sm:text-left w-full">
              <div className="w-full">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <h1 className="font-pp-mori font-semibold text-2xl sm:text-3xl text-[#020617] dark:text-white">
                    {user?.displayName || user?.name || "Unknown User"}
                  </h1>
                  <span className="px-3 py-1 rounded-lg bg-[#4F46E5] text-white text-xs font-semibold uppercase tracking-wide font-urbanist">
                    User
                  </span>
                </div>
                <p className="font-urbanist text-sm text-[#6B7280] dark:text-gray-400 mt-1">
                  @{user?.username || "unknown"} • ID: {user?.robloxId || "N/A"}
                </p>
              </div>
              
              {/* Roblox Profile Button */}
              <a
                href={`https://www.roblox.com/users/${user?.robloxId}/profile`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center justify-center gap-2
                  w-full sm:w-auto px-5 py-2.5
                  rounded-[10px] bg-[#4F46E5]
                  text-white text-sm font-medium font-urbanist
                  hover:bg-[#6366F1] hover:scale-[1.02]
                  hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)]
                  active:scale-[0.98]
                  transition-all duration-200
                "
              >
                View on Roblox
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <FadeIn key={index} duration={0.5} distance={20}>
            <StatCard {...stat} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
