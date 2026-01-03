"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { FadeIn } from "@/components/Animations";

function GuideCard({ guide, onClick }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div 
      onClick={onClick}
      className="flex flex-col bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[28px] overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-slate-900/50 cursor-pointer group"
    >
      {/* Image Section */}
      <div className="relative h-[220px] sm:h-[260px] lg:h-[300px] bg-[#E0E0E8] dark:bg-slate-800 rounded-b-[24px] sm:rounded-b-[28px] overflow-hidden">
        {guide.coverImage ? (
          <img 
            src={guide.coverImage} 
            alt={guide.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
            No cover image
          </div>
        )}
        
        {/* Tag */}
        {guide.tag && (
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
            <span className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#4F46E5] text-white text-xs sm:text-sm font-medium font-urbanist">
              {guide.tag}
            </span>
          </div>
        )}
        
        {/* Arrow Button */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#4F46E5] flex items-center justify-center text-white group-hover:bg-[#6366F1] transition-colors border-2 border-white/20">
            <ArrowUpRight size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5 sm:p-6 lg:p-7">
        <h3 className="font-pp-mori font-semibold text-lg sm:text-xl lg:text-[22px] text-[#020617] dark:text-white mb-2 sm:mb-3 transition-colors">
          {guide.title}
        </h3>
        <p className="font-urbanist text-sm sm:text-[15px] text-[#64748B] dark:text-gray-400 leading-relaxed transition-colors mb-3">
          {guide.description || "Click to read this guide"}
        </p>
        
        {/* Author & Date */}
        {guide.author && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 font-urbanist">
            {guide.author.avatar && (
              <img 
                src={guide.author.avatar} 
                alt={guide.author.displayName}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span>{guide.author.displayName}</span>
            {guide.publishedAt && (
              <>
                <span>•</span>
                <span>{formatDate(guide.publishedAt)}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/guides");
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
      }
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-10 sm:py-14 lg:py-20">
        {/* Heading */}
        <FadeIn duration={0.6} distance={30}>
          <h1 className="text-center font-pp-mori font-bold text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] text-[#020617] dark:text-white">
            Guides
          </h1>
        </FadeIn>

        {/* Subheading */}
        <FadeIn delay={0.1} duration={0.6} distance={20}>
          <p className="mt-3 sm:mt-4 text-center font-urbanist font-normal text-sm sm:text-base lg:text-lg text-[#64748B] dark:text-gray-400 max-w-[520px] italic">
            Everything you need to know to master trading on Sabrvalues!
          </p>
        </FadeIn>

        {/* Guide Cards Grid */}
        <div className="mt-12 sm:mt-14 lg:mt-16 w-full max-w-[1000px]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : guides.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 font-urbanist">
                No guides available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
              {guides.map((guide) => (
                <FadeIn key={guide.id} duration={0.5} distance={25}>
                  <GuideCard
                    guide={guide}
                    onClick={() => router.push(`/guides/${guide.slug}`)}
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
