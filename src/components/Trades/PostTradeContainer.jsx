"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import TradeGrid from "@/components/Calculator/TradeGrid";
import TradeResultContainer from "@/components/Calculator/TradeResultContainer";
import SelectItemModal from "@/components/Modals/SelectItemModal/SelectItemModal";
import { formatTradeItem } from "@/lib/trade-utils";

export default function PostTradeContainer() {
  const router = useRouter();
  const { data: session } = useSession();
  const [offeringItems, setOfferingItems] = useState(Array(9).fill(null));
  const [lookingForItems, setLookingForItems] = useState(Array(9).fill(null));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeContext, setActiveContext] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("trade_post_prefill_offering_item");
      if (!raw) return;

      const item = JSON.parse(raw);
      if (!item || !item.id) return;

      setOfferingItems((prev) => {
        const nextIndex = prev.findIndex((v) => v == null);
        if (nextIndex === -1) return prev;

        const next = [...prev];
        next[nextIndex] = item;
        return next;
      });

      localStorage.removeItem("trade_post_prefill_offering_item");
    } catch {}
  }, []);

  function handleOpenModal(context) {
    setActiveContext(context);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setActiveContext(null);
  }

  function handleSelectItem(item) {
    if (!activeContext) return;

    const { column, index } = activeContext;

    if (column === "you") {
      const newItems = [...offeringItems];
      newItems[index] = item;
      setOfferingItems(newItems);
    } else {
      const newItems = [...lookingForItems];
      newItems[index] = item;
      setLookingForItems(newItems);
    }

    handleCloseModal();
  }

  function handleRemoveItem(context) {
    const { column, index } = context;

    if (column === "you") {
      const newItems = [...offeringItems];
      newItems[index] = null;
      setOfferingItems(newItems);
    } else {
      const newItems = [...lookingForItems];
      newItems[index] = null;
      setLookingForItems(newItems);
    }
  }

  function handleClearAll() {
    setOfferingItems(Array(9).fill(null));
    setLookingForItems(Array(9).fill(null));
  }

  const hasOfferingItems = offeringItems.some((item) => item !== null);
  const hasLookingForItems = lookingForItems.some((item) => item !== null);
  const isLoggedIn = !!session;
  const canSubmit = hasOfferingItems && hasLookingForItems && isLoggedIn && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Format items for API submission
      const formattedOfferingItems = offeringItems
        .filter((item) => item !== null)
        .map((item) => formatTradeItem(item, item?.mutation || null, item?.traits || []));

      const formattedLookingForItems = lookingForItems
        .filter((item) => item !== null)
        .map((item) => formatTradeItem(item, item?.mutation || null, item?.traits || []));

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offeringItems: formattedOfferingItems,
          lookingForItems: formattedLookingForItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create trade");
      }

      // Redirect to trades page on success
      router.push("/trades");
    } catch (err) {
      console.error("Error creating trade:", err);
      setError(err.message || "Failed to create trade. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full lg:w-fit lg:mx-auto">
          {/* Calculator + Result (match /calculator layout) */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[10px] items-stretch w-full lg:w-fit">
            {/* Trade Columns card */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[20px] sm:rounded-[25px] p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-6 sm:gap-4 lg:gap-6 w-full lg:w-[clamp(320px,51.25vw,738px)] transition-colors">
              {/* Offering */}
              <div className="flex flex-col items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="text-center">
                  <h2 className="font-pp-mori font-semibold text-lg sm:text-xl text-[#020617] dark:text-white">
                    You're Offering
                  </h2>
                  <p className="font-urbanist text-sm text-[#6B7280] mt-1">
                    Add up to 9 brainrots
                  </p>
                </div>
                <TradeGrid
                  columnType="you"
                  items={offeringItems}
                  onAddItem={handleOpenModal}
                  onRemoveItem={handleRemoveItem}
                />
              </div>

              {/* Looking For */}
              <div className="flex flex-col items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="text-center">
                  <h2 className="font-pp-mori font-semibold text-lg sm:text-xl text-[#020617] dark:text-white">
                    You're Looking For
                  </h2>
                  <p className="font-urbanist text-sm text-[#6B7280] mt-1">
                    Add up to 9 brainrots
                  </p>
                </div>
                <TradeGrid
                  columnType="them"
                  items={lookingForItems}
                  onAddItem={handleOpenModal}
                  onRemoveItem={handleRemoveItem}
                />
              </div>
            </div>

            {/* Result Column (same component as /calculator) */}
            <TradeResultContainer
              youItems={offeringItems}
              themItems={lookingForItems}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Footer actions */}
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[20px] sm:rounded-[25px] px-4 py-3 sm:px-6 sm:py-4 transition-colors w-full lg:w-fit mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/trades">
              <button
                type="button"
                className="
                  flex items-center justify-center gap-2
                  w-full sm:w-auto px-6 py-3 rounded-[10px]
                  bg-white dark:bg-slate-800 text-[#020617] dark:text-white
                  text-sm font-medium font-urbanist
                  border border-[#E5E7EB] dark:border-slate-700
                  hover:border-[#4F46E5]/50 hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-200
                  cursor-pointer
                "
              >
                <ArrowLeft size={18} />
                Cancel
              </button>
            </Link>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`
                flex items-center justify-center gap-2
                w-full sm:w-auto px-8 py-3 rounded-[10px]
                text-sm font-medium font-urbanist
                transition-all duration-200
                ${canSubmit
                  ? "bg-[#4F46E5] text-white hover:bg-[#6366F1] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] active:scale-[0.98] cursor-pointer"
                  : "bg-[#E5E7EB] dark:bg-slate-700 text-[#9CA3AF] cursor-not-allowed"
                }
              `}
            >
              <Send size={18} />
              {isSubmitting ? "Posting..." : "Post Trade"}
            </button>
          </div>

          {!isLoggedIn && (
            <p className="text-center font-urbanist text-sm text-red-500 mt-2 leading-tight">
              Please sign in to post a trade.
            </p>
          )}
          {isLoggedIn && !canSubmit && !isSubmitting && (
            <p className="text-center font-urbanist text-sm text-[#6B7280] mt-2 leading-tight">
              Add at least one item to each side to post your trade.
            </p>
          )}
          {error && (
            <p className="text-center font-urbanist text-sm text-red-500 mt-2 leading-tight">
              {error}
            </p>
          )}
        </div>
      </div>

      <SelectItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectItem={handleSelectItem}
      />
    </>
  );
}
