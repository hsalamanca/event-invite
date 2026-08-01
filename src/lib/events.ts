import birthdayDemo from "../../data/birthday-demo.json";
import type { EventRecord } from "./types";

const eventsBySlug = new Map<string, EventRecord>();
const domainIndex = new Map<string, string>();

function indexDomain(customDomain: string | null | undefined, slug: string) {
  if (!customDomain) return;
  domainIndex.set(customDomain.toLowerCase(), slug);
}

function unindexDomain(customDomain: string | null | undefined) {
  if (!customDomain) return;
  domainIndex.delete(customDomain.toLowerCase());
}

function seed() {
  if (eventsBySlug.size > 0) return;

  const seedEvent: EventRecord = {
    ...(birthdayDemo as EventRecord),
    published: birthdayDemo.published ?? true,
    customDomain: birthdayDemo.customDomain ?? null,
  };

  eventsBySlug.set(seedEvent.slug, seedEvent);
  indexDomain(seedEvent.customDomain, seedEvent.slug);
}

seed();

export function getEventBySlug(slug: string): EventRecord | undefined {
  return eventsBySlug.get(slug);
}

export function getEventByDomain(domain: string): EventRecord | undefined {
  const slug = domainIndex.get(domain.toLowerCase());
  if (!slug) return undefined;
  return eventsBySlug.get(slug);
}

/** Platform hosts that serve the marketing site + path-based invites. */
const PLATFORM_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "ownvite.com",
  "www.ownvite.com",
  "ownvite.app",
  "www.ownvite.app",
]);

/**
 * Resolve an event from the request Host header.
 * Supports: `{slug}.ownvite.app`, BYO custom domains, and skips platform hosts.
 */
export function resolveEventFromHost(host: string): EventRecord | undefined {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname || PLATFORM_HOSTS.has(hostname)) return undefined;

  const byDomain = getEventByDomain(hostname);
  if (byDomain?.published) return byDomain;

  const platformSuffixes = [".ownvite.app", ".ownvite.com", ".localhost"];
  for (const suffix of platformSuffixes) {
    if (hostname.endsWith(suffix)) {
      const slug = hostname.slice(0, -suffix.length);
      if (!slug || slug.includes(".")) continue;
      const event = getEventBySlug(slug);
      if (event?.published) return event;
    }
  }

  return undefined;
}

export function listEvents(): EventRecord[] {
  return Array.from(eventsBySlug.values());
}

export function updateEvent(
  slug: string,
  partial: Partial<EventRecord>
): EventRecord | undefined {
  const existing = eventsBySlug.get(slug);
  if (!existing) return undefined;

  if (
    partial.customDomain !== undefined &&
    partial.customDomain !== existing.customDomain
  ) {
    unindexDomain(existing.customDomain);
    indexDomain(partial.customDomain, slug);
  }

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
  };

  if (nextSlug !== slug) {
    eventsBySlug.delete(slug);
    if (updated.customDomain) {
      unindexDomain(existing.customDomain);
      indexDomain(updated.customDomain, nextSlug);
    }
  }

  eventsBySlug.set(updated.slug, updated);
  return updated;
}

export function createEvent(
  input: Omit<EventRecord, "id" | "published"> & {
    id?: string;
    published?: boolean;
  }
): EventRecord {
  const slug = input.slug;
  if (eventsBySlug.has(slug)) {
    throw new Error(`Event with slug "${slug}" already exists`);
  }

  const event: EventRecord = {
    ...input,
    id: input.id ?? `evt_${Date.now().toString(36)}`,
    published: input.published ?? false,
    customDomain: input.customDomain ?? null,
  };

  eventsBySlug.set(event.slug, event);
  indexDomain(event.customDomain, event.slug);
  return event;
}
