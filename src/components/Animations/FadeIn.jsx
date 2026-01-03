"use client";

import { useInView } from "@/hooks/useInView";

export default function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up", // up, down, left, right, none
  distance = 30,
  threshold = 0.1,
  triggerOnce = true,
}) {
  const [ref, isInView] = useInView({ threshold, triggerOnce });

  const getInitialTransform = () => {
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
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : getInitialTransform(),
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
