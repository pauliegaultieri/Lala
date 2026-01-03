"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Loader2, Check, XCircle } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useLenis } from "@/components/Providers/SmoothScrollProvider";
import { useToast } from "@/components/Providers/ToastProvider";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatLGCValue, formatTimeAgo } from "@/lib/trade-utils";
import { formatMutationsForDisplay, formatTraitsForDisplay } from "@/lib/mutation-trait-utils";

function getModifierTextStyle(modifier) {
  if (!modifier) return undefined;
  if (modifier?.gradient?.colors && Array.isArray(modifier.gradient.colors)) {
    // Handle rainbow gradient with multiple colors - make it more prominent
    const colors = modifier.gradient.colors.join(', ');
    return {
      backgroundImage: `linear-gradient(90deg, ${colors})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      fontWeight: "600",
      textShadow: "0 0 20px rgba(255,255,255,0.3)",
      filter: "brightness(1.2) saturate(1.3)",
    };
  }
  if (modifier?.gradient?.from && modifier?.gradient?.to) {
    const angle = Number.isFinite(Number(modifier.gradient.angle)) ? Number(modifier.gradient.angle) : 90;
    return {
      backgroundImage: `linear-gradient(${angle}deg, ${modifier.gradient.from}, ${modifier.gradient.to})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      fontWeight: "600",
      filter: "brightness(1.1)",
    };
  }
  if (modifier?.color) return { 
    color: modifier.color,
    fontWeight: "600",
  };
  return undefined;
}

