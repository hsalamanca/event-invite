import type { CSSProperties } from "react";

/** Warm blush / cream / rose-gold marketing chrome (quince craft, not navy SaaS). */
export const paperThemeVars = {
  "--landing-ink": "#1A1714",
  "--landing-muted": "#5C564E",
  "--landing-paper": "#FBF6F2",
  "--landing-paper-2": "#F3E6DC",
  "--landing-blush": "#F6E9EC",
  "--landing-rose": "#B76E79",
  "--landing-rose-deep": "#8F4E58",
  "--landing-rose-gold": "#C9A27A",
  "--landing-cta": "#B76E79",
  "--landing-cedar": "#6B5338",
  "--landing-cedar-deep": "#534028",
  "--landing-line": "#E4D5C8",
  "--landing-fg": "#1A1714",
  "--landing-soft": "#5C564E",
  "--landing-accent": "#B76E79",
  "--landing-surface": "#FFFCFA",
  background:
    "linear-gradient(180deg, #FBF6F2 0%, #F6E9EC 38%, #F7F3EE 100%)",
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
