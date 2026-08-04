/** Guest-facing photo gallery shapes + host limits. */

export const GALLERY_MAX = 8;

export const GALLERY_LAYOUTS = [
  "square",
  "rectangle",
  "circle",
  "heart",
  "diamond",
  "hex",
  "scatter",
] as const;

export type GalleryLayout = (typeof GALLERY_LAYOUTS)[number];

export function isGalleryLayout(value: unknown): value is GalleryLayout {
  return (
    typeof value === "string" &&
    (GALLERY_LAYOUTS as readonly string[]).includes(value)
  );
}

export function normalizeGallery(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .slice(0, GALLERY_MAX);
}

export function normalizeGalleryLayout(value: unknown): GalleryLayout {
  return isGalleryLayout(value) ? value : "square";
}

export function galleryLayoutLabel(layout: GalleryLayout): string {
  switch (layout) {
    case "square":
      return "Square";
    case "rectangle":
      return "Rectangle";
    case "circle":
      return "Circle";
    case "heart":
      return "Heart";
    case "diamond":
      return "Diamond";
    case "hex":
      return "Hexagon";
    case "scatter":
      return "Scatter";
    default:
      return layout;
  }
}
