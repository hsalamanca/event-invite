import type { ReactNode } from "react";

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  /** Kept for call-site compatibility; CoS lock is one signature motion (marquee sheen). */
  delayMs?: number;
};

/** Wrapper only — no stacked fade/slide. Marquee sheen is the sole marketing motion. */
export default function LandingReveal({
  children,
  className = "",
}: LandingRevealProps) {
  return <div className={className || undefined}>{children}</div>;
}
