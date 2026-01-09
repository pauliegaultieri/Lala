"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Search, ArrowLeft } from "lucide-react";
import { FadeIn } from "@/components/Animations";
import ValueCard from "@/components/shared/ValueCard";
import { getTimeAgo } from "@/lib/time-ago";

export default function Page() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [brainrots, setBrainrots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    async function fetchBrainrots() {
      try {
        setIsLoading(true);
        setError(null);

        const url = query.trim()
          ? `/api/brainrots?search=${encodeURIComponent(query.trim())}`
          : "/api/brainrots";

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch brainrots");

        setBrainrots(Array.isArray(data?.brainrots) ? data.brainrots : []);
      } catch (err) {
        console.error("Error fetching brainrots:", err);
        setError(err?.message || "Failed to fetch brainrots");
        setBrainrots([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBrainrots();
  }, [query]);

  const subtitle = useMemo(() => {
    if (isLoading) return "Loading...";
    if (error) return "Error";
    return `${brainrots.length} brainrots found`;
  }, [brainrots.length, error, isLoading]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section
        className="flex flex-col items-center w-full px-6 sm:px-8 md:px-16"
        style={{
          marginTop: "clamp(2.5rem, 100px, 7vw)",
          marginBottom: "clamp(2.5rem, 100px, 7vw)",
        }}
      >
        <div className="w-full mb-6">
          <Link
            href="/values"
            className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#4F46E5] transition-colors font-urbanist"
          >
            <ArrowLeft size={18} />
            Back to Values
          </Link>
        </div>

        <FadeIn duration={0.6} distance={30}>
          <h1 className="font-pp-mori font-semibold text-[3rem] sm:text-[3.75rem] text-[#020617] dark:text-white text-center">
            Search <span className="text-[#4F46E5]">Brainrots</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1} duration={0.6} distance={20}>
          <p className="text-center font-urbanist text-[1rem] text-[#9ca3af] dark:text-gray-400 mt-2">
            {subtitle}
          </p>
        </FadeIn>

        <div className="relative w-full max-w-md h-[50px] flex items-center mt-6">
          <Search size={18} className="absolute left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search brainrots..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-full bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-[12px] pl-11 pr-4 text-[#020617] dark:text-white outline-none focus:border-[#4F46E5] text-sm font-urbanist placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
          />
        </div>

        <div className="w-full mt-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="font-urbanist text-[#6B7280] dark:text-gray-400">{error}</p>
            </div>
          ) : brainrots.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-urbanist text-[#6B7280] dark:text-gray-400">No brainrots match your search</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${brainrots.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {brainrots.map((brainrot, index) => (
                <FadeIn key={brainrot.id} delay={index * 0.03} duration={0.4} distance={15}>
                  <Link href={`/values/brainrots/${brainrot.id}`}>
                    <ValueCard
                      imageSrc={brainrot.imageUrl || "/images/temp/roblox.webp"}
                      name={brainrot.name}
                      value={`${Number(brainrot.valueLGC || 0).toFixed(2)} LGC`}
                      demand={
                        brainrot.demand === "very-high" ? 3 : brainrot.demand === "high" ? 2 : 1
                      }
                      postedAmount={getTimeAgo(brainrot.createdAt)?.amount || 0}
                      postedUnit={getTimeAgo(brainrot.createdAt)?.unit || ''}
                    />
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
