import { promises as fs } from "fs";
import path from "path";
import type { RsvpSubmission } from "./types";

const RSVPS_PATH = path.join(process.cwd(), "data", "rsvps.json");

async function readAll(): Promise<RsvpSubmission[]> {
  try {
    const raw = await fs.readFile(RSVPS_PATH, "utf8");
    const parsed = JSON.parse(raw) as RsvpSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(rsvps: RsvpSubmission[]): Promise<void> {
  await fs.mkdir(path.dirname(RSVPS_PATH), { recursive: true });
  await fs.writeFile(RSVPS_PATH, JSON.stringify(rsvps, null, 2), "utf8");
}

export async function appendRsvp(
  submission: Omit<RsvpSubmission, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  }
): Promise<RsvpSubmission> {
  const rsvps = await readAll();
  const record: RsvpSubmission = {
    id: submission.id ?? `rsvp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
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
