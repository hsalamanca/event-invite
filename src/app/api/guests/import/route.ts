import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug } from "@/lib/events";
import { addManualGuest, listManualGuests } from "@/lib/guest-extras";

export const runtime = "nodejs";

/** CSV body: name,email per line (header optional) */
export async function POST(request: Request) {
  const body = (await request.json()) as { slug?: string; csv?: string };
  const slug = body.slug?.trim();
  const csv = body.csv ?? "";
  if (!slug || !csv.trim()) {
    return NextResponse.json({ error: "slug and csv required" }, { status: 400 });
  }

  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await listManualGuests(event.id);
  const existingEmails = new Set(existing.map((g) => g.email.toLowerCase()));

  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let added = 0;
  let skipped = 0;

  for (const line of lines) {
    if (/^name\s*,\s*email/i.test(line)) continue;
    const parts = line.split(",").map((p) => p.replace(/^"|"$/g, "").trim());
    const name = parts[0] ?? "";
    const email = (parts[1] ?? "").toLowerCase();
    if (!name) {
      skipped += 1;
      continue;
    }
    if (email && existingEmails.has(email)) {
      skipped += 1;
      continue;
    }
    await addManualGuest({ eventId: event.id, name, email });
    if (email) existingEmails.add(email);
    added += 1;
    if (added >= 500) break;
  }

  return NextResponse.json({ ok: true, added, skipped });
}
