import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { GiftPledge, ThankYouItem } from "./types";

const PLEDGES_PATH = "ownvite/gift-pledges.json";
const THANKS_PATH = "ownvite/thank-you.json";

type PledgeReg = { version: 1; pledges: GiftPledge[] };
type ThanksReg = { version: 1; items: ThankYouItem[] };

export async function listPledges(eventId: string): Promise<GiftPledge[]> {
  const reg = await readJsonBlob<PledgeReg>(PLEDGES_PATH, {
    version: 1,
    pledges: [],
  });
  return reg.pledges
    .filter((p) => p.eventId === eventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addPledge(input: {
  eventId: string;
  name: string;
  email: string;
  kind: "registry" | "cash";
  amount?: number;
  note?: string;
}): Promise<GiftPledge> {
  const reg = await readJsonBlob<PledgeReg>(PLEDGES_PATH, {
    version: 1,
    pledges: [],
  });
  const pledge: GiftPledge = {
    id: `gpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    eventId: input.eventId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    kind: input.kind,
    amount:
      typeof input.amount === "number" && Number.isFinite(input.amount)
        ? Math.max(0, input.amount)
        : undefined,
    note: (input.note ?? "").trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  };
  reg.pledges.push(pledge);
  await writeJsonBlob(PLEDGES_PATH, reg);
  return pledge;
}

export async function sumCashPledges(eventId: string): Promise<number> {
  const pledges = await listPledges(eventId);
  return pledges
    .filter((p) => p.kind === "cash" && typeof p.amount === "number")
    .reduce((n, p) => n + (p.amount ?? 0), 0);
}

export async function listThankYous(eventId: string): Promise<ThankYouItem[]> {
  const reg = await readJsonBlob<ThanksReg>(THANKS_PATH, {
    version: 1,
    items: [],
  });
  return reg.items
    .filter((i) => i.eventId === eventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addThankYou(input: {
  eventId: string;
  guestName: string;
  email: string;
  note?: string;
}): Promise<ThankYouItem> {
  const reg = await readJsonBlob<ThanksReg>(THANKS_PATH, {
    version: 1,
    items: [],
  });
  const item: ThankYouItem = {
    id: `ty_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    eventId: input.eventId,
    guestName: input.guestName.trim(),
    email: input.email.trim().toLowerCase(),
    note: (input.note ?? "").trim().slice(0, 500),
    status: "todo",
    createdAt: new Date().toISOString(),
    sentAt: null,
  };
  reg.items.push(item);
  await writeJsonBlob(THANKS_PATH, reg);
  return item;
}

export async function markThankYouSent(
  eventId: string,
  itemId: string,
): Promise<ThankYouItem | undefined> {
  const reg = await readJsonBlob<ThanksReg>(THANKS_PATH, {
    version: 1,
    items: [],
  });
  const idx = reg.items.findIndex(
    (i) => i.eventId === eventId && i.id === itemId,
  );
  if (idx < 0) return undefined;
  reg.items[idx] = {
    ...reg.items[idx]!,
    status: "sent",
    sentAt: new Date().toISOString(),
  };
  await writeJsonBlob(THANKS_PATH, reg);
  return reg.items[idx];
}

export async function deleteThankYou(
  eventId: string,
  itemId: string,
): Promise<boolean> {
  const reg = await readJsonBlob<ThanksReg>(THANKS_PATH, {
    version: 1,
    items: [],
  });
  const before = reg.items.length;
  reg.items = reg.items.filter(
    (i) => !(i.eventId === eventId && i.id === itemId),
  );
  if (reg.items.length === before) return false;
  await writeJsonBlob(THANKS_PATH, reg);
  return true;
}
