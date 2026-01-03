"use client";

import { useInView } from "@/hooks/useInView";
import { Children, cloneElement, isValidElement } from "react";

export default function StaggerChildren({
  children,
  className = "",
  staggerDelay = 0.1,
  baseDelay = 0,
  duration = 0.5,
  direction = "up",
  distance = 20,
  threshold = 0.1,
  triggerOnce = true,
}) {
  const [ref, isInView] = useInView({ threshold, triggerOnce });

  const getTransform = (inView) => {
    if (!inView) {
      switch (direction) {
        case "up":
          return `translateY(${distance}px)`;
        case "down":
          return `translateY(-${distance}px)`;
        case "left":
          return `translateX(${distance}px)`;
        case "right":
          return `translateX(-${distance}px)`;
        default:
          return "none";
      }
    }
    return "translateY(0) translateX(0)";
  };

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        const delay = baseDelay + index * staggerDelay;

        return (
          <div
            style={{
              opacity: isInView ? 1 : 0,
              transform: getTransform(isInView),
              transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
              willChange: "opacity, transform",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
