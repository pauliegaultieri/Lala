"use client";

import { useEffect, useState } from "react";
import TradeCalculatorContainer from "@/components/Calculator/TradeCalculatorContainer";
import TradeResultContainer from "@/components/Calculator/TradeResultContainer";
import SelectItemModal from "@/components/Modals/SelectItemModal/SelectItemModal";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FadeIn, ScaleIn } from "@/components/Animations";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeContext, setActiveContext] = useState(null);
  const [onItemSelected, setOnItemSelected] = useState(null);
  const [youItems, setYouItems] = useState(Array(9).fill(null));
  const [themItems, setThemItems] = useState(Array(9).fill(null));

  useEffect(() => {
    try {
      const raw = localStorage.getItem("calculator_prefill_item");
      if (!raw) return;

      const item = JSON.parse(raw);
      if (!item || !item.id) return;

      setYouItems((prev) => {
        const nextIndex = prev.findIndex((v) => v == null);
        if (nextIndex === -1) return prev;

        const next = [...prev];
        next[nextIndex] = item;
        return next;
      });

      localStorage.removeItem("calculator_prefill_item");
    } catch {}
  }, []);

  function handleOpenModal(context, callback) {
    setActiveContext(context);
    setOnItemSelected(() => callback);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setActiveContext(null);
    setOnItemSelected(null);
  }

  function handleSelectItem(item) {
    if (onItemSelected) {
      onItemSelected(item);
    }
    handleCloseModal();
  }
  
  function handleAddItem(context) {
    const { column, index } = context;
    
    // Create callback for when item is selected
    const callback = (item) => {
      if (column === "you") {
        setYouItems(prev => {
          const newItems = [...prev];
          newItems[index] = item;
          return newItems;
        });
      } else {
        setThemItems(prev => {
          const newItems = [...prev];
          newItems[index] = item;
          return newItems;
        });
      }
    };

    // Call parent's onOpenModal with context and callback
    handleOpenModal(context, callback);
  }

  function handleRemoveItem(context) {
    const { column, index } = context;

    if (column === "you") {
      const newItems = [...youItems];
      newItems[index] = null;
      setYouItems(newItems);
    } else {
      const newItems = [...themItems];
      newItems[index] = null;
      setThemItems(newItems);
    }
  }
  
  function handleClearAll() {
    setYouItems(Array(9).fill(null));
    setThemItems(Array(9).fill(null));
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section
        className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 lg:py-16"
      >
        {/* Heading */}
        <FadeIn duration={0.6} distance={30}>
          <h1 className="text-center font-pp-mori font-semibold text-[1.75rem] sm:text-[2.5rem] lg:text-[3.75rem] text-black dark:text-white px-4">
            Add brainrots to calculate
          </h1>
        </FadeIn>

        <FadeIn delay={0.1} duration={0.6} distance={20}>
          <p className="mt-4 sm:mt-6 text-center font-urbanist font-light text-sm sm:text-base lg:text-lg text-[#64748B] dark:text-gray-400 max-w-[520px] px-4">
            Calculate brainrot trade values easily and see the fairness.
          </p>
        </FadeIn>

        {/* Calculator + Result */}
        <FadeIn delay={0.2} duration={0.7} distance={40} className="mt-8 sm:mt-10 lg:mt-12 flex flex-col lg:flex-row gap-4 lg:gap-[10px] items-stretch w-full max-w-[1100px]">
          <TradeCalculatorContainer 
            youItems={youItems} 
            themItems={themItems} 
            onAddItem={handleAddItem} 
            onRemoveItem={handleRemoveItem} 
          />
          <TradeResultContainer 
            youItems={youItems} 
            themItems={themItems} 
            onClearAll={handleClearAll} 
          />
        </FadeIn>

        {/* View Trades button */}
        <ScaleIn delay={0.4} duration={0.5} initialScale={0.9} className="my-8 sm:my-10 lg:my-12">
          <Link href="/trades">
            <button
              type="button"
              className="
                w-auto
                h-[48px] sm:h-[56px]
                px-8 sm:px-12
                rounded-[10px]
                bg-[#4F46E5]
                text-sm sm:text-base
                font-normal
                text-white
                transition-all
                duration-200
                ease-out
                hover:bg-[#6366F1]
                hover:scale-[1.02]
                hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)]
                active:scale-[0.98]
                flex items-center gap-2
                cursor-pointer
                font-urbanist
              "
            >
              View Trades
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </Link>
        </ScaleIn>
      </section>

      {/* Modal rendered outside of section to avoid transform stacking context issues */}
      <SelectItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectItem={handleSelectItem}
      />
    </div>
  );
}
