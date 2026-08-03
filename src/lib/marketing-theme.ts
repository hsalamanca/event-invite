import type { CSSProperties } from "react";

/** Quiet-luxury marketing / app chrome (matches landing). */
export const paperThemeVars = {
  "--landing-ink": "#1A1714",
  "--landing-muted": "#5C564E",
  "--landing-paper": "#F7F3EE",
  "--landing-paper-2": "#EDE6DC",
  "--landing-cedar": "#6B5338",
  "--landing-cedar-deep": "#534028",
  "--landing-line": "#D9D0C4",
  "--landing-fg": "#1A1714",
  "--landing-soft": "#5C564E",
  "--landing-accent": "#6B5338",
  "--landing-surface": "#FFFFFF",
  background:
    "linear-gradient(180deg, #F7F3EE 0%, #EDE6DC 48%, #F7F3EE 100%)",
  color: "#1A1714",
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
} as CSSProperties;

export const displayFont: CSSProperties = {
  fontFamily: "var(--font-fraunces), 'Fraunces', Georgia, serif",
};

export const bodyFont: CSSProperties = {
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
};

export const paperGrainStyle: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
  mixBlendMode: "multiply",
  opacity: 0.04,
};
