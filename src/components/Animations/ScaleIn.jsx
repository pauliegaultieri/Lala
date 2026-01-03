"use client";

import { useInView } from "@/hooks/useInView";

export default function ScaleIn({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  initialScale = 0.9,
  threshold = 0.1,
  triggerOnce = true,
}) {
  const [ref, isInView] = useInView({ threshold, triggerOnce });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : `scale(${initialScale})`,
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
