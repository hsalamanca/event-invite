import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { RsvpSubmission } from "./types";

const BLOB_PATH = "ownvite/rsvps.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "rsvps.json");

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function streamToString(
  stream: ReadableStream<Uint8Array>
): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

async function readFromBlob(): Promise<RsvpSubmission[] | null> {
  if (!hasBlobToken()) return null;
  try {
    const result = await get(BLOB_PATH, {
      access: "private",
      useCache: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return [];
    }
    const text = await streamToString(result.stream);
    if (!text.trim()) return [];
    const parsed = JSON.parse(text) as RsvpSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("RSVP blob read failed", err);
    return null;
  }
}

async function writeToBlob(rsvps: RsvpSubmission[]): Promise<void> {
  if (!hasBlobToken()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  await put(BLOB_PATH, JSON.stringify(rsvps, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

async function readFromLocal(): Promise<RsvpSubmission[]> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    const parsed = JSON.parse(raw) as RsvpSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw err;
  }
}

async function writeToLocal(rsvps: RsvpSubmission[]): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(rsvps, null, 2), "utf8");
}

async function readAll(): Promise<RsvpSubmission[]> {
  if (hasBlobToken()) {
    const fromBlob = await readFromBlob();
    if (fromBlob) return fromBlob;
  }
  // Local/dev fallback only (Vercel filesystem is read-only)
  if (process.env.VERCEL) return [];
  return readFromLocal();
}

async function writeAll(rsvps: RsvpSubmission[]): Promise<void> {
  if (hasBlobToken()) {
    await writeToBlob(rsvps);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error("RSVP storage is not configured for production");
  }
  await writeToLocal(rsvps);
}

function newToken() {
  return `tok_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function appendRsvp(
  submission: Omit<RsvpSubmission, "id" | "createdAt" | "editToken"> & {
    id?: string;
    createdAt?: string;
    editToken?: string;
  }
): Promise<RsvpSubmission> {
  const rsvps = await readAll();
  const now = new Date().toISOString();
  const record: RsvpSubmission = {
    id:
      submission.id ??
      `rsvp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    eventId: submission.eventId,
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    attendance: submission.attendance,
    guestCount: submission.guestCount,
    dietary: submission.dietary,
    note: submission.note,
    answers: submission.answers ?? {},
    mealChoice: submission.mealChoice,
    editToken: submission.editToken ?? newToken(),
    checkedIn: false,
    checkedInAt: null,
    createdAt: submission.createdAt ?? now,
    updatedAt: now,
  };
  rsvps.push(record);
  await writeAll(rsvps);
  return record;
}

export async function listRsvpsByEventId(
  eventId: string
): Promise<RsvpSubmission[]> {
  const rsvps = await readAll();
  return rsvps.filter((r) => r.eventId === eventId);
}

export async function getRsvpByToken(
  token: string
): Promise<RsvpSubmission | undefined> {
  const rsvps = await readAll();
  return rsvps.find((r) => r.editToken === token);
}

export async function updateRsvpByToken(
  token: string,
  partial: Partial<RsvpSubmission>
): Promise<RsvpSubmission | undefined> {
  const rsvps = await readAll();
  const idx = rsvps.findIndex((r) => r.editToken === token);
  if (idx < 0) return undefined;
  const next: RsvpSubmission = {
    ...rsvps[idx]!,
    ...partial,
    id: rsvps[idx]!.id,
    eventId: rsvps[idx]!.eventId,
    editToken: rsvps[idx]!.editToken,
    createdAt: rsvps[idx]!.createdAt,
    updatedAt: new Date().toISOString(),
  };
  rsvps[idx] = next;
  await writeAll(rsvps);
  return next;
}

export async function deleteRsvpById(
  rsvpId: string,
  eventId?: string,
): Promise<boolean> {
  const rsvps = await readAll();
  const before = rsvps.length;
  const next = rsvps.filter(
    (r) =>
      !(r.id === rsvpId && (eventId == null || r.eventId === eventId)),
  );
  if (next.length === before) return false;
  await writeAll(next);
  return true;
}

export async function setCheckedIn(
  rsvpId: string,
  checkedIn: boolean
): Promise<RsvpSubmission | undefined> {
  const rsvps = await readAll();
  const idx = rsvps.findIndex((r) => r.id === rsvpId);
  if (idx < 0) return undefined;
  rsvps[idx] = {
    ...rsvps[idx]!,
    checkedIn,
    checkedInAt: checkedIn ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };
  await writeAll(rsvps);
  return rsvps[idx];
}
