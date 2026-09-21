import birthdayDemo from "../../data/birthday-demo.json";
import { readJsonBlobIfPresent, writeJsonBlob } from "./blob-json";
import {
  normalizeGallery,
  normalizeGalleryLayout,
} from "./gallery";
import {
  normalizePartyRoles,
  normalizeVenueBlock,
} from "./quince-fields";
import { remapBrokenHeroImage } from "./templates";
import { commitWithRetry } from "./json-commit";
import { safeHttpsUrl } from "./safe-https-url";
import type { EventRecord } from "./types";

const PATH = "ownvite/events.json";

type EventRegistry = { version: 1; events: EventRecord[] };

function seedEvent(): EventRecord {
  const demo = birthdayDemo as EventRecord & { published?: boolean };
  const now = new Date().toISOString();
  return {
    id: demo.id,
    slug: demo.slug,
    // Seed demos stay ownerless and read-only for guests; canManageEvent denies
    // management unless the caller is a platform admin.
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
    registryUrl: safeHttpsUrl(raw.registryUrl) ?? null,
    registryLabel: raw.registryLabel ?? null,
    templateId: raw.templateId ?? "evening",
    heroImage: remapBrokenHeroImage(raw.heroImage),
    honoreePhotoUrl: raw.honoreePhotoUrl ?? "",
    parentsLine: typeof raw.parentsLine === "string" ? raw.parentsLine : "",
    misa: normalizeVenueBlock(raw.misa),
    recepcion: normalizeVenueBlock(raw.recepcion),
    corte: normalizePartyRoles(raw.corte),
    gifts: typeof raw.gifts === "string" ? raw.gifts : "",
    whatsappPhone:
      typeof raw.whatsappPhone === "string" ? raw.whatsappPhone : "",
    heroVideoUrl:
      typeof raw.heroVideoUrl === "string" && raw.heroVideoUrl.trim()
        ? raw.heroVideoUrl.trim()
        : null,
    motionKit: (["none", "sparkle", "float", "parallax", "pulse"] as const).includes(
      raw.motionKit as "none",
    )
      ? (raw.motionKit as EventRecord["motionKit"])
      : "none",
    balloonDigits: (() => {
      const digits = String(raw.balloonDigits ?? "")
        .replace(/\D/g, "")
        .slice(0, 2);
      return digits || null;
    })(),
    rsvpFields: {
      ...raw.rsvpFields,
      customQuestions: raw.rsvpFields?.customQuestions ?? [],
    },
    schedule: raw.schedule ?? [],
    faqs: raw.faqs ?? [],
    padrinos: normalizePartyRoles(raw.padrinos),
    gallery: normalizeGallery(raw.gallery),
    galleryLayout: normalizeGalleryLayout(raw.galleryLayout),
    parking: raw.parking ?? "",
    dressCode: raw.dressCode ?? "",
    whatToBring: raw.whatToBring ?? "",
    contactEmail: raw.contactEmail ?? "",
    contactPhone: raw.contactPhone ?? "",
    contactName: raw.contactName ?? "",
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
    unlockedTemplateIds: Array.isArray(raw.unlockedTemplateIds)
      ? raw.unlockedTemplateIds.filter((id): id is string => typeof id === "string")
      : [],
    emailCredits:
      typeof raw.emailCredits === "number" && Number.isFinite(raw.emailCredits)
        ? Math.max(0, Math.floor(raw.emailCredits))
        : 0,
    smsCredits:
      typeof raw.smsCredits === "number" && Number.isFinite(raw.smsCredits)
        ? Math.max(0, Math.floor(raw.smsCredits))
        : 0,
    seatingTables: Array.isArray(raw.seatingTables) ? raw.seatingTables : [],
    albumEnabled: raw.albumEnabled ?? false,
    rsvpEnabled: raw.rsvpEnabled !== false,
    cashFundUrl: safeHttpsUrl(raw.cashFundUrl) ?? "",
    cashFundLabel: raw.cashFundLabel ?? "",
    cashFundGoal:
      typeof raw.cashFundGoal === "number" && Number.isFinite(raw.cashFundGoal)
        ? Math.max(0, raw.cashFundGoal)
        : null,
    cashFundRaised:
      typeof raw.cashFundRaised === "number" && Number.isFinite(raw.cashFundRaised)
        ? Math.max(0, raw.cashFundRaised)
        : null,
    registryClicks:
      typeof raw.registryClicks === "number" ? raw.registryClicks : 0,
    cashFundClicks:
      typeof raw.cashFundClicks === "number" ? raw.cashFundClicks : 0,
    printAffiliateEnabled: raw.printAffiliateEnabled ?? true,
    guestSeatingEnabled: raw.guestSeatingEnabled ?? false,
    rsvpConsentRequired: raw.rsvpConsentRequired ?? false,
    lastEditedBy: raw.lastEditedBy ?? null,
    lastEditedAt: raw.lastEditedAt ?? null,
    whiteLabel: raw.whiteLabel ?? false,
    clientId:
      typeof raw.clientId === "string" && raw.clientId.trim()
        ? raw.clientId.trim()
        : null,
    unlockedPackIds: Array.isArray(raw.unlockedPackIds)
      ? raw.unlockedPackIds.filter((id): id is string => typeof id === "string")
      : [],
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  };
}

