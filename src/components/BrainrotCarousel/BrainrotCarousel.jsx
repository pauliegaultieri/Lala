"use client";

import { useState, useRef, useEffect } from "react";
import BrainrotCard from "../BrainrotCard/BrainrotCard";

export default function BrainrotCarousel() {
  const [brainrots, setBrainrots] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cardWidth, setCardWidth] = useState(320);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchTop() {
      try {
        const featuredRes = await fetch("/api/brainrots?topToday=1&limit=6");
        const featuredData = await featuredRes.json();
        const featuredList = Array.isArray(featuredData?.brainrots)
          ? featuredData.brainrots
          : [];

        const fallbackRes =
          featuredList.length > 0 ? null : await fetch("/api/brainrots?limit=6");
        const fallbackData = fallbackRes ? await fallbackRes.json() : null;
        const fallbackList = fallbackData?.brainrots;

        const list =
          featuredList.length > 0
            ? featuredList
            : Array.isArray(fallbackList)
              ? fallbackList
              : [];

        const mapped = list.map((b) => ({
          id: b.id,
          name: b.name,
          imageUrl: b.imageUrl || "/images/temp/roblox.webp",
          href: `/values/brainrots/${b.id}`,
        }));

        setBrainrots(mapped);
      } catch (e) {
        setBrainrots([]);
      }
    }

    fetchTop();
  }, []);

  useEffect(() => {
    if (brainrots.length > 0) setActiveIndex(brainrots.length * 2);
  }, [brainrots.length]);

  // Responsive card width
  useEffect(() => {
    const updateCardWidth = () => {
      if (window.innerWidth < 640) {
        setCardWidth(260);
      } else if (window.innerWidth < 768) {
        setCardWidth(280);
      } else {
        setCardWidth(320);
      }
    };
    
    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => prev - 1);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    const total = brainrots.length;
    if (total === 0) {
      setIsTransitioning(false);
      return;
    }

    // We render 5 copies. Keep the active index inside [total, total * 4)
    if (activeIndex < total) {
      if (containerRef.current) containerRef.current.style.transition = "none";
      setActiveIndex(activeIndex + total);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) containerRef.current.style.transition = "";
          setIsTransitioning(false);
        });
      });
      return;
    }

    if (activeIndex >= total * 4) {
      if (containerRef.current) containerRef.current.style.transition = "none";
      setActiveIndex(activeIndex - total);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) containerRef.current.style.transition = "";
          setIsTransitioning(false);
        });
      });
      return;
    }

    setIsTransitioning(false);
  };

  if (brainrots.length === 0) return null;

  const cardGap = cardWidth < 300 ? 16 : 32;
  const cardWithGap = cardWidth + cardGap;
  const translateX = `calc(50% - ${activeIndex * cardWithGap + cardWidth / 2}px)`;
  const extendedBrainrots = [...brainrots, ...brainrots, ...brainrots, ...brainrots, ...brainrots];

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-0">
      {/* Left Arrow */}
      <button
        onClick={goToPrevious}
        className="absolute left-0 sm:left-0 top-1/2 -translate-y-1/2 translate-x-0 sm:-translate-x-6 lg:-translate-x-12 z-20 bg-[#4F46E5] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#6366F1] transition-colors w-10 h-10 sm:w-12 sm:h-12 shadow-lg"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="sm:w-5 sm:h-5"
        >
          <path
            d="M12 15L7 10L12 5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Carousel Container */}
      <div className="relative overflow-hidden px-8 sm:px-12 lg:px-16">
        <div 
          ref={containerRef}
          className="flex items-center gap-4 sm:gap-8 transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(${translateX})`
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedBrainrots.map((brainrot, index) => {
            const isActive = index === activeIndex;
            
            return (
              <div
                key={`${brainrot.id}-${index}`}
                className={`flex-shrink-0 transition-all duration-500 ease-in-out ${
                  isActive 
                    ? 'scale-100 z-20' 
                    : 'scale-90 opacity-70 z-10'
                }`}
                style={{ width: `${cardWidth}px` }}
              >
                <BrainrotCard
                  name={brainrot.name}
                  imageUrl={brainrot.imageUrl}
                  href={brainrot.href}
                  isActive={isActive}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute right-0 sm:right-0 top-1/2 -translate-y-1/2 -translate-x-0 sm:translate-x-6 lg:translate-x-12 z-20 bg-[#4F46E5] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#6366F1] transition-colors w-10 h-10 sm:w-12 sm:h-12 shadow-lg"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="sm:w-5 sm:h-5"
        >
          <path
            d="M8 5L13 10L8 15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

