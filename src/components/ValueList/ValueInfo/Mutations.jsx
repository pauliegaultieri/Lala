"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

function getModifierTextStyle(modifier) {
  if (!modifier) return undefined;
  if (modifier?.gradient?.from && modifier?.gradient?.to) {
    const angle = Number.isFinite(Number(modifier.gradient.angle)) ? Number(modifier.gradient.angle) : 90;
    return {
      backgroundImage: `linear-gradient(${angle}deg, ${modifier.gradient.from}, ${modifier.gradient.to})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }
  if (modifier?.color) return { color: modifier.color };
  return undefined;
}

export default function Mutations({ mutations = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Carousel state
  const [activeIndex, setActiveIndex] = useState(mutations.length);
  const [isJumping, setIsJumping] = useState(false);

  // If we have <= 3 mutations, we don't need the carousel logic
  const showCarousel = mutations.length > 3;

  const handleClick = (mutationName) => {
    const sanitized = mutationName.toLowerCase().replace(/\s+/g, "-");
    router.push(`${pathname}-${sanitized}`);
  };

  // Reset jump state after render
  useEffect(() => {
    if (isJumping) {
      requestAnimationFrame(() => {
        setIsJumping(false);
      });
    }
  }, [isJumping]);

  const handlePrev = () => {
    if (isJumping) return;
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isJumping) return;
    setActiveIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    if (activeIndex < mutations.length) {
      // Jump forward to the middle set
      setIsJumping(true);
      setActiveIndex(activeIndex + mutations.length);
    } else if (activeIndex >= mutations.length * 2) {
      // Jump backward to the middle set
      setIsJumping(true);
      setActiveIndex(activeIndex - mutations.length);
    }
  };

  // CSS Calc for width
  // Each card takes up (100% - (2 * 16px gap)) / 3
  // 32px is total gap width for 3 items
  const cardWidthCss = "calc((100% - 32px) / 3)";
  
  // Slide amount for one item: cardWidth + 16px gap
  // = (100% - 32px)/3 + 16px
  // = (100% - 32px + 48px)/3
  // = (100% + 16px)/3
  const slideAmountCss = "calc((100% + 16px) / 3)";

  const MutationCard = ({ mutation, width }) => (
    <div
      className="relative bg-white dark:bg-slate-900 rounded-2xl aspect-square flex-shrink-0 cursor-pointer transition-colors"
      style={{ width: width || "100%" }}
      onClick={() => handleClick(mutation.name)}
    >
      {/* Pill-shaped label */}
      <div 
        className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#4F46E5] text-white px-3 py-1 rounded-full text-sm font-medium z-10 whitespace-nowrap font-urbanist"
        style={getModifierTextStyle(mutation)}
      >
        {mutation.name}
      </div>

      {/* Image lowered */}
      {mutation.imageSrc && (
        <div className="w-full h-full p-4 pt-12 flex items-start justify-center">
          <img
            src={mutation.imageSrc}
            alt={mutation.name}
            className="object-contain w-full h-full"
          />
        </div>
      )}
    </div>
  );

  // If not using carousel, just display them normally
  if (!showCarousel) {
    return (
      <div className="w-full">
        <h2 className="font-pp-mori text-[#020617] dark:text-white text-[2.5rem] mb-4">Mutations</h2>
        <div className="flex gap-4 w-full">
          {mutations.map((mutation) => (
            <div key={mutation.name} style={{ width: cardWidthCss }}>
              <MutationCard mutation={mutation} />
            </div>
          ))}
          {/* If less than 3, they will take up 1/3 space each and leave empty space on right, which matches grid behavior */}
        </div>
      </div>
    );
  }

  // Carousel Logic
  // We duplicate the items 3 times: [set1, set2, set3]
  // activeIndex starts at mutations.length (start of set2)
  const extendedMutations = [...mutations, ...mutations, ...mutations];

  return (
    <div className="w-full">
      <h2 className="font-pp-mori text-[#020617] dark:text-white text-[2.5rem] mb-4">Mutations</h2>
      <div className="relative w-full">
        {/* Left arrow */}
        <button
          onClick={handlePrev}
          className="cursor-pointer absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#4F46E5] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#4338CA] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="overflow-hidden rounded-2xl w-full">
          <div
            className={`flex gap-4 ${
              isJumping ? "" : "transition-transform duration-500 ease-in-out"
            }`}
            style={{
              transform: `translateX(calc(-${activeIndex} * ${slideAmountCss}))`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedMutations.map((mutation, index) => (
              <div key={`${mutation.name}-${index}`} style={{ width: cardWidthCss }} className="flex-shrink-0">
                <MutationCard mutation={mutation} />
              </div>
            ))}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={handleNext}
          className="cursor-pointer absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#4F46E5] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#4338CA] transition-colors"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
