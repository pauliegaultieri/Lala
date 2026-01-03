"use client";

import { useRouter } from "next/navigation";
import BrainrotCarousel from "../BrainrotCarousel/BrainrotCarousel";
import { FadeIn, ScaleIn } from "@/components/Animations";

export default function TopBrainrotsSection() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 bg-[#F9FAFB] dark:bg-[#020617] transition-colors duration-300">
      {/* Heading */}
      <FadeIn duration={0.6} distance={30}>
        <h2 className="text-[1.75rem] sm:text-[2.5rem] lg:text-[3rem] font-semibold text-center mb-3 sm:mb-4 font-pp-mori">
          <span className="text-[#020617] dark:text-white transition-colors duration-300">Top Brainrots </span>
          <span className="text-[#4F46E5] dark:text-[#6366F1] transition-colors duration-300">Today</span>
        </h2>
      </FadeIn>
      
      {/* Subheading */}
      <FadeIn delay={0.1} duration={0.6} distance={20}>
        <p className="text-base sm:text-lg lg:text-xl text-center max-w-2xl mb-8 sm:mb-10 lg:mb-12 font-urbanist text-[#64748B] dark:text-gray-400 transition-colors duration-300 px-4">
          Spot today's most in‑demand brainrots and how their values are shifting.
        </p>
      </FadeIn>

      {/* Brainrot Carousel */}
      <FadeIn delay={0.2} duration={0.7} distance={40}>
        <BrainrotCarousel />
      </FadeIn>

      {/* Check Trades Button */}
      <ScaleIn delay={0.4} duration={0.5} initialScale={0.9}>
        <button
          type="button"
          onClick={() => router.push("/trades")}
          className="px-8 sm:px-12 py-2.5 sm:py-3 rounded-[10px] bg-[#4F46E5] text-sm sm:text-base font-medium text-white transition-all duration-200 ease-out hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] cursor-pointer mt-8 sm:mt-10 lg:mt-12 font-urbanist"
        >
          Check Trades
        </button>
      </ScaleIn>
    </section>
  );
}

