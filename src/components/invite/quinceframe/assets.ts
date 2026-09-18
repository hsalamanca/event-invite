/**
 * Guest paths prefer WebP; PNG remains the Ink fallback so re-exports swap in place.
 * No gold geometric frame — Hugo/Pixel: florals + tiara + gown, open composition.
 */
export type QuinceGuestAsset = {
  webp: string;
  png: string;
};

export const QUINCE_TIARA_ASSETS = {
  floralTl: {
    webp: "/templates/quince-tiara/floral-corner-tl.webp",
    png: "/templates/quince-tiara/floral-corner-tl.png",
  },
  floralBr: {
    webp: "/templates/quince-tiara/floral-corner-br.webp",
    png: "/templates/quince-tiara/floral-corner-br.png",
  },
  floralTr: {
    webp: "/templates/quince-tiara/floral-corner-tr.webp",
    png: "/templates/quince-tiara/floral-corner-tr.png",
  },
  floralBl: {
    webp: "/templates/quince-tiara/floral-corner-bl.webp",
    png: "/templates/quince-tiara/floral-corner-bl.png",
  },
  tiara: {
    webp: "/templates/quince-tiara/tiara-pink-glitter.webp",
    png: "/templates/quince-tiara/tiara-pink-glitter.png",
  },
  gown: {
    webp: "/templates/quince-tiara/gown-back-pink.webp",
    png: "/templates/quince-tiara/gown-back-pink.png",
  },
  hero: "/templates/quince-tiara-hero.svg",
} as const satisfies {
  floralTl: QuinceGuestAsset;
  floralBr: QuinceGuestAsset;
  floralTr: QuinceGuestAsset;
  floralBl: QuinceGuestAsset;
  tiara: QuinceGuestAsset;
  gown: QuinceGuestAsset;
  hero: string;
};
