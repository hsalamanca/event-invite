import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { sendEventEmail } from "@/lib/email";
import { inviteEmailHtml } from "@/lib/email-templates";
import { getEventBySlug, updateEvent } from "@/lib/events";
import { listManualGuests } from "@/lib/guest-extras";
import { listRsvpsByEventId } from "@/lib/rsvp-store";
import {
  emailBlastAllowance,
  eventIsPro,
  FREE_EMAIL_BLAST_CAP,
  PRO_EMAIL_BLAST_CAP,
} from "@/lib/tier";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    type?: "rsvp_reminder" | "event_reminder" | "invite";
    emails?: string[];
  };
  const type = body.type ?? "rsvp_reminder";
  const base = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`
    : "https://ownvite.com";
  const inviteUrl = `${base}/e/${event.slug}`;

  const [rsvps, manual] = await Promise.all([
    listRsvpsByEventId(event.id),
    listManualGuests(event.id),
  ]);
  const responded = new Set(rsvps.map((r) => r.email.toLowerCase()));

  let targets: string[] = [];
  if (body.emails?.length) {
    targets = body.emails.map((e) => e.toLowerCase());
  } else if (type === "rsvp_reminder" || type === "invite") {
    targets = manual
      .map((g) => g.email)
      .filter((e) => e && !responded.has(e.toLowerCase()));
  } else {
    targets = rsvps
      .filter((r) => r.attendance.toLowerCase().includes("attend"))
      .map((r) => r.email);
  }

  targets = [...new Set(targets.filter(Boolean))];
  if (targets.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      message: "No matching recipients.",
    });
  }

  const { allowance, useCredits, cap } = emailBlastAllowance(
    event,
    targets.length,
  );
  const capped = targets.slice(0, allowance);
  const truncated = targets.length > capped.length;

  const subject =
    type === "event_reminder"
      ? `Reminder: ${event.title}`
      : type === "invite"
        ? `You're invited: ${event.title}`
        : `Please RSVP: ${event.title}`;

  const html = inviteEmailHtml({
    hostName: event.hostName,
    title: event.title,
    dateISO: event.dateISO,
    timeLabel: event.timeLabel,
    venue: event.venue,
    address: event.address,
    inviteUrl,
    kind: type,
  });

  const results = [];
  for (const to of capped) {
    const bodyText = [
      `Hi!`,
      "",
      type === "event_reminder"
        ? `Friendly reminder about ${event.title} on ${event.dateISO} at ${event.timeLabel}.`
        : type === "invite"
          ? `You're invited to ${event.title}.`
          : `Please RSVP for ${event.title}.`,
      "",
      `${event.venue} — ${event.address}`,
      inviteUrl,
      "",
      `— ${event.hostName} via Ownvite`,
    ].join("\n");

    results.push(
      await sendEventEmail({
        eventId: event.id,
        type,
        to,
        subject,
        body: bodyText,
        html,
      }),
    );
  }

  if (useCredits > 0) {
    await updateEvent(slug, {
      emailCredits: Math.max(0, (event.emailCredits ?? 0) - useCredits),
    });
  }

  return NextResponse.json({
    ok: true,
    sent: results.filter((r) => r.status === "sent").length,
    preview: results.filter((r) => r.status === "preview").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
    truncated,
    creditsUsed: useCredits,
    creditsRemaining: Math.max(
      0,
      (event.emailCredits ?? 0) - useCredits,
    ),
    note: [
      !process.env.RESEND_API_KEY
        ? "RESEND_API_KEY not set — messages saved as preview (copy/paste)."
        : null,
      truncated
        ? eventIsPro(event)
          ? `Pro sends up to ${PRO_EMAIL_BLAST_CAP} emails per blast.`
          : `Free includes ${FREE_EMAIL_BLAST_CAP} emails per blast (cap ${cap}). Buy a Reminder Pack for +100 credits, or upgrade to Pro for ${PRO_EMAIL_BLAST_CAP}/blast.`
        : null,
      useCredits > 0 ? `Used ${useCredits} reminder credit(s).` : null,
    ]
      .filter(Boolean)
      .join(" "),
  });
}
