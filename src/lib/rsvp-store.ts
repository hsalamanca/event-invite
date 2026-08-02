import { list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { RsvpSubmission } from "./types";

const BLOB_PATH = "ownvite/rsvps.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "rsvps.json");

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readFromBlob(): Promise<RsvpSubmission[] | null> {
  if (!hasBlobToken()) return null;
  try {
    const result = await list({
      prefix: BLOB_PATH,
      limit: 10,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const match = result.blobs.find((b) => b.pathname === BLOB_PATH);
    if (!match) return [];
    const res = await fetch(match.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const parsed = (await res.json()) as RsvpSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
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

export async function appendRsvp(
  submission: Omit<RsvpSubmission, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  }
): Promise<RsvpSubmission> {
  const rsvps = await readAll();
  const record: RsvpSubmission = {
    id:
      submission.id ??
      `rsvp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    eventId: submission.eventId,
    name: submission.name,
    email: submission.email,
    attendance: submission.attendance,
    guestCount: submission.guestCount,
    dietary: submission.dietary,
    note: submission.note,
    createdAt: submission.createdAt ?? new Date().toISOString(),
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
