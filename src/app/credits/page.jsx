"use client";

import { ArrowUpRight } from "lucide-react";
import { FadeIn } from "@/components/Animations";

const teamMembers = [
  {
    id: 1,
    name: "Sentry",
    role: "CEO",
  },
  {
    id: 2,
    name: "Shin",
    role: "Full Stack Developer",
  },
];

function CreditCard({ name, role }) {
  return (
    <div className="flex flex-col">
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-[#E8E8F0] dark:bg-slate-800 rounded-[20px] sm:rounded-[24px] overflow-hidden transition-colors">
        {/* Placeholder for avatar image */}
      </div>
      
      {/* Info Section */}
      <div className="flex items-center justify-between mt-4 sm:mt-5">
        <div className="flex flex-col">
          <h3 className="font-pp-mori font-semibold text-lg sm:text-xl lg:text-2xl text-[#020617] dark:text-white transition-colors">
            {name}
          </h3>
          <p className="font-urbanist text-sm sm:text-base text-[#64748B] dark:text-gray-400 transition-colors">
            {role}
          </p>
        </div>
        
        {/* Arrow Button */}
        <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#4F46E5] flex items-center justify-center text-white hover:bg-[#6366F1] transition-colors cursor-pointer">
          <ArrowUpRight size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-10 sm:py-14 lg:py-20">
        {/* Heading */}
        <FadeIn duration={0.6} distance={30}>
          <h1 className="text-center font-pp-mori font-bold text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] text-[#020617] dark:text-white">
            Credits
          </h1>
        </FadeIn>

        {/* Subheading */}
        <FadeIn delay={0.1} duration={0.6} distance={20}>
          <p className="mt-3 sm:mt-4 text-center font-urbanist font-normal text-sm sm:text-base lg:text-lg text-[#64748B] dark:text-gray-400 max-w-[520px] italic">
            Incredible people who have helped make this website possible!
          </p>
        </FadeIn>

        {/* Team Cards Grid */}
        <div className="mt-12 sm:mt-14 lg:mt-16 w-full max-w-[700px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {teamMembers.map((member) => (
              <FadeIn key={member.id} duration={0.5} distance={25}>
                <CreditCard
                  name={member.name}
                  role={member.role}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
