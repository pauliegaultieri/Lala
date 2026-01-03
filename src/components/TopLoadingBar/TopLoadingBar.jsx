"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function TopLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef(null);
  const completingRef = useRef(false);
  const lastUrlRef = useRef("");
  const startTimerRef = useRef(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function stopStartTimer() {
    if (startTimerRef.current) cancelAnimationFrame(startTimerRef.current);
    startTimerRef.current = null;
  }

  function scheduleStart() {
    stopStartTimer();
    startTimerRef.current = requestAnimationFrame(() => {
      startTimerRef.current = null;
      start();
    });
  }

  function start() {
    if (completingRef.current) return;

    setIsActive(true);
    setProgress((p) => (p > 0 && p < 85 ? p : 10));

    stopRaf();

    const tick = () => {
      setProgress((p) => {
        if (!isActive) return p;
        if (p >= 90) return p;
        const next = p + (90 - p) * 0.06 + 0.2;
        return clamp(next, 0, 90);
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  function done() {
    if (!isActive) return;

    completingRef.current = true;
    stopRaf();

    setProgress(100);

    window.setTimeout(() => {
      setIsActive(false);
      setProgress(0);
      completingRef.current = false;
    }, 200);
  }

  useEffect(() => {
    const currentUrl = `${pathname || ""}?${searchParams?.toString() || ""}`;
    if (!lastUrlRef.current) {
      lastUrlRef.current = currentUrl;
      return;
    }

    if (currentUrl !== lastUrlRef.current) {
      lastUrlRef.current = currentUrl;
      done();
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    function onStartEvent() {
      scheduleStart();
    }

    window.addEventListener("sabrvalues:navigation-start", onStartEvent);
    return () => window.removeEventListener("sabrvalues:navigation-start", onStartEvent);
  }, []);

  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    function emitStart() {
      const dispatch = () => window.dispatchEvent(new Event("sabrvalues:navigation-start"));
      if (typeof queueMicrotask === "function") queueMicrotask(dispatch);
      else window.setTimeout(dispatch, 0);
    }

    window.history.pushState = function (...args) {
      emitStart();
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      emitStart();
      return originalReplaceState.apply(this, args);
    };

    const onPopState = () => emitStart();
    window.addEventListener("popstate", onPopState);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    function isModifiedClick(event) {
      return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    }

    function onClickCapture(event) {
      if (isModifiedClick(event)) return;

      const target = event.target;
      if (!target) return;

      const anchor = target.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";
      if (!href) return;

      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;

      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.hasAttribute("download")) return;

      if (href.startsWith("http://") || href.startsWith("https://")) {
        try {
          const url = new URL(href);
          if (url.origin !== window.location.origin) return;
        } catch {
          return;
        }
      }

      const dispatch = () => window.dispatchEvent(new Event("sabrvalues:navigation-start"));
      if (typeof queueMicrotask === "function") queueMicrotask(dispatch);
      else window.setTimeout(dispatch, 0);
    }

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, []);

  useEffect(() => () => {
    stopRaf();
    stopStartTimer();
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-transparent">
      <div
        className="h-full bg-[#4F46E5] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
