import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { GuestMessage, ManualGuest } from "./types";

const MESSAGES_PATH = "ownvite/guest-messages.json";
const GUESTS_PATH = "ownvite/manual-guests.json";

type MessageRegistry = { version: 1; messages: GuestMessage[] };
type GuestRegistry = { version: 1; guests: ManualGuest[] };

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
  status: ManualGuest["status"]
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
