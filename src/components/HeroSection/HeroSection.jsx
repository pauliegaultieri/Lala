"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/Animations";

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit() {
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/values");
      return;
    }

    router.push(`/values/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section className="flex flex-col items-center w-full mt-16 sm:mt-20 lg:mt-[6.25rem] overflow-x-hidden transition-colors duration-300">
      {/* Hero Text */}
      <FadeIn duration={0.8} distance={40}>
        <h1 className="text-[2rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] font-pp-mori font-semibold text-center mb-8 sm:mb-12 lg:mb-[3.125rem] leading-[1.15]">
          <span className="text-[#020617] dark:text-white transition-colors duration-300">Brainrot </span>
          <span className="text-[#4F46E5] dark:text-[#6366F1] transition-colors duration-300">Values</span>
          <span className="text-[#020617] dark:text-white transition-colors duration-300"> & </span>
          <span className="text-[#4F46E5] dark:text-[#6366F1] transition-colors duration-300">Trade</span>
          <br />
          <span className="text-[#020617] dark:text-white transition-colors duration-300">Calculator</span>
        </h1>
      </FadeIn>

      {/* Container for Image Grid and Search Bar Overlay */}
      <div className="relative w-screen flex flex-col items-center pt-4 sm:pt-8 max-w-full overflow-hidden">
        {/* Image Grid Background Overlay */}
        <div className="relative w-full pointer-events-none">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 grid-rows-2 gap-2 sm:gap-4 md:gap-6 w-[140vw] sm:w-[130vw] md:w-[120vw] opacity-30 dark:opacity-20 relative scale-110 sm:scale-125 left-1/2 -translate-x-1/2 filter blur-[2px] transition-opacity duration-300">
            {[1, 2, 3, 4, 1, 2, 3, 4, 3, 4, 1, 2, 3, 4, 1, 2].map(
              (imageNum, index) => (
                <div
                  key={index}
                  className="relative w-full overflow-hidden rounded"
                  style={{ aspectRatio: "1.35" }}
                >
                  <img
                    src={`/images/hero/image-${imageNum}.png`}
                    alt={`Hero background ${imageNum}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}
          </div>
          <div
            className="
      pointer-events-none
      absolute bottom-0 left-0 right-0
      h-[45%]
      bg-gradient-to-b
      from-transparent
      via-[#F3F4F6]/60 dark:via-[#020617]/60
      to-[#F3F4F6] dark:to-[#020617]
      transition-colors duration-300
    "
          ></div>
        </div>

        {/* Search Bar and Buttons Container - Overlaid */}
        <FadeIn delay={0.3} duration={0.7} distance={30} className="absolute top-[8%] sm:top-[10%] md:top-[12%] left-1/2 transform -translate-x-1/2 -translate-y-0 w-[94%] sm:w-[88%] md:w-full max-w-[720px] z-10 px-4 sm:px-0">
          {/* Search Bar Container */}
          <div className="relative w-full h-[64px] sm:h-[72px] flex items-center">
            <input
              type="text"
              placeholder="Search brainrots"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="w-full h-full bg-[#FFF] dark:bg-[#0F172A] border border-transparent dark:border-white/10 rounded-[18px] px-5 sm:px-6 py-4 text-[#020617] dark:text-white outline-none pr-[84px] text-lg sm:text-xl font-urbanist transition-colors duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="absolute right-3 bg-[#4F46E5] rounded-[16px] flex items-center justify-center cursor-pointer hover:bg-[#6366F1] transition-colors w-[52px] h-[52px] sm:w-[58px] sm:h-[58px]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 sm:w-7 sm:h-7"
              >
                <path
                  d="M5 15L15 5M15 5H8M15 5V12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full mt-3 sm:mt-4 z-10">
            <button
              type="button"
              onClick={() => router.push("/trades")}
              className="flex-1 px-6 py-4 sm:py-5 bg-white dark:bg-white/5 border border-transparent dark:border-white/10 text-[#020617] dark:text-white rounded-[18px] text-lg sm:text-xl font-normal cursor-pointer hover:bg-opacity-10 dark:hover:bg-white/10 transition-colors font-urbanist"
            >
              Browse Trades
            </button>
            <button
              type="button"
              onClick={() => router.push("/calculator")}
              className="flex-1 px-6 py-4 sm:py-5 bg-[#6366F1] border-none rounded-[18px] text-lg sm:text-xl font-normal text-white cursor-pointer hover:bg-[#4F46E5] transition-colors font-urbanist"
            >
              Open Calculator
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
