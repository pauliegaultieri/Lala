"use client";

export default function FAQFilterTabs({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            px-5 sm:px-6 lg:px-8 py-2 sm:py-2.5
            rounded-full
            font-urbanist font-medium
            text-sm sm:text-base
            transition-all duration-200
            cursor-pointer
            ${activeCategory === category.id
              ? "bg-[#4F46E5] text-white"
              : "bg-white dark:bg-slate-900 text-[#020617] dark:text-white border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5] dark:hover:border-[#4F46E5]"
            }
          `}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
