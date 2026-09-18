import { getQuincePrincesaPreviewEvent } from "@/lib/quince-princesa-preview";
import { getQuinceTiaraPreviewEvent } from "@/lib/quince-tiara-preview";
import { buildEventFromTemplate, TEMPLATES } from "@/lib/templates";
import type { EventRecord } from "@/lib/types";

/** Canonical public picker — aliases redirect here. */
export const GALLERY_CANONICAL_PATH = "/marketplace";

export const GALLERY_ALIAS_PATHS = [
  "/templates",
  "/gallery",
  "/themes",
] as const;

/** Live birthday EDM — secondary “other occasions” sample, not the Peek CTA. */
export const GALLERY_BIRTHDAY_SAMPLE_PATH = "/e/h-birthday-2026";

export const PEEK_DEMO_PATH = "/preview/quince-princesa";

/**
 * Curated public picker (6–12). Quince craft leads; remaining ids already
 * exist in the catalog. Keep this list short so the cream grid stays browsable.
 */
export const GALLERY_TEMPLATE_IDS = [
  "quince-princesa",
  "quince-tiara",
  "quince-rosa",
  "quince-azul",
  "champagne-wedding",
  "watercolor-rose",
  "latin-fiesta",
  "golden-fifty",
  "gold-confetti",
  "blush-collage",
] as const;

export type GalleryTemplateId = (typeof GALLERY_TEMPLATE_IDS)[number];

export function isGalleryTemplateId(id: string): id is GalleryTemplateId {
  return (GALLERY_TEMPLATE_IDS as readonly string[]).includes(id);
}

export function galleryTemplates() {
  return GALLERY_TEMPLATE_IDS.map(
    (id) => TEMPLATES.find((tpl) => tpl.id === id)!,
  ).filter(Boolean);
}

export function templatePreviewPath(templateId: string): string {
  return `/preview/${encodeURIComponent(templateId)}`;
}

export function templateUsePath(templateId: string): string {
  return `/events/new?template=${encodeURIComponent(templateId)}`;
}

/** Logged-out “Use this” goes through register, then back to create. */
export function templateRegisterPath(templateId: string): string {
  return `/register?callbackUrl=${encodeURIComponent(templateUsePath(templateId))}`;
}

export function getCatalogPreviewEvent(
  templateId: string,
): EventRecord | null {
  const tpl = TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return null;
  if (templateId === "quince-princesa") return getQuincePrincesaPreviewEvent();
  if (templateId === "quince-tiara") return getQuinceTiaraPreviewEvent();

  const now = new Date().toISOString();
  const base = buildEventFromTemplate({
    templateId,
    ownerId: "preview",
    hostName: "Ownvite",
    title: tpl.name,
    slug: `preview-${tpl.id}`,
    dateISO: "2027-06-12",
    timeLabel: "7:00 PM",
    venue: "Salón de eventos",
    address: "Houston, TX",
    about: tpl.description,
    locale: "es",
  });

  return {
    ...base,
    id: `preview-${tpl.id}`,
    ownerId: null,
    createdAt: now,
    updatedAt: now,
  };
}
