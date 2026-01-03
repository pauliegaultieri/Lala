"use client";

import { useState, useEffect } from "react";
import Accordion from "@/components/FAQ/Accordion";
import { FadeIn } from "@/components/Animations";
import { Loader2 } from "lucide-react";
import Breadcrumbs from "@/components/SEO/Breadcrumbs";
import StructuredData, { generateFAQSchema } from "@/components/SEO/StructuredData";

export default function FAQPage() {
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/faq");
      if (res.ok) {
        const data = await res.json();
        setFaqItems(data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const faqSchema = faqItems.length > 0 ? generateFAQSchema({
    faqs: faqItems.map(item => ({
      question: item.question,
      answer: item.answer
    }))
  }) : null;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      {faqSchema && <StructuredData data={faqSchema} />}
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-10 sm:py-14 lg:py-20">
        <div className="w-full max-w-[900px]">
          <Breadcrumbs items={[{ name: "FAQ", url: "/faq" }]} />
        </div>
        {/* Heading */}
        <FadeIn duration={0.6} distance={30}>
          <h1 className="text-center font-pp-mori font-bold text-[1.75rem] sm:text-[2.5rem] lg:text-[3rem] text-[#020617] dark:text-white">
            Frequently asked questions.
          </h1>
        </FadeIn>

        {/* Subheading */}
        <FadeIn delay={0.1} duration={0.6} distance={20}>
          <p className="mt-3 sm:mt-4 text-center font-urbanist font-normal text-sm sm:text-base lg:text-lg text-[#64748B] dark:text-gray-400 max-w-[700px] italic">
            Find answers to common questions about trading, values, and using Sabrvalues.
          </p>
        </FadeIn>

        {/* FAQ Accordion */}
        <FadeIn delay={0.3} duration={0.6} distance={25} className="mt-8 sm:mt-10 lg:mt-12 w-full max-w-[900px]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : faqItems.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 font-urbanist">
                No FAQs available yet.
              </p>
            </div>
          ) : (
            <Accordion items={faqItems} />
          )}
        </FadeIn>
      </section>
    </div>
  );
}
