"use client";

import { useEffect, useState } from "react";

export default function PageTransition({ children, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
