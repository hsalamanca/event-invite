"use client";

import { useEffect, useState } from "react";
import { marqueeFont } from "@/lib/marketing-theme";

type AddressBarMarqueeProps = {
  urls: string[];
  /** Larger lockup for the hero artifact. */
  size?: "hero" | "band";
};

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={className}
      fill="none"
    >
      <rect
        x="4.25"
        y="9"
        width="11.5"
        height="8"
        rx="2"
        fill="#3A2A30"
      />
      <path
        d="M6.75 9V7.2a3.25 3.25 0 0 1 6.5 0V9"
        stroke="#3A2A30"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Champagne address-bar marquee — the emotional hero of Concept B.
 * SVG chrome refs in public/landing/marquee-domain/chrome are design guides;
 * this is live CSS so EN/ES URLs and reduced-motion stay real.
 */
export default function AddressBarMarquee({
  urls,
  size = "hero",
}: AddressBarMarqueeProps) {
  const list = urls.filter(Boolean);
  const featured = list[list.length - 1] ?? "katia.com";
  const [index, setIndex] = useState(list.length > 1 ? list.length - 1 : 0);
  const [reduce, setReduce] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce || list.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduce, list.length]);

  const url = reduce ? featured : (list[index] ?? featured);
  const hero = size === "hero";

  return (
    <div
      className={`marquee-chrome relative mx-auto w-full overflow-hidden ${
        hero ? "max-w-[22.5rem] sm:max-w-xl" : "max-w-md"
      }`}
      role="img"
      aria-label={url}
    >
      <div
        className={`marquee-sheen flex items-center gap-2.5 rounded-full border px-3.5 ${
          hero ? "min-h-[3.15rem] sm:min-h-[3.5rem] sm:px-5" : "min-h-12 px-4"
        }`}
        style={{
          background:
            "linear-gradient(180deg, #FFFCFA 0%, #FBF6F2 55%, #F3E6DC 100%)",
          borderColor: "var(--landing-gold, #C4A574)",
          boxShadow:
            "0 10px 32px rgba(183,110,121,0.22), 0 0 0 1px rgba(201,162,122,0.35), inset 0 1px 0 #FFFCFA",
        }}
      >
        <LockIcon className={hero ? "h-5 w-5 shrink-0" : "h-4 w-4 shrink-0"} />
        <span
          className={`min-w-0 flex-1 truncate text-center font-semibold ${
            hero ? "text-[1.05rem] sm:text-xl" : "text-base"
          }`}
          style={{
            ...marqueeFont,
            color: "var(--landing-ink)",
          }}
          aria-live="polite"
        >
          {url}
        </span>
        <span
          aria-hidden
          className="hidden h-2 w-2 shrink-0 rounded-full sm:block"
          style={{ background: "var(--landing-rose-gold, #C9A27A)" }}
        />
      </div>
    </div>
  );
}
