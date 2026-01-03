"use client";

import { useState, useEffect } from "react";
import CategoryCard from "@/components/ValueList/CategoryCard";
import { FadeIn } from "@/components/Animations";
import { Loader2 } from "lucide-react";
import { getRarities } from "@/lib/rarities-cache";
import Breadcrumbs from "@/components/SEO/Breadcrumbs";
import StructuredData, { generateItemListSchema } from "@/components/SEO/StructuredData";

export default function Page() {
  const [brainrotCounts, setBrainrotCounts] = useState({});
  const [rarities, setRarities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch rarities from cache
        const raritiesData = await getRarities();
        setRarities(raritiesData);

        // Fetch brainrot counts (fetch all without pagination)
        const res = await fetch("/api/brainrots?limit=9999");
        const data = await res.json();

        // Count brainrots per rarity
        const counts = {};
        (data.brainrots || []).forEach((b) => {
          counts[b.rarity] = (counts[b.rarity] || 0) + 1;
        });
        setBrainrotCounts(counts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const itemListSchema = rarities.length > 0 ? generateItemListSchema({
    items: rarities.map(r => ({
      id: r.id,
      name: r.label,
      slug: r.id,
      imageUrl: r.image,
      valueLGC: 0
    })),
    name: "Brainrot Rarities",
    description: "Browse all brainrot rarities in Steal a Brainrot",
    baseUrl: "https://sabrvalues.com"
  }) : null;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      {itemListSchema && <StructuredData data={itemListSchema} />}
      <section
        className="mx-auto w-full max-w-350 px-4 sm:px-8 md:px-12"
        style={{
          marginTop: "clamp(2.5rem, 7vw, 6rem)",
          marginBottom: "clamp(2.5rem, 7vw, 6rem)",
        }}
      >
        <Breadcrumbs items={[{ name: "Values", url: "/values" }]} />
        <FadeIn duration={0.6} distance={30}>
          <h1 className="font-pp-mori font-semibold text-[3.75rem] text-[#020617] dark:text-white text-center">
            Brainrot <span className="text-[#4F46E5]">Values</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.1} duration={0.6} distance={20}>
          <p className="text-center font-urbanist text-[1.125rem] text-[#9ca3af] dark:text-gray-400 max-w-3xl mx-auto mt-4">
            Browse every brainrot in Steal a Brainrot, check live values, and
            quickly jump into each item's mutation and trait stats.
          </p>
        </FadeIn>

        {/* Grid of categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-3 mt-10 w-full">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
            </div>
          ) : (
            rarities.filter(r => r.showInForm === true).map((rarity) => (
              <FadeIn key={rarity.id} duration={0.5} distance={25}>
                <CategoryCard
                  id={rarity.id}
                  name={rarity.label}
                  imageSrc={rarity.image}
                  itemsAvailable={brainrotCounts[rarity.id] || 0}
                  color={rarity.color}
                />
              </FadeIn>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
