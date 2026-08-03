import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { GuestMessage, ManualGuest, WaitlistEntry } from "./types";

const MESSAGES_PATH = "ownvite/guest-messages.json";
const GUESTS_PATH = "ownvite/manual-guests.json";
const WAITLIST_PATH = "ownvite/waitlist.json";

type MessageRegistry = { version: 1; messages: GuestMessage[] };
type GuestRegistry = { version: 1; guests: ManualGuest[] };
type WaitlistRegistry = { version: 1; entries: WaitlistEntry[] };

export async function listMessages(eventId: string): Promise<GuestMessage[]> {
  const reg = await readJsonBlob<MessageRegistry>(MESSAGES_PATH, {
    version: 1,
    messages: [],
  });
  return reg.messages
    .filter((m) => m.eventId === eventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addMessage(input: {
  eventId: string;
  name: string;
  body: string;
}): Promise<GuestMessage> {
  const reg = await readJsonBlob<MessageRegistry>(MESSAGES_PATH, {
    version: 1,
    messages: [],
  });
  const message: GuestMessage = {
    id: `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    eventId: input.eventId,
    name: input.name.trim(),
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
  };
  reg.messages.push(message);
  await writeJsonBlob(MESSAGES_PATH, reg);
  return message;
}

export async function deleteMessage(
  eventId: string,
  messageId: string,
): Promise<boolean> {
  const reg = await readJsonBlob<MessageRegistry>(MESSAGES_PATH, {
    version: 1,
    messages: [],
  });
  const before = reg.messages.length;
  reg.messages = reg.messages.filter(
    (m) => !(m.eventId === eventId && m.id === messageId),
  );
  if (reg.messages.length === before) return false;
  await writeJsonBlob(MESSAGES_PATH, reg);
  return true;
}

export async function listManualGuests(eventId: string): Promise<ManualGuest[]> {
  const reg = await readJsonBlob<GuestRegistry>(GUESTS_PATH, {
    version: 1,
    guests: [],
  });
  return reg.guests.filter((g) => g.eventId === eventId);
}

export async function addManualGuest(input: {
  eventId: string;
  name: string;
  email: string;
}): Promise<ManualGuest> {
  const reg = await readJsonBlob<GuestRegistry>(GUESTS_PATH, {
    version: 1,
    guests: [],
  });
  const guest: ManualGuest = {
    id: `gst_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    eventId: input.eventId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    status: "invited",
    createdAt: new Date().toISOString(),
  };
  reg.guests.push(guest);
  await writeJsonBlob(GUESTS_PATH, reg);
  return guest;
}

export async function updateManualGuestStatus(
  guestId: string,
  status: ManualGuest["status"],
): Promise<ManualGuest | undefined> {
  const reg = await readJsonBlob<GuestRegistry>(GUESTS_PATH, {
    version: 1,
    guests: [],
  });
  const idx = reg.guests.findIndex((g) => g.id === guestId);
  if (idx < 0) return undefined;
  reg.guests[idx] = { ...reg.guests[idx]!, status };
  await writeJsonBlob(GUESTS_PATH, reg);
  return reg.guests[idx];
}

export async function listWaitlist(eventId: string): Promise<WaitlistEntry[]> {
  const reg = await readJsonBlob<WaitlistRegistry>(WAITLIST_PATH, {
    version: 1,
    entries: [],
  });
  return reg.entries
    .filter((e) => e.eventId === eventId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function addWaitlistEntry(input: {
  eventId: string;
  name: string;
  email: string;
  guestCount?: number;
  note?: string;
}): Promise<WaitlistEntry> {
  const reg = await readJsonBlob<WaitlistRegistry>(WAITLIST_PATH, {
    version: 1,
    entries: [],
  });
  const email = input.email.trim().toLowerCase();
  const existing = reg.entries.findIndex(
    (e) => e.eventId === input.eventId && e.email === email,
  );
  if (existing >= 0) {
    const updated: WaitlistEntry = {
      ...reg.entries[existing]!,
      name: input.name.trim(),
      guestCount: Math.max(1, input.guestCount ?? 1),
      note: (input.note ?? "").trim(),
    };
    reg.entries[existing] = updated;
    await writeJsonBlob(WAITLIST_PATH, reg);
    return updated;
  }
  const entry: WaitlistEntry = {
    id: `wl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    eventId: input.eventId,
    name: input.name.trim(),
    email,
    guestCount: Math.max(1, input.guestCount ?? 1),
    note: (input.note ?? "").trim(),
    createdAt: new Date().toISOString(),
  };
  reg.entries.push(entry);
  await writeJsonBlob(WAITLIST_PATH, reg);
  return entry;
}

export async function deleteWaitlistEntry(
  eventId: string,
  entryId: string,
): Promise<boolean> {
  const reg = await readJsonBlob<WaitlistRegistry>(WAITLIST_PATH, {
    version: 1,
    entries: [],
  });
  const before = reg.entries.length;
  reg.entries = reg.entries.filter(
    (e) => !(e.eventId === eventId && e.id === entryId),
  );
  if (reg.entries.length === before) return false;
  await writeJsonBlob(WAITLIST_PATH, reg);
  return true;
}
