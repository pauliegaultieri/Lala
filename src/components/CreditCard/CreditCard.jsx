"use client";

import { ArrowUpRight } from "lucide-react";

export default function CreditCard({ name, title, imageUrl, link }) {
  const handleClick = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-[#E8E8F0] dark:bg-slate-800 rounded-[20px] sm:rounded-[24px] overflow-hidden transition-colors">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Info Section */}
      <div className="flex items-center justify-between mt-4 sm:mt-5">
        <div className="flex flex-col">
          <h3 className="font-pp-mori font-semibold text-lg sm:text-xl lg:text-2xl text-[#020617] dark:text-white transition-colors">
            {name}
          </h3>
          <p className="font-urbanist text-sm sm:text-base text-[#64748B] dark:text-gray-400 transition-colors">
            {title}
          </p>
        </div>
        
        {/* Arrow Button - only show if link exists */}
        {link && (
          <button
            onClick={handleClick}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#4F46E5] flex items-center justify-center text-white hover:bg-[#6366F1] transition-colors cursor-pointer"
          >
            <ArrowUpRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
