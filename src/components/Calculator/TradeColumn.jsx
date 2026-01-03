import TradeLabel from "./TradeLabel";
import TradeGrid from "./TradeGrid";

export default function TradeColumn({ type, items = [], onAddItem, onRemoveItem }) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full sm:w-auto">
      <TradeLabel type={type} />
      <TradeGrid columnType={type} items={items} onAddItem={onAddItem} onRemoveItem={onRemoveItem} />
    </div>
  );
}
