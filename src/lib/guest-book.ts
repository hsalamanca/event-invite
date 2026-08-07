import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { GuestBookContact, GuestBookHistoryEntry } from "./types";

const PATH = "ownvite/guest-book.json";

type Registry = { version: 1; contacts: GuestBookContact[] };

async function load(): Promise<Registry> {
  const reg = await readJsonBlob<Registry>(PATH, { version: 1, contacts: [] });
  reg.contacts = (reg.contacts ?? []).map((c) => ({
    ...c,
    email: (c.email ?? "").toLowerCase(),
    history: Array.isArray(c.history) ? c.history : [],
    tags: Array.isArray(c.tags) ? c.tags : [],
  }));
  return reg;
}

async function save(reg: Registry) {
  await writeJsonBlob(PATH, reg);
}

function newId() {
  return `gb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function listGuestBook(
  ownerId: string,
): Promise<GuestBookContact[]> {
  const reg = await load();
  return reg.contacts
    .filter((c) => c.ownerId === ownerId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGuestBookContact(
  ownerId: string,
  contactId: string,
): Promise<GuestBookContact | undefined> {
  const reg = await load();
  return reg.contacts.find((c) => c.ownerId === ownerId && c.id === contactId);
}

export async function upsertGuestBookContact(input: {
  ownerId: string;
  name: string;
  email: string;
  phone?: string;
  dietary?: string;
  householdName?: string;
  notes?: string;
  tags?: string[];
  historyEntry?: GuestBookHistoryEntry;
}): Promise<GuestBookContact> {
  const reg = await load();
  const email = input.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const idx = reg.contacts.findIndex(
    (c) => c.ownerId === input.ownerId && c.email === email && email,
  );

  if (idx >= 0) {
    const current = reg.contacts[idx]!;
    let history = current.history;
    if (input.historyEntry) {
      const hIdx = history.findIndex(
        (h) => h.eventId === input.historyEntry!.eventId,
      );
      if (hIdx >= 0) {
        history = history.map((h, i) =>
          i === hIdx ? { ...h, ...input.historyEntry! } : h,
        );
      } else {
        history = [input.historyEntry, ...history].slice(0, 40);
      }
    }
    const updated: GuestBookContact = {
      ...current,
      name: input.name.trim() || current.name,
      phone: (input.phone ?? "").trim() || current.phone,
      dietary:
        input.dietary != null
          ? String(input.dietary).trim() || undefined
          : current.dietary,
      householdName:
        input.householdName != null
          ? String(input.householdName).trim() || undefined
          : current.householdName,
      notes:
        input.notes != null
          ? String(input.notes).trim() || undefined
          : current.notes,
      tags: input.tags ?? current.tags,
      history,
      updatedAt: now,
    };
    reg.contacts[idx] = updated;
    await save(reg);
    return updated;
  }

  const created: GuestBookContact = {
    id: newId(),
    ownerId: input.ownerId,
    name: input.name.trim() || email.split("@")[0] || "Guest",
    email,
    phone: (input.phone ?? "").trim() || undefined,
    dietary: (input.dietary ?? "").trim() || undefined,
    householdName: (input.householdName ?? "").trim() || undefined,
    notes: (input.notes ?? "").trim() || undefined,
    tags: input.tags ?? [],
    history: input.historyEntry ? [input.historyEntry] : [],
    createdAt: now,
    updatedAt: now,
  };
  reg.contacts.push(created);
  await save(reg);
  return created;
}

export async function updateGuestBookContact(
  ownerId: string,
  contactId: string,
  partial: Partial<
    Pick<
      GuestBookContact,
      "name" | "email" | "phone" | "dietary" | "householdName" | "notes" | "tags"
    >
  >,
): Promise<GuestBookContact | undefined> {
  const reg = await load();
  const idx = reg.contacts.findIndex(
    (c) => c.ownerId === ownerId && c.id === contactId,
  );
  if (idx < 0) return undefined;
  const current = reg.contacts[idx]!;
  reg.contacts[idx] = {
    ...current,
    name:
      partial.name != null
        ? String(partial.name).trim() || current.name
        : current.name,
    email:
      partial.email != null
        ? String(partial.email).trim().toLowerCase()
        : current.email,
    phone:
      partial.phone != null
        ? String(partial.phone).trim() || undefined
        : current.phone,
    dietary:
      partial.dietary != null
        ? String(partial.dietary).trim() || undefined
        : current.dietary,
    householdName:
      partial.householdName != null
        ? String(partial.householdName).trim() || undefined
        : current.householdName,
    notes:
      partial.notes != null
        ? String(partial.notes).trim() || undefined
        : current.notes,
    tags: partial.tags ?? current.tags,
    updatedAt: new Date().toISOString(),
  };
  await save(reg);
  return reg.contacts[idx];
}

export async function deleteGuestBookContact(
  ownerId: string,
  contactId: string,
): Promise<boolean> {
  const reg = await load();
  const before = reg.contacts.length;
  reg.contacts = reg.contacts.filter(
    (c) => !(c.ownerId === ownerId && c.id === contactId),
  );
  if (reg.contacts.length === before) return false;
  await save(reg);
  return true;
}

/** Merge RSVP / manual guest into the owner's reusable book. */
export async function recordGuestBookFromEvent(input: {
  ownerId: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  name: string;
  email: string;
  phone?: string;
  attendance?: string;
  dietary?: string;
  mealChoice?: string;
  guestCount?: number;
}): Promise<GuestBookContact | null> {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!email || !input.ownerId) return null;
  return upsertGuestBookContact({
    ownerId: input.ownerId,
    name: input.name,
    email,
    phone: input.phone,
    dietary: input.dietary,
    historyEntry: {
      eventId: input.eventId,
      eventTitle: input.eventTitle,
      eventSlug: input.eventSlug,
      attendance: input.attendance,
      dietary: input.dietary,
      mealChoice: input.mealChoice,
      guestCount: input.guestCount,
      at: new Date().toISOString(),
    },
  });
}
