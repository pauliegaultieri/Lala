"use client";

import TradeColumn from "./TradeColumn";

export default function TradeCalculatorContainer({ youItems = [], themItems = [], onAddItem, onRemoveItem }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[20px] sm:rounded-[25px] p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-6 sm:gap-4 lg:gap-6 w-full lg:w-[clamp(320px,51.25vw,738px)] transition-colors">
      <TradeColumn type="you" items={youItems} onAddItem={onAddItem} onRemoveItem={onRemoveItem} />
      <TradeColumn type="them" items={themItems} onAddItem={onAddItem} onRemoveItem={onRemoveItem} />
    </div>
  );
}
