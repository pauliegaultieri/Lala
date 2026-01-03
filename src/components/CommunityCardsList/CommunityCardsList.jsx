"use client";

import { useEffect, useRef, useState } from "react";
import CommunityCard from "../CommunityCard/CommunityCard";

export default function CommunityCardsList() {
  const [brainrots, setBrainrots] = useState([]);
  // Start in the middle group so wrapping can happen both directions
  const [activeIndex, setActiveIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchTop() {
      try {
        const res = await fetch("/api/brainrots?limit=6");
        const data = await res.json();
        const list = Array.isArray(data?.brainrots) ? data.brainrots : [];

        const mapped = list.slice(0, 3).map((b) => ({
          id: b.id,
          name: b.name,
          imageUrl: b.imageUrl || "/images/temp/roblox.webp",
          value: String(Number(b.valueLGC || 0).toFixed(3)),
          demand: b.demand === "very-high" ? 3 : b.demand === "high" ? 2 : 1,
        }));

        setBrainrots(mapped);
      } catch {
        setBrainrots([]);
      }
    }

    fetchTop();
  }, []);

  useEffect(() => {
    if (brainrots.length > 0) setActiveIndex(brainrots.length);
  }, [brainrots.length]);

  const goPrevious = () => setActiveIndex((prev) => prev - 1);
  const goNext = () => setActiveIndex((prev) => prev + 1);

  // visual params
  const cardHeight = 140; // px
  const gap = 24; // px
  const cardWithGap = cardHeight + gap;

  // viewport (visible) height for 3 cards
  const viewportHeight = cardHeight * 3 + gap * 2; // px
  const centerOffset = viewportHeight / 2 - cardHeight / 2; // px

  // small visual nudge to lower the stack so top card isn't visually clipped
  const visualNudge = 18; // px

  // translate in px (center activeIndex)
  const translateYPx = -activeIndex * cardWithGap + centerOffset + visualNudge;

  if (brainrots.length === 0) return null;

  // Create extended array with duplicates for wrapping
  const extended = [...brainrots, ...brainrots, ...brainrots];

  const handleTransitionEnd = () => {
    // If we've moved into the first duplicate group, jump to the corresponding real group
    if (activeIndex < brainrots.length) {
      setIsJumping(true);
      if (containerRef.current) containerRef.current.style.transition = 'none';
      requestAnimationFrame(() => {
        setActiveIndex(activeIndex + brainrots.length);
        requestAnimationFrame(() => {
          if (containerRef.current) containerRef.current.style.transition = '';
          setIsJumping(false);
        });
      });
    } else if (activeIndex >= brainrots.length * 2) {
      setIsJumping(true);
      if (containerRef.current) containerRef.current.style.transition = 'none';
      requestAnimationFrame(() => {
        setActiveIndex(activeIndex - brainrots.length);
        requestAnimationFrame(() => {
          if (containerRef.current) containerRef.current.style.transition = '';
          setIsJumping(false);
        });
      });
    }
  };

  return (
    // absolutely position the whole card stack to the right of the join section so it can overflow the rounded container
    <div className="relative flex items-center justify-end w-full md:w-1/2">
      <div className="relative w-full max-w-[640px]">
        <div className="overflow-hidden" style={{ height: `${viewportHeight}px` }}>
          <div
            ref={containerRef}
            className={`flex flex-col ${isJumping ? '' : 'transition-transform duration-500 ease-in-out'}`}
            style={{ transform: `translateY(${translateYPx}px)` }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extended.map((b, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={`${b.name}-${idx}`}
                  className={`px-4 pb-4 transition-all duration-500 ${isActive ? 'scale-100 z-20' : 'scale-95 opacity-60 z-10'}`}
                  style={{ height: `${cardHeight}px` }}
                >
                  <CommunityCard
                    name={b.name}
                    imageUrl={b.imageUrl}
                    value={b.value}
                    demand={b.demand}
                    isActive={isActive}
                    onTrade={() => alert(`Trade ${b.name}`)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Up/Down controls */}
        <div className="absolute right-[-56px] top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <button
            onClick={goPrevious}
            aria-label="previous"
            className="w-10 h-10 rounded-full bg-[#6B46F6] flex items-center justify-center text-white shadow-md hover:bg-[#7c5df8] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 15L12 9L18 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={goNext}
            aria-label="next"
            className="w-10 h-10 rounded-full bg-[#6B46F6] flex items-center justify-center text-white shadow-md hover:bg-[#7c5df8] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
