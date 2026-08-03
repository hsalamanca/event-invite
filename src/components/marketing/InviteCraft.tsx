"use client";

import { useEffect, useRef, useState } from "react";

type InviteCraftImage = {
  src: string;
  alt: string;
};

type InviteCraftProps = {
  captions: string[];
  images: InviteCraftImage[];
};

const INTERVAL_MS = 5000;

export default function InviteCraft({ captions, images }: InviteCraftProps) {
  const count = Math.min(captions.length, images.length);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion || paused || count < 2) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion, paused, count]);

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="relative w-full overflow-hidden rounded-md bg-[var(--landing-paper-2,#EDE6DC)]"
        style={{ aspectRatio: "16 / 10" }}
      >
        {images.slice(0, count).map((image, i) => {
          const active = i === index;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${image.src}-${i}`}
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className={[
                "absolute inset-0 h-full w-full object-cover",
                "transition-opacity duration-[900ms] ease-in-out",
                "motion-reduce:transition-none",
                active ? "opacity-100" : "opacity-0",
              ].join(" ")}
              aria-hidden={!active}
            />
          );
        })}
      </div>

      <div
        className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2"
        role="tablist"
        aria-label="Invite styles"
      >
        {captions.slice(0, count).map((caption, i) => {
          const active = i === index;
          return (
            <button
              key={`${caption}-${i}`}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setIndex(i)}
              className={[
                "bg-transparent p-0 text-left text-sm tracking-wide transition-colors",
                "underline-offset-[6px]",
                active
                  ? "text-[var(--landing-fg,#1A1714)] underline decoration-[var(--landing-accent,#6B5338)] decoration-1"
                  : "text-[var(--landing-soft,#5C564E)] no-underline hover:text-[var(--landing-fg,#1A1714)]/80",
              ].join(" ")}
            >
              {caption}
            </button>
          );
        })}
      </div>
    </div>
  );
}