async function load(): Promise<EventRegistry> {
  const registry = await readJsonBlobIfPresent<EventRegistry>(PATH);
  if (!registry) {
    const seeded: EventRegistry = { version: 1, events: [seedEvent()] };
    try {
      await writeJsonBlob(PATH, seeded);
    } catch {
      /* local without blob — do not swallow blob 5xx; writeJsonBlob throws those */
    }
    return seeded;
  }
  if (!Array.isArray(registry.events) || registry.events.length === 0) {
    return { version: 1, events: [seedEvent()] };
  }
  return {
    version: 1,
    events: registry.events.map((e) => normalizeEvent(e)),
  };
}

async function save(registry: EventRegistry) {
  await writeJsonBlob(PATH, registry);
}

async function readEvents(): Promise<EventRecord[]> {
  return (await load()).events;
}

async function commitEvents(
  mutate: (events: EventRecord[]) => EventRecord[],
  persisted: (events: EventRecord[]) => boolean,
): Promise<EventRecord[]> {
  return commitWithRetry({
    read: readEvents,
    write: async (events) => {
      await save({ version: 1, events });
    },
    mutate,
    persisted,
  });
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
  if ((await readEvents()).some((existing) => existing.slug === input.slug)) {
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
  try {
    await commitEvents(
      (events) =>
        events.some((existing) => existing.slug === event.slug)
          ? events
          : [...events, event],
      (events) => events.some((existing) => existing.id === event.id),
    );
  } catch (err) {
    const taken = (await readEvents()).find(
      (existing) => existing.slug === event.slug && existing.id !== event.id,
    );
    if (taken) {
      throw new Error(`Event with slug "${input.slug}" already exists`);
    }
    throw err;
  }
  const saved = (await readEvents()).find((existing) => existing.id === event.id);
  if (!saved) {
    throw new Error(`Event with slug "${input.slug}" already exists`);
  }
  return saved;
}

function mergeEventUpdate(
  existing: EventRecord,
  partial: Partial<EventRecord>,
  updatedAt: string,
): EventRecord {
  const nextSlug = partial.slug ?? existing.slug;
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
    updatedAt,
  };
  if (partial.gallery !== undefined) {
    updated.gallery = normalizeGallery(partial.gallery);
  }
  if (partial.galleryLayout !== undefined) {
    updated.galleryLayout = normalizeGalleryLayout(partial.galleryLayout);
  }
  return updated;
}

export async function updateEvent(
  slug: string,
  partial: Partial<EventRecord>
): Promise<EventRecord | undefined> {
  const current = await getEventBySlug(slug);
  if (!current) return undefined;
  const nextSlug = partial.slug ?? current.slug;
  if (
    nextSlug !== slug &&
    (await readEvents()).some((event) => event.slug === nextSlug)
  ) {
    throw new Error(`Slug "${nextSlug}" is already taken`);
  }
  const updatedAt = new Date().toISOString();
  try {
    await commitEvents(
      (events) => {
        const idx = events.findIndex((event) => event.id === current.id);
        if (idx < 0) return events;
        const existing = events[idx]!;
        const mergedSlug = partial.slug ?? existing.slug;
        if (
          mergedSlug !== existing.slug &&
          events.some((event) => event.slug === mergedSlug && event.id !== existing.id)
        ) {
          return events;
        }
        const copy = events.slice();
        copy[idx] = mergeEventUpdate(existing, partial, updatedAt);
        return copy;
      },
      (events) =>
        events.some(
          (event) => event.id === current.id && event.updatedAt === updatedAt,
        ),
    );
  } catch (err) {
    const latest = (await readEvents()).find((event) => event.id === current.id);
    if (!latest) return undefined;
    if (
      partial.slug &&
      partial.slug !== latest.slug &&
      (await readEvents()).some((event) => event.slug === partial.slug)
    ) {
      throw new Error(`Slug "${partial.slug}" is already taken`);
    }
    throw err;
  }
  return (await readEvents()).find((event) => event.id === current.id);
}

export async function deleteEvent(slug: string, ownerId: string): Promise<boolean> {
  const events = await readEvents();
  const target = events.find(
    (event) => event.slug === slug && event.ownerId === ownerId,
  );
  if (!target) return false;
  await commitEvents(
    (current) => current.filter((event) => event.id !== target.id),
    (current) => !current.some((event) => event.id === target.id),
  );
  return true;
}

/** Admin / support: delete any event regardless of owner. */
export async function adminDeleteEvent(slug: string): Promise<boolean> {
  const events = await readEvents();
  const target = events.find((event) => event.slug === slug);
  if (!target) return false;
  await commitEvents(
    (current) => current.filter((event) => event.id !== target.id),
    (current) => !current.some((event) => event.id === target.id),
  );
  return true;
}

/** Sync helpers for gradual migration — prefer async APIs above. */
export {
  getEventBySlug as getEventBySlugAsync,
  listAllEvents as listEvents,
};
