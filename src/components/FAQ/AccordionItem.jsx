"use client";

import { Plus, Minus } from "lucide-react";

export default function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[16px] sm:rounded-[20px] overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 lg:p-7 text-left cursor-pointer"
      >
        <span className="font-pp-mori font-medium text-base sm:text-lg lg:text-xl text-[#020617] dark:text-white pr-4 transition-colors">
          {question}
        </span>
        <div className="flex-shrink-0 text-[#020617] dark:text-white transition-colors">
          {isOpen ? (
            <Minus size={20} className="sm:w-6 sm:h-6" />
          ) : (
            <Plus size={20} className="sm:w-6 sm:h-6" />
          )}
        </div>
      </button>
      
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-5 sm:px-6 lg:px-7 pb-5 sm:pb-6 lg:pb-7">
          <p className="font-urbanist text-sm sm:text-base text-[#64748B] dark:text-gray-400 leading-relaxed transition-colors">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
