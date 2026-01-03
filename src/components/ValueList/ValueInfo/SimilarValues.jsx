"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ValueCard from "@/components/shared/ValueCard";
import { getTimeAgo } from "@/lib/time-ago";

export default function SimilarValues() {
  const params = useParams();
  const brainrotId = params.brainrot;
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carousel state
  const [activeIndex, setActiveIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // Always show carousel since we have 6 items
  // CSS Calc for width: (100% - 32px) / 3
  const cardWidthCss = "calc((100% - 32px) / 3)";
  const slideAmountCss = "calc((100% + 16px) / 3)";

  // Reset jump state after render
  useEffect(() => {
    if (isJumping) {
      requestAnimationFrame(() => {
        setIsJumping(false);
      });
    }
  }, [isJumping]);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/brainrots/${brainrotId}/similar?limit=6`);
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "Failed to fetch similar values");
        setItems(Array.isArray(data?.brainrots) ? data.brainrots : []);
      } catch (err) {
        console.error("Error fetching similar values:", err);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (brainrotId) fetchSimilar();
  }, [brainrotId]);

  useEffect(() => {
    if (items.length > 0) setActiveIndex(items.length);
  }, [items.length]);

  const handlePrev = () => {
    if (isJumping) return;
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isJumping) return;
    setActiveIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    if (activeIndex < items.length) {
      setIsJumping(true);
      setActiveIndex(activeIndex + items.length);
    } else if (activeIndex >= items.length * 2) {
      setIsJumping(true);
      setActiveIndex(activeIndex - items.length);
    }
  };

  const extendedItems = useMemo(() => {
    if (items.length === 0) return [];
    return [...items, ...items, ...items];
  }, [items]);

  return (
    <div className="w-full mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-pp-mori text-[#020617] dark:text-white text-[2.5rem]">Similar Values</h2>
        <div className="flex gap-4">
          <button
            onClick={handlePrev}
            disabled={isLoading || items.length < 2}
            className="cursor-pointer w-12 h-12 bg-[#4F46E5] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#4338CA] transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading || items.length < 2}
            className="cursor-pointer w-12 h-12 bg-[#4F46E5] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#4338CA] transition-colors"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full flex items-center justify-center py-16">
          <span className="loading loading-spinner loading-lg text-[#4F46E5]" />
        </div>
      ) : items.length === 0 ? (
        <div className="w-full text-center py-16">
          <p className="font-urbanist text-[#6B7280] dark:text-gray-400">No similar values found</p>
        </div>
      ) : (
        <div className="relative w-full overflow-x-hidden overflow-y-visible py-4 px-6">
          <div
            className={`flex gap-4 -mx-6 ${
              isJumping ? "" : "transition-transform duration-500 ease-in-out"
            }`}
            style={{
              transform: `translateX(calc(-${activeIndex} * ${slideAmountCss}))`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedItems.map((item, index) => (
              <div
                key={item.id ? `${item.id}-${index}` : index}
                style={{ width: cardWidthCss }}
                className="flex-shrink-0"
              >
                <div className="w-full">
                  <ValueCard
                    imageSrc={item.imageUrl || "/images/temp/roblox.webp"}
                    name={item.name}
                    value={`${Number(item.valueLGC || 0).toFixed(6)} LGC`}
                    demand={
                      item.demand === "very-high" ? 3 : item.demand === "high" ? 2 : 1
                    }
                    postedAmount={getTimeAgo(item.createdAt)?.amount || 0}
                    postedUnit={getTimeAgo(item.createdAt)?.unit || ''}
                    onSelect={item.id ? () => router.push(`/values/brainrots/${item.id}`) : undefined}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
