"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, CheckCircle2 } from "lucide-react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function formatDate(value) {
  if (!value) return "";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  return date.toLocaleString();
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const robloxId = session?.user?.robloxId ? String(session.user.robloxId) : null;

  const [items, setItems] = useState([]);

  const notificationsCollection = useMemo(() => {
    if (!robloxId) return null;
    return collection(db, "notifications", robloxId, "items");
  }, [robloxId]);

  useEffect(() => {
    if (!notificationsCollection) return;

    const q = query(notificationsCollection, orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [notificationsCollection]);

  async function markRead(id) {
    if (!robloxId || !id) return;
    try {
      await updateDoc(doc(db, "notifications", robloxId, "items", id), {
        isRead: true,
      });
    } catch {}
  }

  async function markAllRead() {
    if (!robloxId) return;
    try {
      const unread = items.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => markRead(n.id)));
    } catch {}
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-pp-mori font-semibold text-3xl text-[#020617] dark:text-white">
            Notifications
          </h1>
          <p className="mt-3 font-urbanist text-sm text-[#6B7280] dark:text-gray-400">
            Log in to see your trade notifications.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center">
              <Bell size={18} className="text-[#4F46E5]" />
            </div>
            <h1 className="font-pp-mori font-semibold text-3xl text-[#020617] dark:text-white">
              Notifications
            </h1>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            className="px-4 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 text-sm font-semibold text-[#020617] dark:text-white hover:border-[#4F46E5]/50 transition-colors font-urbanist"
          >
            Mark all read
          </button>
        </div>

        <div className="mt-6">
          {items.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[16px] p-6">
              <p className="font-urbanist text-sm text-[#6B7280] dark:text-gray-400">
                No notifications yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((n) => (
                <Link
                  key={n.id}
                  href={n.actionUrl || "/trades"}
                  onClick={() => markRead(n.id)}
                  className={`block rounded-[16px] border p-4 transition-colors ${
                    n.isRead
                      ? "bg-white dark:bg-slate-900 border-[#E5E7EB] dark:border-slate-700"
                      : "bg-indigo-50/60 dark:bg-indigo-900/10 border-[#4F46E5]/20"
                  } hover:border-[#4F46E5]/50`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                        )}
                        <h3 className="font-urbanist font-semibold text-sm text-[#020617] dark:text-white truncate">
                          {n.title}
                        </h3>
                      </div>
                      <p className="mt-1 font-urbanist text-sm text-[#6B7280] dark:text-gray-400">
                        {n.message}
                      </p>
                      <p className="mt-2 font-urbanist text-xs text-[#9CA3AF]">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>

                    {n.isRead && (
                      <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
