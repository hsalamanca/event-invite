import { NextResponse } from "next/server";
import { listManualGuests, updateManualGuestStatus } from "@/lib/guest-extras";
import { getEventById, listEvents } from "@/lib/events";
import {
  appendRsvp,
  listRsvpsByEventId,
  updateRsvpByToken,
} from "@/lib/rsvp-store";
import { sendSmsMessage } from "@/lib/sms";

export const runtime = "nodejs";

/**
 * Twilio inbound SMS webhook.
 * Guests reply YES / NO / STOP (optionally with event slug: YES h-birthday-2026).
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const from = String(form?.get("From") ?? "").trim();
  const body = String(form?.get("Body") ?? "").trim();
  if (!from || !body) {
    return twiml("Thanks — reply YES or NO to RSVP.");
  }

  const digits = from.replace(/\D/g, "");
  const normalized = body.replace(/\s+/g, " ").trim();
  const upper = normalized.toUpperCase();

  if (/\bSTOP\b|\bUNSUBSCRIBE\b|\bCANCEL\b/.test(upper)) {
    // Soft opt-out: mark matching manual guests declined + note via SMS ack
    const events = await listEvents();
    for (const event of events) {
      const guests = await listManualGuests(event.id);
      for (const g of guests) {
        if (g.phone && g.phone.replace(/\D/g, "").endsWith(digits.slice(-10))) {
          await updateManualGuestStatus(g.id, "declined");
        }
      }
    }
    return twiml("You're unsubscribed from Ownvite SMS. Reply START to opt in again.");
  }

  const parts = normalized.split(" ");
  const verb = (parts[0] || "").toUpperCase().replace(/[^A-Z]/g, "");
  const slugHint = (parts[1] || "").toLowerCase().replace(/[^a-z0-9-]/g, "");

  const isYes = ["YES", "Y", "SI", "SÍ", "ATTEND", "GOING"].includes(verb);
  const isNo = ["NO", "N", "DECLINE", "CANT", "CAN'T"].includes(verb);
  if (!isYes && !isNo) {
    return twiml("Reply YES or NO to RSVP (add event slug if you have several: YES my-party).");
  }

  const attendance = isYes ? "Joyfully attending" : "Regretfully declining";
  const events = await listEvents();
  const published = events.filter((e) => e.published && e.rsvpEnabled !== false);

  let candidates = published;
  if (slugHint) {
    candidates = published.filter((e) => e.slug === slugHint);
  }

  // Prefer event where this phone already exists on RSVP or manual list
  const matched: { eventId: string; slug: string; rsvpId?: string; token?: string }[] = [];
  for (const event of candidates) {
    const [rsvps, manual] = await Promise.all([
      listRsvpsByEventId(event.id),
      listManualGuests(event.id),
    ]);
    const rsvp = rsvps.find(
      (r) => r.phone && r.phone.replace(/\D/g, "").endsWith(digits.slice(-10)),
    );
    const guest = manual.find(
      (g) => g.phone && g.phone.replace(/\D/g, "").endsWith(digits.slice(-10)),
    );
    if (rsvp || guest) {
      matched.push({
        eventId: event.id,
        slug: event.slug,
        rsvpId: rsvp?.id,
        token: rsvp?.editToken,
      });
    }
  }

  if (matched.length === 0 && candidates.length === 1) {
    matched.push({ eventId: candidates[0]!.id, slug: candidates[0]!.slug });
  }

  if (matched.length === 0) {
    return twiml(
      "We couldn't match your number to an invite. Reply YES your-event-slug or RSVP on the web invite.",
    );
  }
  if (matched.length > 1 && !slugHint) {
    return twiml(
      `Multiple events found. Reply YES or NO with a slug, e.g. YES ${matched[0]!.slug}`,
    );
  }

  const target = matched[0]!;
  const event = await getEventById(target.eventId);
  if (!event) return twiml("Event not found.");

  if (target.token) {
    await updateRsvpByToken(target.token, { attendance, phone: from });
  } else {
    const rsvps = await listRsvpsByEventId(event.id);
    const byPhone = rsvps.find(
      (r) => r.phone && r.phone.replace(/\D/g, "").endsWith(digits.slice(-10)),
    );
    if (byPhone?.editToken) {
      await updateRsvpByToken(byPhone.editToken, { attendance, phone: from });
    } else {
      const manual = await listManualGuests(event.id);
      const guest = manual.find(
        (g) => g.phone && g.phone.replace(/\D/g, "").endsWith(digits.slice(-10)),
      );
      await appendRsvp({
        eventId: event.id,
        name: guest?.name || "Guest",
        email: guest?.email || `${digits}@sms.ownvite.local`,
        phone: from,
        attendance,
        guestCount: 1,
        dietary: "",
        note: "RSVP via SMS",
      });
      if (guest) {
        await updateManualGuestStatus(
          guest.id,
          isYes ? "going" : "declined",
        );
      }
    }
  }

  // Best-effort ack via API as well (Twilio also speaks TwiML)
  void sendSmsMessage({
    to: from,
    body: isYes
      ? `You're marked as attending ${event.title}. See you there!`
      : `Thanks — we've noted you can't make ${event.title}.`,
  });

  return twiml(
    isYes
      ? `You're in for ${event.title}. Open /e/${event.slug} for details.`
      : `Sorry you'll miss ${event.title}. Thanks for letting us know.`,
  );
}

function twiml(message: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
