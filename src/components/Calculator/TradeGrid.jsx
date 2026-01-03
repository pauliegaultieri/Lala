import TradeSlot from "./TradeSlot";

export default function TradeGrid({ columnType, items = [], onAddItem, onRemoveItem }) {
  const nextAvailableIndex = items.findIndex(item => item == null);

  return (
    <div className="grid grid-cols-3 gap-x-2 sm:gap-x-[10px] gap-y-3 sm:gap-y-[20px]">
      {items.map((item, index) => (
        <TradeSlot
          key={index}
          isEmpty={index === nextAvailableIndex}
          onAdd={
            index === nextAvailableIndex
              ? () => onAddItem({ column: columnType, index })
              : undefined
          }
          onRemove={
            item && onRemoveItem
              ? () => onRemoveItem({ column: columnType, index })
              : undefined
          }
          value={item}
        />
      ))}
    </div>
  );
}
