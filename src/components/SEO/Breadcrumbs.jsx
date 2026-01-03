"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumbs Component
 * Displays navigation breadcrumbs with structured data for SEO
 * @param {Array} items - Array of breadcrumb items [{name, url}]
 * @param {boolean} showHome - Whether to show home icon (default: true)
 */
export default function Breadcrumbs({ items = [], showHome = true }) {
  if (!items || items.length === 0) return null;

  const breadcrumbItems = showHome 
    ? [{ name: "Home", url: "/" }, ...items]
    : items;

  return (
    <nav 
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm font-urbanist text-gray-600 dark:text-gray-400 mb-6"
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const isHome = index === 0 && showHome;

        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
            )}
            
            {isLast ? (
              <span 
                className="text-gray-900 dark:text-white font-medium"
                aria-current="page"
              >
                {isHome ? <Home className="w-4 h-4" /> : item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-[#4F46E5] dark:hover:text-[#818CF8] transition-colors flex items-center gap-1"
              >
                {isHome ? <Home className="w-4 h-4" /> : item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
