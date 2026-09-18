import type { CSSProperties } from "react";

/**
 * Ink A cream / rose / gold marketing chrome.
 * Pixel B Marquee Domain composition. Never navy SaaS.
 */
export const paperThemeVars = {
  "--landing-ink": "#3A2A30",
  "--landing-muted": "#7A5A64",
  "--landing-paper": "#FBF6F2",
  "--landing-paper-2": "#F3E6DC",
  "--landing-blush": "#FFE8EF",
  "--landing-rose": "#B76E79",
  "--landing-rose-deep": "#8F4E58",
  "--landing-rose-gold": "#C9A27A",
  "--landing-gold": "#C4A574",
  "--landing-champagne": "#E8D5B5",
  "--landing-cta": "#B76E79",
  "--landing-cedar": "#8F4E58",
  "--landing-cedar-deep": "#6B3F48",
  "--landing-line": "#E8D9C8",
  "--landing-fg": "#3A2A30",
  "--landing-soft": "#7A5A64",
  "--landing-accent": "#B76E79",
  "--landing-surface": "#FFFCFA",
  background:
    "linear-gradient(180deg, #FFFCFA 0%, #FFE8EF 42%, #FBF6F2 100%)",
  color: "#3A2A30",
  fontFamily: "var(--font-source-sans), 'Source Sans 3', sans-serif",
} as CSSProperties;

export const displayFont: CSSProperties = {
  fontFamily: "var(--font-fraunces), 'Fraunces', Georgia, serif",
};

/** Billboard display for the marquee landing hero (FORGE: Playfair / Cormorant). */
export const heroDisplayFont: CSSProperties = {
  fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
};

export const bodyFont: CSSProperties = {
  fontFamily: "var(--font-source-sans), 'Source Sans 3', sans-serif",
};

export const marqueeFont: CSSProperties = {
  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', ui-sans-serif, sans-serif",
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "0.02em",
};

export const paperGrainStyle: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
  mixBlendMode: "multiply",
  opacity: 0.04,
};
