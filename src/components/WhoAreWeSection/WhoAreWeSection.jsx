"use client";

import { FadeIn, ScaleIn } from "@/components/Animations";
import { useRouter } from "next/navigation";

export default function WhoAreWeSection() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 bg-[#F9FAFB] dark:bg-[#020617] transition-colors duration-300">
      {/* Main Container */}
      <ScaleIn duration={0.7} initialScale={0.95} className="w-full sm:w-[95%] lg:w-[90%]">
        <div className="relative w-full bg-white dark:bg-[#0F172A] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border border-[#E5E7EB] dark:border-white/10 overflow-hidden transition-colors duration-300">
          <div className="flex flex-col items-center px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
            {/* Heading */}
            <FadeIn delay={0.2} duration={0.6} distance={25}>
              <h2 className="text-[1.75rem] sm:text-[2.5rem] lg:text-[3rem] font-semibold text-center mb-3 sm:mb-4 font-pp-mori">
                <span className="text-[#4F46E5] dark:text-[#6366F1] transition-colors duration-300">Who</span>
                <span className="text-[#020617] dark:text-white transition-colors duration-300"> are we?</span>
              </h2>
            </FadeIn>

            {/* Descriptive Paragraph */}
            <FadeIn delay={0.3} duration={0.6} distance={20}>
              <p className="text-center mb-6 sm:mb-8 lg:mb-10 font-urbanist text-sm sm:text-base lg:text-lg text-[#64748B] dark:text-gray-400 max-w-[700px] transition-colors duration-300 px-2">
                We're a small team of Steal a Brainrot traders who got tired of guessing brainrot values. Together we're building Sabrvalues to keep prices fair, transparent, and easy to use for every player.
              </p>
            </FadeIn>

            {/* Start Trading Button */}
            <ScaleIn delay={0.7} duration={0.5} initialScale={0.9}>
              <button
                type="button"
                onClick={() => router.push("/trades/post")}
                className="px-8 sm:px-12 py-2.5 sm:py-3 rounded-[10px] bg-[#4F46E5] text-sm sm:text-base font-medium text-white transition-all duration-200 ease-out hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] cursor-pointer font-urbanist"
              >
                Start trading
              </button>
            </ScaleIn>
          </div>

          {/* Bottom Left Images - Hidden on very small screens */}
          <div className="hidden sm:flex absolute bottom-0 left-0 items-end -translate-x-4 lg:-translate-x-8 translate-y-4 lg:translate-y-6 z-0">
            <img
              src="/images/who-are-we/penguin.png"
              alt="Penguin"
              className="h-auto max-h-[120px] sm:max-h-[150px] lg:max-h-[200px] object-contain relative z-10"
            />
            <img
              src="/images/who-are-we/rat.png"
              alt="Rat"
              className="h-auto max-h-[120px] sm:max-h-[150px] lg:max-h-[200px] object-contain relative -ml-6 sm:-ml-8 lg:-ml-12 z-0"
            />
          </div>
        </div>
      </ScaleIn>
    </section>
  );
}