function ItemCarousel({ items = [], title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeItems = items || [];

  const goToNext = () => {
    if (safeItems.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % safeItems.length);
    }
  };

  const currentItem = safeItems[currentIndex];

  return (
    <div className="flex-1 flex flex-col gap-3">
      <h3 className="font-pp-mori font-semibold text-lg text-[#020617] dark:text-white">
        {title}
      </h3>
      
      {/* Image container with arrow */}
      <div className="relative bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-[16px] h-[240px] flex items-center justify-center">
        {currentItem ? (
          <div className="relative w-full h-full p-4">
            <Image
              src={currentItem.imageUrl || "/images/temp/roblox.webp"}
              alt=""
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="text-[#9CA3AF] dark:text-gray-400 font-urbanist">No items</div>
        )}
        
        {/* Purple arrow button - positioned at bottom right inside the card */}
        {safeItems.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#4F46E5] flex items-center justify-center cursor-pointer hover:bg-[#4338CA] transition-colors shadow-lg"
          >
            <ArrowRight size={20} className="text-white" />
          </button>
        )}
      </div>
      
      {/* Item name and value display */}
      {currentItem && (
        <>
          <div className="font-urbanist">
            <span className="text-[#020617] dark:text-white font-semibold text-base">
              {currentItem.name}
            </span>
          </div>
          <div className="font-urbanist flex items-center justify-between">
            <div>
              <span className="text-[#020617] dark:text-white font-semibold text-lg">
                {currentItem.value || "0"}
              </span>
              <span className="text-[#9CA3AF] dark:text-gray-400 ml-1 text-base">LGC</span>
            </div>
            {safeItems.length > 1 && (
              <span className="text-[#9CA3AF] dark:text-gray-400 text-sm">
                {currentIndex + 1} / {safeItems.length}
              </span>
            )}
          </div>
        </>
      )}
      
      {/* Enhanced mutation and traits display */}
      {currentItem && (
        <div className="space-y-3 min-h-[80px]">
          {/* Mutation */}
          {currentItem.mutation && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse"></div>
                <span className="text-xs text-[#6B7280] dark:text-gray-400 font-urbanist font-medium uppercase tracking-wider">Mutation</span>
              </div>
              <div className="flex-1">
                <span 
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-[#4F46E5]/20 bg-[#4F46E5]/5 text-sm font-urbanist font-semibold shadow-sm"
                  style={getModifierTextStyle(currentItem.mutation)}
                >
                  {currentItem.mutation.name}
                </span>
              </div>
            </div>
          )}
          
          {/* Traits */}
          {currentItem.traits && currentItem.traits.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                <span className="text-xs text-[#6B7280] dark:text-gray-400 font-urbanist font-medium uppercase tracking-wider">
                  Traits {currentItem.traits.length > 1 && `(${currentItem.traits.length})`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentItem.traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-urbanist font-medium shadow-sm hover:shadow-md transition-shadow"
                    style={getModifierTextStyle(trait)}
                  >
                    {trait.icon && <span className="mr-1.5 text-base">{trait.icon}</span>}
                    {trait.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Fallback tags if no mutation/traits data */}
          {!currentItem.mutation && (!currentItem.traits || currentItem.traits.length === 0) && currentItem.tags && currentItem.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></div>
                <span className="text-xs text-[#6B7280] dark:text-gray-400 font-urbanist font-medium uppercase tracking-wider">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentItem.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-[#E5E7EB] dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-urbanist text-[#6B7280] dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TradeDetailsModal({
  isOpen,
  onClose,
  trade: initialTrade,
}) {
  const { data: session } = useSession();
  const lenisRef = useLenis();
  const toast = useToast();
  const modalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [trade, setTrade] = useState(initialTrade);
  const [isJoining, setIsJoining] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Update trade when initialTrade changes
  useEffect(() => {
    setTrade(initialTrade);
  }, [initialTrade]);

  // Helper to format items for display
  async function formatItemsForDisplay(items) {
    if (!items || !Array.isArray(items)) return [];
    
    const formattedItems = await Promise.all(
      items.map(async (item) => {
        // Handle mutation - use helper to get proper colors/gradients
        let mutation = null;
        if (item.mutation || item.mutationName) {
          const mutations = await formatMutationsForDisplay([item.mutation || item.mutationName]);
          mutation = mutations[0] || null;
        }
        
        // Handle traits - could be array of objects or strings
        let traits = [];
        const traitsArray = item.traits || item.traitNames || [];
        if (traitsArray.length > 0) {
          traits = await formatTraitsForDisplay(traitsArray);
        }
        
        return {
          name: item.name,
          imageUrl: item.imageUrl || "/images/temp/roblox.webp",
          value: item.value || formatLGCValue(item.finalValueLGC),
          mutation: mutation,
          traits: traits,
          tags: item.tags || [
            mutation?.name,
            ...traits.map(t => t.name),
          ].filter(Boolean),
        };
      })
    );
    
    return formattedItems;
  }

  // Real-time listener for trade updates
  useEffect(() => {
    if (!isOpen || !trade?.id) return;

    // Get the actual trade ID (might be in _original if formatted)
    const tradeId = trade._original?.id || trade.id;
    if (!tradeId || tradeId.toString().length < 10) return; // Skip fake IDs

    const unsubscribe = onSnapshot(
      doc(db, "trades", tradeId),
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Always format the items from Firestore data
          const offeringItems = await formatItemsForDisplay(data.offeringItems);
          const lookingForItems = await formatItemsForDisplay(data.lookingForItems);
          
          // Update trade state
          setTrade((prev) => ({
            ...prev,
            // Update status-related fields from Firestore
            status: data.status,
            ownerAccepted: data.ownerAccepted,
            joinerAccepted: data.joinerAccepted,
            joinedBy: data.joinedBy,
            joinedByRobloxId: data.joinedByRobloxId,
            joinedByUsername: data.joinedByUsername,
            joinedByAvatarUrl: data.joinedByAvatarUrl,
            failReason: data.failReason,
            // Update formatted items
            offeringItems,
            lookingForItems,
            // Update timestamps
            createdAt: data.createdAt?.toDate?.()?.toISOString() || prev?.createdAt,
            joinedAt: data.joinedAt?.toDate?.()?.toISOString() || null,
            completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
            failedAt: data.failedAt?.toDate?.()?.toISOString() || null,
            // Keep original reference
            _original: { ...prev?._original, ...data, id: docSnap.id },
          }));
        }
      },
      (error) => {
        console.error("Error listening to trade:", error);
      }
    );

    return () => unsubscribe();
  }, [isOpen, trade?.id, trade?._original?.id]);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Get trade ID for API calls
  const tradeId = trade?._original?.id || trade?.id;

  // Determine user's role in this trade (check both formatted and raw data)
  const ownerRobloxId = trade?.ownerRobloxId || trade?._original?.ownerRobloxId;
  const joinerRobloxId = trade?.joinedByRobloxId || trade?._original?.joinedByRobloxId;
  const isOwner = session?.user?.robloxId === ownerRobloxId;
  const isJoiner = session?.user?.robloxId === joinerRobloxId;
  const isParticipant = isOwner || isJoiner;
  const canJoin = session && !isOwner && trade?.status === "active";
  const canCancel = isOwner && trade?.status === "active";

  // Handle join trade
  async function handleJoinTrade() {
    if (!canJoin || !tradeId) return;
    
    setIsJoining(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/trades/${tradeId}/join`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join trade");
      }
    } catch (err) {
      console.error("Error joining trade:", err);
      setActionError(err.message);
    } finally {
      setIsJoining(false);
    }
  }

  // Handle accept trade
  async function handleAcceptTrade() {
    if (!isParticipant || !tradeId) return;
    
    setIsAccepting(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/trades/${tradeId}/accept`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept trade");
      }
    } catch (err) {
      console.error("Error accepting trade:", err);
      setActionError(err.message);
    } finally {
      setIsAccepting(false);
    }
  }

  // Handle decline trade
  async function handleDeclineTrade() {
    if (!isParticipant || !tradeId) return;
    
    setIsDeclining(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/trades/${tradeId}/decline`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to decline trade");
      }

      onClose();
    } catch (err) {
      console.error("Error declining trade:", err);
      setActionError(err.message);
    } finally {
      setIsDeclining(false);
    }
  }

  // Handle cancel trade (owner only, active trades)
  async function handleCancelTrade() {
    if (!canCancel || !tradeId) return;
    
    setIsCancelling(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel trade");
      }

      onClose();
    } catch (err) {
      console.error("Error cancelling trade:", err);
      setActionError(err.message);
    } finally {
      setIsCancelling(false);
    }
  }

  useEffect(() => {
    const lenis = lenisRef?.current;
    const modal = modalRef.current;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (lenis) {
        lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (lenis) {
        lenis.start();
      }
    }

    // Handle wheel events to allow modal scrolling
    const handleWheel = (e) => {
      if (modal && modal.contains(e.target)) {
        e.stopPropagation();
      }
    };

    if (isOpen) {
      window.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("wheel", handleWheel);
      if (lenis) {
        lenis.start();
      }
    };
  }, [isOpen, lenisRef]);

  if (!shouldRender || !trade) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 11000 }}>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />

      {/* Modal */}
      <div 
        ref={modalRef}
        className={`
          relative bg-white dark:bg-slate-900 rounded-[24px] 
          w-full max-w-[1100px] max-h-[90vh] 
          overflow-y-auto p-8 flex flex-col gap-6 
          modal-scrollbar overscroll-contain
          transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
        data-lenis-prevent
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-pp-mori font-semibold text-[2rem] text-[#020617] dark:text-white">
              Trade Details
            </h2>
            <p className="font-urbanist text-[#9CA3AF] dark:text-gray-400 text-base mt-1">
              ID: {trade.id}
            </p>
          </div>
          <button onClick={onClose} className="p-1 cursor-pointer hover:opacity-70 transition-opacity">
            <X size={32} strokeWidth={2} className="text-[#020617] dark:text-white" />
          </button>
        </div>

        {/* Content - 3 columns */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Overview Card */}
          <div className="bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-[16px] p-5 flex flex-col gap-4 md:w-[180px] shrink-0">
            <h3 className="font-pp-mori font-semibold text-lg text-[#020617] dark:text-white">
              Overview
            </h3>
            <div className="flex flex-col gap-2 font-urbanist text-sm">
              <div>
                <span className="text-[#9CA3AF] dark:text-gray-400">Posted by: </span>
                <span className="text-[#4F46E5] dark:text-indigo-400">@{trade.username || trade.ownerUsername || "Unknown"}</span>
              </div>
              <div>
                <span className="text-[#9CA3AF] dark:text-gray-400">Posted: </span>
                <span className="text-[#020617] dark:text-white font-medium">{trade.timeAgo || (trade.createdAt ? formatTimeAgo(trade.createdAt) : "Unknown")}</span>
              </div>
              <div>
                <span className="text-[#9CA3AF] dark:text-gray-400">Views: </span>
                <span className="text-[#020617] dark:text-white font-medium">{trade.views || 0}</span>
              </div>
            </div>
          </div>

          {/* Looking For Carousel */}
          <ItemCarousel items={trade.lookingForItems} title="Looking for" />

          {/* Offering Carousel */}
          <ItemCarousel items={trade.offeringItems} title="Offering" />
        </div>

        {/* Status Banner */}
        {trade?.status === "pending" && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-[12px] p-4">
            <p className="font-urbanist text-amber-800 dark:text-amber-200 text-sm">
              <strong>Trade Pending:</strong> {trade.joinedByUsername} has joined this trade. 
              {isOwner && !trade.ownerAccepted && " Please accept or decline."}
              {isJoiner && !trade.joinerAccepted && " Please accept or decline."}
              {isOwner && trade.ownerAccepted && " Waiting for the other party to accept."}
              {isJoiner && trade.joinerAccepted && " Waiting for the other party to accept."}
            </p>
            <div className="flex gap-2 mt-2 text-xs font-urbanist">
              <span className={`px-2 py-1 rounded ${trade.ownerAccepted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                Owner: {trade.ownerAccepted ? '✓ Accepted' : 'Pending'}
              </span>
              <span className={`px-2 py-1 rounded ${trade.joinerAccepted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                Joiner: {trade.joinerAccepted ? '✓ Accepted' : 'Pending'}
              </span>
            </div>
          </div>
        )}

        {trade?.status === "completed" && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-[12px] p-4">
            <p className="font-urbanist text-green-800 dark:text-green-200 text-sm">
              <strong>Trade Completed!</strong> This trade was successfully completed.
            </p>
          </div>
        )}

        {trade?.status === "failed" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[12px] p-4">
            <p className="font-urbanist text-red-800 dark:text-red-200 text-sm">
              <strong>Trade Failed:</strong> {trade.failReason === "owner_declined" ? "Owner declined" : 
                trade.failReason === "joiner_declined" ? "Joiner declined" : 
                trade.failReason === "expired" ? "Trade expired" : 
                trade.failReason === "cancelled" ? "Trade was cancelled" : "Trade failed"}
            </p>
          </div>
        )}

        {/* Error Message */}
        {actionError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[12px] p-3">
            <p className="font-urbanist text-red-600 dark:text-red-400 text-sm">{actionError}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-[#E5E7EB] dark:border-slate-700 mt-2">
          <p className="font-urbanist text-[#9CA3AF] dark:text-gray-400 text-sm max-w-sm leading-relaxed">
            Review this trade carefully before accepting. Values are estimates and can change over time.
          </p>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${window.location.origin}/trades/${tradeId}`);
                  toast.success("Link copied", "Trade link copied to clipboard");
                } catch {
                  toast.error("Copy failed", "Could not copy trade link");
                }
              }}
              className="px-5 py-3 rounded-[10px] border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#020617] dark:text-white font-urbanist font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer text-sm"
            >
              Copy Trade Link
            </button>

            {/* Cancel Button - for owner on active trades */}
            {canCancel && (
              <button
                onClick={handleCancelTrade}
                disabled={isCancelling}
                className="px-5 py-3 rounded-[10px] border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-urbanist font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {isCancelling ? "Cancelling..." : "Cancel Trade"}
              </button>
            )}

            {/* Join Button - for non-owners on active trades */}
            {canJoin && (
              <button
                onClick={handleJoinTrade}
                disabled={isJoining}
                className="px-5 py-3 rounded-[10px] bg-[#4F46E5] text-white font-urbanist font-medium hover:bg-[#4338CA] transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isJoining ? "Joining..." : "Join Trade"}
              </button>
            )}

            {/* Accept/Decline Buttons - for participants on pending trades */}
            {trade?.status === "pending" && isParticipant && (
              <>
                {/* Show accept button if user hasn't accepted yet */}
                {((isOwner && !trade.ownerAccepted) || (isJoiner && !trade.joinerAccepted)) && (
                  <>
                    <button
                      onClick={handleDeclineTrade}
                      disabled={isDeclining}
                      className="px-5 py-3 rounded-[10px] border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-urbanist font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isDeclining ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Decline
                    </button>
                    <button
                      onClick={handleAcceptTrade}
                      disabled={isAccepting}
                      className="px-5 py-3 rounded-[10px] bg-green-600 text-white font-urbanist font-medium hover:bg-green-700 transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAccepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Accept
                    </button>
                  </>
                )}

                {/* Show waiting message if user already accepted */}
                {((isOwner && trade.ownerAccepted) || (isJoiner && trade.joinerAccepted)) && (
                  <div className="px-5 py-3 rounded-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-urbanist font-medium text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    You accepted - waiting for other party
                  </div>
                )}
              </>
            )}

            {/* Not logged in message */}
            {!session && trade?.status === "active" && (
              <p className="text-sm text-[#9CA3AF] font-urbanist">Sign in to join this trade</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
