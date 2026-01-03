"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QuickTradeCard from "./QuickTradeCard";

// Card height + gap for calculations
const CARD_HEIGHT = 88;
const GAP = 16;
const CARD_WITH_GAP = CARD_HEIGHT + GAP;

export default function QuickTradesCarousel() {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const total = cards.length;
  const [activeIndex, setActiveIndex] = useState(total * 2);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);

  function handleTrade(card) {
    if (!card?.id) return;

    try {
      localStorage.setItem(
        "trade_post_prefill_offering_item",
        JSON.stringify({
          id: card.id,
          name: card.name,
          img: card.imageUrl || "/images/temp/roblox.webp",
          imageUrl: card.imageUrl || "/images/temp/roblox.webp",
          valueLGC: Number(card.valueLGC || 0),
          rarity: card.rarity,
          demand: card.demandRaw,
        })
      );
    } catch {}

    router.push("/trades/post");
  }

  useEffect(() => {
    async function fetchTop() {
      try {
        const featuredRes = await fetch("/api/brainrots?quickTrade=1&limit=5");
        const featuredData = await featuredRes.json();
        const featuredList = Array.isArray(featuredData?.brainrots)
          ? featuredData.brainrots
          : [];

        const fallbackRes =
          featuredList.length > 0 ? null : await fetch("/api/brainrots?limit=5");
        const fallbackData = fallbackRes ? await fallbackRes.json() : null;
        const fallbackList = fallbackData?.brainrots;

        const list =
          featuredList.length > 0
            ? featuredList
            : Array.isArray(fallbackList)
              ? fallbackList
              : [];

        const mapped = list.slice(0, 3).map((b) => ({
          id: b.id,
          name: b.name,
          imageUrl: b.imageUrl || "/images/temp/roblox.webp",
          valueLGC: Number(b.valueLGC || 0),
          value: String(Number(b.valueLGC || 0).toFixed(3)),
          demand: b.demand === "very-high" ? 3 : b.demand === "high" ? 2 : 1,
          demandRaw: b.demand,
          rarity: b.rarity,
        }));

        setCards(mapped);
      } catch {
        setCards([]);
      }
    }

    fetchTop();
  }, []);

  useEffect(() => {
    if (cards.length > 0) setActiveIndex(cards.length * 2);
  }, [cards.length]);

  if (cards.length === 0) return null;

  const extendedCards = [...cards, ...cards, ...cards, ...cards, ...cards];

  const prev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((s) => s - 1);
  };

  const next = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((s) => s + 1);
  };

  const handleTransitionEnd = () => {
    if (total === 0) {
      setIsTransitioning(false);
      return;
    }

    if (activeIndex < total) {
      if (containerRef.current) {
        containerRef.current.style.transition = 'none';
      }
      setActiveIndex(activeIndex + total);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = '';
          }
          setIsTransitioning(false);
        });
      });
    } else if (activeIndex >= total * 4) {
      if (containerRef.current) {
        containerRef.current.style.transition = 'none';
      }
      setActiveIndex(activeIndex - total);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = '';
          }
          setIsTransitioning(false);
        });
      });
    } else {
      setIsTransitioning(false);
    }
  };

  const offset = -(activeIndex - 1) * CARD_WITH_GAP;
  const containerHeight = CARD_WITH_GAP * 3 - GAP;

  return (
    <div className="relative flex items-center w-full max-w-[420px]">
      {/* Cards Stack - fixed height to show 3 cards */}
      <div 
        className="w-full sm:w-[360px] overflow-hidden"
        style={{ height: `${containerHeight}px` }}
      >
        <div 
          ref={containerRef}
          className="flex flex-col transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateY(${offset}px)`,
            gap: `${GAP}px`
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedCards.map((card, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={`${card.id}-${index}`}
                className={`flex-shrink-0 transition-all duration-500 ease-in-out ${
                  isActive ? 'scale-100' : 'scale-[0.95]'
                }`}
                style={{ height: `${CARD_HEIGHT}px` }}
              >
                <QuickTradeCard 
                  {...card} 
                  isActive={isActive}
                  onTrade={() => handleTrade(card)} 
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Up/Down controls */}
      <div 
        className="ml-2 sm:ml-4 flex items-center"
        style={{ height: `${containerHeight}px` }}
      >
        <div className="flex flex-col gap-2 sm:gap-3">
          <button
            onClick={prev}
            aria-label="previous"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#4F46E5] flex items-center justify-center text-white shadow-md hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-4 sm:h-4">
              <path d="M6 15L12 9L18 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="next"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#4F46E5] flex items-center justify-center text-white shadow-md hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-4 sm:h-4">
              <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
