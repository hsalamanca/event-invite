import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventById, getEventBySlug } from "@/lib/events";
import { notifyGuestOfRsvp, notifyHostsOfRsvp } from "@/lib/rsvp-notify";
import {
  appendRsvp,
  getRsvpByToken,
  listRsvpsByEventId,
  updateRsvpByToken,
} from "@/lib/rsvp-store";
import type { RsvpAnswers } from "@/lib/types";

export const runtime = "nodejs";

function parseAnswers(raw: unknown): RsvpAnswers {
  if (!raw || typeof raw !== "object") return {};
  const out: RsvpAnswers = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
    else if (Array.isArray(v)) out[k] = v.map(String);
  }
  return out;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const eventId = String(data.eventId ?? "");
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const attendance = String(data.attendance ?? "").trim();
  const guestCount = Number(data.guestCount ?? 1);
  const dietary = String(data.dietary ?? "").trim();
  const note = String(data.note ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const answers = parseAnswers(data.answers);
  const mealChoice = String(data.mealChoice ?? "").trim() || undefined;

  if (!eventId || !name || !email) {
    return NextResponse.json(
      { error: "Name, email, and event are required" },
      { status: 400 },
    );
  }

  const event = await getEventById(eventId);
  if (!event || !event.published) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.rsvpFields.deadline) {
    const today = new Date().toISOString().slice(0, 10);
    if (today > event.rsvpFields.deadline) {
      return NextResponse.json(
        { error: "RSVP deadline has passed" },
        { status: 409 },
      );
    }
  }

  const questions = event.rsvpFields.customQuestions ?? [];
  for (const q of questions) {
    if (!q.required) continue;
    const val = answers[q.id];
    const empty =
      val == null ||
      (typeof val === "string" && !val.trim()) ||
      (Array.isArray(val) && val.length === 0);
    if (empty && !(q.type === "meal" && mealChoice)) {
      return NextResponse.json(
        { error: `Please answer: ${q.label}` },
        { status: 400 },
      );
    }
  }

  const existing = await listRsvpsByEventId(eventId);
  const prior = existing.find((r) => r.email === email);

  if (event.capacity) {
    const going = existing
      .filter(
        (r) =>
          r.attendance.toLowerCase().includes("attend") &&
          (!prior || r.id !== prior.id),
      )
      .reduce((n, r) => n + (r.guestCount || 1), 0);
    const nextCount = attendance.toLowerCase().includes("attend")
      ? Math.max(1, guestCount || 1)
      : 0;
    if (going + nextCount > event.capacity) {
      return NextResponse.json(
        { error: "This event is at capacity" },
        { status: 409 },
      );
    }
  }

  try {
    if (prior?.editToken) {
      const record = await updateRsvpByToken(prior.editToken, {
        name,
        email,
        phone: phone || undefined,
        attendance: attendance || "Joyfully attending",
        guestCount: Number.isFinite(guestCount) ? Math.max(1, guestCount) : 1,
        dietary,
        note,
        answers,
        mealChoice,
      });
      if (!record) {
        return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
      }
      await notifyHostsOfRsvp({ event, rsvp: record, updated: true });
      await notifyGuestOfRsvp({ event, rsvp: record, updated: true });
      return NextResponse.json({ ok: true, rsvp: record, updated: true });
    }

    const record = await appendRsvp({
      eventId,
      name,
      email,
      phone: phone || undefined,
      attendance: attendance || "Joyfully attending",
      guestCount: Number.isFinite(guestCount) ? Math.max(1, guestCount) : 1,
      dietary,
      note,
      answers,
      mealChoice,
    });

    await notifyHostsOfRsvp({ event, rsvp: record, updated: false });
    await notifyGuestOfRsvp({ event, rsvp: record, updated: false });
    return NextResponse.json({ ok: true, rsvp: record }, { status: 201 });
  } catch (err) {
    console.error("RSVP append failed", err);
    return NextResponse.json(
      { error: "Unable to submit RSVP" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const data = body as Record<string, unknown>;
  const token = String(data.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const existing = await getRsvpByToken(token);
  if (!existing) {
    return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
  }

  const event = await getEventById(existing.eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const attendance = data.attendance != null ? String(data.attendance) : undefined;
  const guestCount =
    data.guestCount != null ? Number(data.guestCount) : undefined;

  if (event.capacity && attendance?.toLowerCase().includes("attend")) {
    const all = await listRsvpsByEventId(event.id);
    const going = all
      .filter(
        (r) =>
          r.id !== existing.id &&
          r.attendance.toLowerCase().includes("attend"),
      )
      .reduce((n, r) => n + (r.guestCount || 1), 0);
    const next = Math.max(1, guestCount ?? existing.guestCount);
    if (going + next > event.capacity) {
      return NextResponse.json(
        { error: "This event is at capacity" },
        { status: 409 },
      );
    }
  }

  const updated = await updateRsvpByToken(token, {
    name: data.name != null ? String(data.name).trim() : undefined,
    attendance,
    guestCount:
      guestCount != null && Number.isFinite(guestCount)
        ? Math.max(1, guestCount)
        : undefined,
    dietary: data.dietary != null ? String(data.dietary) : undefined,
    note: data.note != null ? String(data.note) : undefined,
    answers: data.answers != null ? parseAnswers(data.answers) : undefined,
    mealChoice:
      data.mealChoice != null ? String(data.mealChoice).trim() : undefined,
  });

  if (updated) {
    await notifyHostsOfRsvp({ event, rsvp: updated, updated: true });
    await notifyGuestOfRsvp({ event, rsvp: updated, updated: true });
  }

  return NextResponse.json({ ok: true, rsvp: updated });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (token) {
    const rsvp = await getRsvpByToken(token);
    if (!rsvp) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const event = await getEventById(rsvp.eventId);
    return NextResponse.json({
      rsvp: {
        ...rsvp,
        // expose token only to the holder
      },
      event: event
        ? {
            slug: event.slug,
            title: event.title,
            rsvpFields: event.rsvpFields,
            dateISO: event.dateISO,
            timeLabel: event.timeLabel,
            venue: event.venue,
          }
        : null,
    });
  }

  const eventId = searchParams.get("eventId");
  const slug = searchParams.get("slug");
  let id = eventId;
  if (!id && slug) {
    id = (await getEventBySlug(slug))?.id ?? null;
  }
  if (!id) {
    return NextResponse.json(
      { error: "eventId, slug, or token required" },
      { status: 400 },
    );
  }

  const event = await getEventById(id);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const rsvps = await listRsvpsByEventId(id);
    return NextResponse.json({ rsvps });
  } catch (err) {
    console.error("RSVP list failed", err);
    return NextResponse.json(
      { error: "Unable to load RSVPs" },
      { status: 500 },
    );
  }
}
