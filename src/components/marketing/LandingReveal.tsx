"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export default function LandingReveal({
  children,
  className = "",
  delayMs = 0,
}: LandingRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "transition-[opacity,transform] duration-700 ease-[ease]",
        "motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:!transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
