"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function formatTime(value) {
  if (!value) return "";

  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function NotificationsBell() {
  const { data: session } = useSession();
  const robloxId = session?.user?.robloxId ? String(session.user.robloxId) : null;

  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const notificationsCollection = useMemo(() => {
    if (!robloxId) return null;
    return collection(db, "notifications", robloxId, "items");
  }, [robloxId]);

  useEffect(() => {
    if (!notificationsCollection) return;

    const q = query(notificationsCollection, orderBy("createdAt", "desc"), limit(10));
    return onSnapshot(q, (snap) => {
      const next = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(next);
      setUnreadCount(next.filter((n) => !n.isRead).length);
    });
  }, [notificationsCollection]);

  useEffect(() => {
    if (!notificationsCollection) return;

    const q = query(
      notificationsCollection,
      where("isRead", "==", false),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    return onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });
  }, [notificationsCollection]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markRead(id) {
    if (!robloxId || !id) return;
    try {
      await updateDoc(doc(db, "notifications", robloxId, "items", id), {
        isRead: true,
      });
    } catch {}
  }

  if (!robloxId) return null;

  return (
    <div className="relative z-[10001]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className="relative p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-gray-200/60 dark:border-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#4F46E5] text-white text-[11px] font-semibold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-[360px] max-w-[90vw] p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl z-[10001]">
          <div className="px-2 py-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 font-urbanist">
              Notifications
            </span>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors font-urbanist"
            >
              View all
            </Link>
          </div>

          <div className="max-h-[380px] overflow-auto">
            {items.length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400 font-urbanist">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {items.slice(0, 8).map((n) => (
                  <Link
                    key={n.id}
                    href={n.actionUrl || "/trades"}
                    onClick={() => {
                      markRead(n.id);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${
                      n.isRead ? "opacity-80" : "bg-indigo-50/40 dark:bg-indigo-900/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 font-urbanist truncate">
                          {n.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-urbanist mt-0.5 line-clamp-2">
                          {n.message}
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-urbanist whitespace-nowrap">
                        {formatTime(n.createdAt)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
