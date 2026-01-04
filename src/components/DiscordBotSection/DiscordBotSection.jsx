"use client";

import { FadeIn, ScaleIn } from "@/components/Animations";

export default function DiscordBotSection() {
  const botInviteLink =
    "https://discord.com/oauth2/authorize?client_id=1455626247139754068&permissions=2147534848&integration_type=0&scope=applications.commands+bot";

  return (
    <section className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 bg-[#F9FAFB] dark:bg-[#020617] transition-colors duration-300">
      {/* Main Container */}
      <ScaleIn duration={0.7} initialScale={0.95} className="w-full sm:w-[95%] lg:w-[90%]">
        <div className="relative w-full bg-gradient-to-br from-[#5865F2]/10 via-white to-[#5865F2]/5 dark:from-[#5865F2]/20 dark:via-[#0F172A] dark:to-[#5865F2]/10 rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border border-[#5865F2]/20 dark:border-[#5865F2]/30 overflow-hidden transition-colors duration-300">
          <div className="flex flex-col items-center px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
            {/* Discord Icon */}
            <FadeIn delay={0.1} duration={0.5} distance={20}>
              <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl bg-[#5865F2] shadow-lg shadow-[#5865F2]/30">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 71 55"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                >
                  <path
                    d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
                    fill="white"
                  />
                </svg>
              </div>
            </FadeIn>

            {/* Heading */}
            <FadeIn delay={0.2} duration={0.6} distance={25}>
              <h2 className="text-[1.75rem] sm:text-[2.5rem] lg:text-[3rem] font-semibold text-center mb-3 sm:mb-4 font-pp-mori">
                <span className="text-[#020617] dark:text-white transition-colors duration-300">Add Our </span>
                <span className="text-[#5865F2] transition-colors duration-300">Discord Bot</span>
              </h2>
            </FadeIn>

            {/* Descriptive Paragraph */}
            <FadeIn delay={0.3} duration={0.6} distance={20}>
              <p className="text-center mb-6 sm:mb-8 lg:mb-10 font-urbanist text-sm sm:text-base lg:text-lg text-[#64748B] dark:text-gray-400 max-w-[600px] transition-colors duration-300 px-2">
                Bring Sabrvalues directly to your Discord server. Check brainrot values, calculate trades, and get instant price updates — all without leaving Discord.
              </p>
            </FadeIn>

            {/* Features */}
            <FadeIn delay={0.4} duration={0.6} distance={15}>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 border border-[#5865F2]/20 dark:border-[#5865F2]/30">
                  <svg className="w-4 h-4 text-[#5865F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs sm:text-sm font-urbanist text-[#020617] dark:text-gray-200">Value Lookups</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 border border-[#5865F2]/20 dark:border-[#5865F2]/30">
                  <svg className="w-4 h-4 text-[#5865F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs sm:text-sm font-urbanist text-[#020617] dark:text-gray-200">Trade Calculator</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 border border-[#5865F2]/20 dark:border-[#5865F2]/30">
                  <svg className="w-4 h-4 text-[#5865F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs sm:text-sm font-urbanist text-[#020617] dark:text-gray-200">Slash Commands</span>
                </div>
              </div>
            </FadeIn>

            {/* Add Bot Button */}
            <ScaleIn delay={0.5} duration={0.5} initialScale={0.9}>
              <a
                href={botInviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 sm:px-12 py-3 sm:py-4 rounded-xl bg-[#5865F2] text-base sm:text-lg font-semibold text-white transition-all duration-200 ease-out hover:bg-[#4752C4] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(88,101,242,0.4)] active:scale-[0.98] cursor-pointer font-urbanist"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 71 55"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                >
                  <path
                    d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
                    fill="currentColor"
                  />
                </svg>
                Add to Server
              </a>
            </ScaleIn>
          </div>
        </div>
      </ScaleIn>
    </section>
  );
}
