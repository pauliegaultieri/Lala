"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button className="cursor-pointer p-3 rounded-full bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 shadow-lg">
          <span className="sr-only">Toggle theme</span>
          <div className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleTheme}
        className="
          cursor-pointer p-3 rounded-full
          bg-white dark:bg-slate-800
          text-gray-700 dark:text-gray-200
          shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50
          border border-gray-200/50 dark:border-slate-700/50
          hover:scale-110 hover:shadow-xl
          active:scale-95
          transition-all duration-200
        "
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
