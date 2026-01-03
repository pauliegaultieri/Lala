"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toTitleCase } from "@/lib/stringUtils";
import { Loader2, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/Animations";
import ValueCard from "@/components/shared/ValueCard";
import { getTimeAgo } from "@/lib/time-ago";
import Breadcrumbs from "@/components/SEO/Breadcrumbs";
import StructuredData, { generateItemListSchema } from "@/components/SEO/StructuredData";

export default function Page() {
  const params = useParams();
  const [brainrots, setBrainrots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  // Get category ID and display name
  const categoryId = params.category;
  let categoryName;
  if (categoryId.toUpperCase() === "OG") {
    categoryName = "OG";
  } else {
    categoryName = toTitleCase(categoryId.split("-").join(" "));
  }

  useEffect(() => {
    async function fetchBrainrots() {
      try {
        const res = await fetch(`/api/brainrots?rarity=${categoryId}`);
        const data = await res.json();
        setBrainrots(data.brainrots || []);
      } catch (error) {
        console.error("Error fetching brainrots:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBrainrots();
  }, [categoryId]);

  // Filter brainrots based on search
  const filteredBrainrots = useMemo(() => {
    if (!searchValue.trim()) return brainrots;
    const search = searchValue.toLowerCase();
    return brainrots.filter((b) =>
      b.name.toLowerCase().includes(search)
    );
  }, [brainrots, searchValue]);

  const itemListSchema = brainrots.length > 0 ? generateItemListSchema({
    items: brainrots,
    name: `${categoryName} Brainrots`,
    description: `Browse all ${categoryName} rarity brainrots in Steal a Brainrot`,
    baseUrl: "https://sabrvalues.com"
  }) : null;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      {itemListSchema && <StructuredData data={itemListSchema} />}
      <section
        className="flex flex-col items-center w-full px-6 sm:px-8 md:px-16"
        style={{
          marginTop: "clamp(2.5rem, 100px, 7vw)",
          marginBottom: "clamp(2.5rem, 100px, 7vw)",
        }}
      >
        <div className="w-full max-w-[1400px]">
          <Breadcrumbs items={[
            { name: "Values", url: "/values" },
            { name: categoryName, url: `/values/categories/${categoryId}` }
          ]} />
        </div>
        {/* Back button */}
        <div className="w-full mb-6">
          <Link
            href="/values"
            className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#4F46E5] transition-colors font-urbanist"
          >
            <ArrowLeft size={18} />
            Back to Categories
          </Link>
        </div>

        <FadeIn duration={0.6} distance={30}>
          <h1 className="font-pp-mori font-semibold text-[3rem] sm:text-[3.75rem] text-[#020617] dark:text-white text-center">
            {categoryName} <span className="text-[#4F46E5]">Brainrots</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1} duration={0.6} distance={20}>
          <p className="text-center font-urbanist text-[1rem] text-[#9ca3af] dark:text-gray-400 mt-2">
            {loading ? "Loading..." : `${filteredBrainrots.length} brainrots found`}
          </p>
        </FadeIn>

        {/* Search Bar */}
        <div className="relative w-full max-w-md h-[50px] flex items-center mt-6">
          <Search size={18} className="absolute left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search brainrots..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-full bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-[12px] pl-11 pr-4 text-[#020617] dark:text-white outline-none focus:border-[#4F46E5] text-sm font-urbanist placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
          />
        </div>

        {/* Brainrots Grid */}
        <div className="w-full mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
            </div>
          ) : filteredBrainrots.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-urbanist text-[#6B7280] dark:text-gray-400">
                {searchValue ? "No brainrots match your search" : "No brainrots in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBrainrots.map((brainrot, index) => (
                <FadeIn key={brainrot.id} delay={index * 0.03} duration={0.4} distance={15}>
                  <Link href={`/values/brainrots/${brainrot.id}`}>
                    <ValueCard
                      imageSrc={brainrot.imageUrl || "/images/temp/roblox.webp"}
                      name={brainrot.name}
                      value={`${brainrot.valueLGC?.toFixed(6)} LGC`}
                      demand={brainrot.demand === "very-high" ? 3 : brainrot.demand === "high" ? 2 : 1}
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
