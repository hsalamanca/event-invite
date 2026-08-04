import birthdayDemo from "../../data/birthday-demo.json";
import { readJsonBlob, writeJsonBlob } from "./blob-json";
import {
  normalizeGallery,
  normalizeGalleryLayout,
} from "./gallery";
import type { EventRecord } from "./types";

const PATH = "ownvite/events.json";

type EventRegistry = { version: 1; events: EventRecord[] };

function seedEvent(): EventRecord {
  const demo = birthdayDemo as EventRecord & { published?: boolean };
  const now = new Date().toISOString();
  return {
    id: demo.id,
    slug: demo.slug,
    ownerId: null,
    hostName: demo.hostName,
    title: demo.title,
    headline: demo.headline,
    tagline: demo.tagline,
    dateISO: demo.dateISO,
    timeLabel: demo.timeLabel,
    venue: demo.venue,
    address: demo.address,
    theme: demo.theme,
    heroImage: demo.heroImage,
    customDomain: demo.customDomain ?? null,
    rsvpFields: demo.rsvpFields,
    about: demo.about,
    published: demo.published ?? true,
    visibility: "public",
    capacity: null,
    registryUrl: null,
    templateId: "evening",
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeEvent(raw: EventRecord): EventRecord {
  const now = new Date().toISOString();
  return {
    ...raw,
    ownerId: raw.ownerId ?? null,
    customDomain: raw.customDomain ?? null,
    published: raw.published ?? true,
    visibility: raw.visibility ?? "public",
    capacity: raw.capacity ?? null,
    registryUrl: raw.registryUrl ?? null,
    registryLabel: raw.registryLabel ?? null,
    templateId: raw.templateId ?? "evening",
    rsvpFields: {
      ...raw.rsvpFields,
      customQuestions: raw.rsvpFields?.customQuestions ?? [],
    },
    schedule: raw.schedule ?? [],
    faqs: raw.faqs ?? [],
    gallery: normalizeGallery(raw.gallery),
    galleryLayout: normalizeGalleryLayout(raw.galleryLayout),
    parking: raw.parking ?? "",
    dressCode: raw.dressCode ?? "",
    whatToBring: raw.whatToBring ?? "",
    contactEmail: raw.contactEmail ?? "",
    contactPhone: raw.contactPhone ?? "",
    hotelInfo: raw.hotelInfo ?? "",
    travelInfo: raw.travelInfo ?? "",
    spotifyUrl: raw.spotifyUrl ?? "",
    thankYouMessage: raw.thankYouMessage ?? "",
    invitePasswordHash: raw.invitePasswordHash ?? null,
    coHostEmails: (raw.coHostEmails ?? []).map((e) => e.toLowerCase()),
    checkInEnabled: raw.checkInEnabled ?? false,
    showOwnviteFooter: raw.showOwnviteFooter ?? true,
    tier: raw.tier ?? "free",
    premiumTheme: raw.premiumTheme ?? false,
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  };
}

async function load(): Promise<EventRegistry> {
  const registry = await readJsonBlob<EventRegistry>(PATH, {
    version: 1,
    events: [],
  });
  if (registry.events.length === 0) {
    registry.events = [seedEvent()];
    try {
      await writeJsonBlob(PATH, registry);
    } catch {
      /* local without blob */
    }
  } else {
    registry.events = registry.events.map((e) => normalizeEvent(e));
  }
  return registry;
}

async function save(registry: EventRegistry) {
  await writeJsonBlob(PATH, registry);
}

export async function listAllEvents(): Promise<EventRecord[]> {
  return (await load()).events;
}

export async function getEventBySlug(
  slug: string
): Promise<EventRecord | undefined> {
  const registry = await load();
  return registry.events.find((e) => e.slug === slug);
}

export async function getEventById(
  id: string
): Promise<EventRecord | undefined> {
  const registry = await load();
  return registry.events.find((e) => e.id === id);
}

export async function listEventsByOwner(
  ownerId: string
): Promise<EventRecord[]> {
  const registry = await load();
  return registry.events
    .filter((e) => e.ownerId === ownerId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Events where the user email is listed as co-host (not owner). */
export async function listEventsByCoHostEmail(
  email: string
): Promise<EventRecord[]> {
  const key = email.trim().toLowerCase();
  if (!key) return [];
  const registry = await load();
  return registry.events
    .filter(
      (e) =>
        (e.coHostEmails ?? []).map((x) => x.toLowerCase()).includes(key) &&
        e.ownerId !== null,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getEventByDomain(
  domain: string
): Promise<EventRecord | undefined> {
  const key = domain.toLowerCase();
  const registry = await load();
  return registry.events.find(
    (e) => e.customDomain?.toLowerCase() === key && e.published
  );
}

export async function createEvent(
  input: Omit<EventRecord, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  }
): Promise<EventRecord> {
  const registry = await load();
  if (registry.events.some((e) => e.slug === input.slug)) {
    throw new Error(`Event with slug "${input.slug}" already exists`);
  }
  const now = new Date().toISOString();
  const event: EventRecord = {
    ...input,
    id: input.id ?? `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    customDomain: input.customDomain ?? null,
    ownerId: input.ownerId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  registry.events.push(event);
  await save(registry);
  return event;
}

export async function updateEvent(
  slug: string,
  partial: Partial<EventRecord>
): Promise<EventRecord | undefined> {
  const registry = await load();
  const idx = registry.events.findIndex((e) => e.slug === slug);
  if (idx < 0) return undefined;
  const existing = registry.events[idx]!;
  const nextSlug = partial.slug ?? existing.slug;
  if (
    nextSlug !== slug &&
    registry.events.some((e) => e.slug === nextSlug)
  ) {
    throw new Error(`Slug "${nextSlug}" is already taken`);
  }
  const updated: EventRecord = {
    ...existing,
    ...partial,
    slug: nextSlug,
    theme: partial.theme
      ? {
          colors: { ...existing.theme.colors, ...partial.theme.colors },
          fonts: { ...existing.theme.fonts, ...partial.theme.fonts },
        }
      : existing.theme,
    rsvpFields: partial.rsvpFields
      ? { ...existing.rsvpFields, ...partial.rsvpFields }
      : existing.rsvpFields,
    updatedAt: new Date().toISOString(),
  };
  if (partial.gallery !== undefined) {
    updated.gallery = normalizeGallery(partial.gallery);
  }
  if (partial.galleryLayout !== undefined) {
    updated.galleryLayout = normalizeGalleryLayout(partial.galleryLayout);
  }
  registry.events[idx] = updated;
  await save(registry);
  return updated;
}

export async function deleteEvent(slug: string, ownerId: string): Promise<boolean> {
  const registry = await load();
  const before = registry.events.length;
  registry.events = registry.events.filter(
    (e) => !(e.slug === slug && e.ownerId === ownerId)
  );
  if (registry.events.length === before) return false;
  await save(registry);
  return true;
}

/** Admin / support: delete any event regardless of owner. */
export async function adminDeleteEvent(slug: string): Promise<boolean> {
  const registry = await load();
  const before = registry.events.length;
  registry.events = registry.events.filter((e) => e.slug !== slug);
  if (registry.events.length === before) return false;
  await save(registry);
  return true;
}

/** Sync helpers for gradual migration — prefer async APIs above. */
export {
  getEventBySlug as getEventBySlugAsync,
  listAllEvents as listEvents,
};
