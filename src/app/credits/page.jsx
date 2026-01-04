"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { FadeIn } from "@/components/Animations";
import CreditCard from "@/components/CreditCard/CreditCard";

export default function CreditsPage() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch("/api/credits");
        if (res.ok) {
          const data = await res.json();
          setCredits(data.credits || []);
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCredits();
  }, []);

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
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
            </div>
          ) : credits.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 font-urbanist py-12">
              No credits to display yet.
            </p>
          ) : (
            <div className={`grid gap-6 sm:gap-8 lg:gap-10 ${credits.length === 1 ? 'grid-cols-1 max-w-[300px] mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {credits.map((credit, index) => (
                <FadeIn key={credit.id} delay={index * 0.1} duration={0.5} distance={25}>
                  <CreditCard
                    name={credit.name}
                    title={credit.title}
                    imageUrl={credit.imageUrl}
                    link={credit.link}
                  />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
