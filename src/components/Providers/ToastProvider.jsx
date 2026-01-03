"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function getToastStyles(type) {
  if (type === "error") {
    return {
      icon: XCircle,
      ring: "ring-red-500/20",
      iconColor: "text-red-500",
      titleColor: "text-[#020617] dark:text-white",
      subtitleColor: "text-[#6B7280] dark:text-gray-300",
      accentBg: "bg-red-500/10",
    };
  }

  return {
    icon: CheckCircle2,
    ring: "ring-[#4F46E5]/20",
    iconColor: "text-[#4F46E5]",
    titleColor: "text-[#020617] dark:text-white",
    subtitleColor: "text-[#6B7280] dark:text-gray-300",
    accentBg: "bg-[#4F46E5]/10",
  };
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, isLeaving: true } : t)));

    const existing = timeoutsRef.current.get(`leave:${id}`);
    if (existing) clearTimeout(existing);

    timeoutsRef.current.set(
      `leave:${id}`,
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timeoutsRef.current.delete(`leave:${id}`);
      }, 180)
    );
  }, []);

  const show = useCallback(
    ({ message, description = "", type = "success", durationMs = 1800 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setToasts((prev) => [{ id, message, description, type, isLeaving: false }, ...prev].slice(0, 3));

      const existing = timeoutsRef.current.get(`auto:${id}`);
      if (existing) clearTimeout(existing);

      timeoutsRef.current.set(
        `auto:${id}`,
        setTimeout(() => {
          dismiss(id);
          timeoutsRef.current.delete(`auto:${id}`);
        }, durationMs)
      );

      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      show,
      success: (message, description) => show({ message, description, type: "success" }),
      error: (message, description) => show({ message, description, type: "error" }),
      dismiss,
    }),
    [dismiss, show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-5 right-5 z-[2147483647] pointer-events-none">
        <div className="flex flex-col gap-3 items-end">
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            const Icon = styles.icon;

            return (
              <div
                key={toast.id}
                className={
                  "pointer-events-auto w-[320px] max-w-[calc(100vw-2.5rem)] " +
                  "rounded-2xl border border-[#E5E7EB] dark:border-slate-700 " +
                  "bg-white/95 dark:bg-slate-900/95 backdrop-blur " +
                  "shadow-xl shadow-black/5 dark:shadow-black/30 " +
                  "ring-1 " +
                  styles.ring +
                  " " +
                  "transition-all duration-200 " +
                  (toast.isLeaving
                    ? "opacity-0 translate-x-2 scale-[0.98]"
                    : "opacity-100 translate-x-0 scale-100")
                }
              >
                <div className="p-4 flex gap-3 items-start">
                  <div className={`shrink-0 mt-0.5 w-9 h-9 rounded-full ${styles.accentBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${styles.iconColor}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={`font-pp-mori font-semibold text-sm ${styles.titleColor}`}>{toast.message}</div>
                    {toast.description ? (
                      <div className={`font-urbanist text-xs mt-0.5 ${styles.subtitleColor}`}>{toast.description}</div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    className="shrink-0 px-2 py-1 rounded-[10px] font-urbanist text-xs text-[#6B7280] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    aria-label="Dismiss"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
