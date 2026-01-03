"use client";

import { useState } from "react";
import AccordionItem from "./AccordionItem";

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
