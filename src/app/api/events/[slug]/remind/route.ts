import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { createBlast } from "@/lib/blast-store";
import { sendEventEmail } from "@/lib/email";
import { inviteEmailHtml } from "@/lib/email-templates";
import { getEventBySlug, updateEvent } from "@/lib/events";
import { listManualGuests } from "@/lib/guest-extras";
import { listRsvpsByEventId } from "@/lib/rsvp-store";
import { sendSmsMessage, type SmsChannel } from "@/lib/sms";
import { isWhiteLabel } from "@/lib/tier";
import {
  emailBlastAllowance,
  eventIsPro,
  FREE_EMAIL_BLAST_CAP,
  PRO_EMAIL_BLAST_CAP,
} from "@/lib/tier";

export const runtime = "nodejs";

type RemindType = "rsvp_reminder" | "event_reminder" | "invite";
type RemindChannel = "email" | "sms" | "whatsapp";

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
    type?: RemindType;
    channel?: RemindChannel;
    emails?: string[];
    phones?: string[];
    /** Resend only to these emails (e.g. unopened from delivery inbox) */
    onlyUnopened?: boolean;
    scheduledFor?: string | null;
  };
  const type = body.type ?? "rsvp_reminder";
  const channel: RemindChannel = body.channel ?? "email";
  const base = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`
    : "https://ownvite.com";
  const inviteUrl = `${base}/e/${event.slug}`;
  const brandSuffix = isWhiteLabel(event) ? "" : " via Ownvite";
  const scheduledFor = body.scheduledFor?.trim() || null;

  const [rsvps, manual] = await Promise.all([
    listRsvpsByEventId(event.id),
    listManualGuests(event.id),
  ]);
  const responded = new Set(rsvps.map((r) => r.email.toLowerCase()));

  if (channel === "email") {
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

    const blast = await createBlast({
      eventId: event.id,
      type,
      channel: "email",
      subject,
      recipientCount: capped.length,
      scheduledFor,
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
        `— ${event.hostName}${brandSuffix}`,
      ].join("\n");

      results.push(
        await sendEventEmail({
          eventId: event.id,
          type,
          to,
          subject,
          body: bodyText,
          htmlBuilder: ({ token, trackBaseUrl }) =>
            inviteEmailHtml({
              hostName: event.hostName,
              title: event.title,
              dateISO: event.dateISO,
              timeLabel: event.timeLabel,
              venue: event.venue,
              address: event.address,
              inviteUrl,
              kind: type,
              whiteLabel: isWhiteLabel(event),
              trackingToken: token,
              trackBaseUrl,
            }),
          blastId: blast.id,
          channel: "email",
          scheduledFor,
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
      channel: "email",
      blastId: blast.id,
      sent: results.filter((r) => r.status === "sent").length,
      preview: results.filter((r) => r.status === "preview").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
      truncated,
      creditsUsed: useCredits,
      creditsRemaining: Math.max(0, (event.emailCredits ?? 0) - useCredits),
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
        scheduledFor ? `Scheduled for ${scheduledFor}.` : null,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  // SMS / WhatsApp
  const smsChannel: SmsChannel = channel === "whatsapp" ? "whatsapp" : "sms";
  let phoneTargets: string[] = [];
  if (body.phones?.length) {
    phoneTargets = body.phones;
  } else if (type === "rsvp_reminder" || type === "invite") {
    phoneTargets = manual
      .filter((g) => g.phone && g.email && !responded.has(g.email.toLowerCase()))
      .map((g) => g.phone!)
      .concat(
        manual
          .filter((g) => g.phone && !g.email)
          .map((g) => g.phone!),
      );
  } else {
    phoneTargets = rsvps
      .filter(
        (r) =>
          r.phone && r.attendance.toLowerCase().includes("attend"),
      )
      .map((r) => r.phone!);
    for (const g of manual) {
      if (g.phone && (g.status === "going" || g.status === "maybe")) {
        phoneTargets.push(g.phone);
      }
    }
  }

  phoneTargets = [...new Set(phoneTargets.map((p) => p.trim()).filter(Boolean))];
  if (phoneTargets.length === 0) {
    return NextResponse.json({
      ok: true,
      channel,
      sent: 0,
      message:
        "No phone numbers on matching guests. Add phones when importing guests, or collect them on RSVP.",
    });
  }

  const credits = Math.max(0, event.smsCredits ?? 0);
  if (credits <= 0) {
    return NextResponse.json(
      {
        error:
          "No SMS credits. Buy an SMS / WhatsApp Pack ($15 for 50) from Host actions.",
        upgradeRequired: true,
        product: "sms_pack",
      },
      { status: 402 },
    );
  }

  const capped = phoneTargets.slice(0, credits);
  const truncated = phoneTargets.length > capped.length;
  const smsBody = [
    type === "event_reminder"
      ? `Reminder: ${event.title} on ${event.dateISO} at ${event.timeLabel}.`
      : type === "invite"
        ? `You're invited to ${event.title}.`
        : `Please RSVP for ${event.title}.`,
    inviteUrl,
    `— ${event.hostName}${brandSuffix}`,
  ].join("\n");

  const blast = await createBlast({
    eventId: event.id,
    type,
    channel,
    subject: `${channel.toUpperCase()} ${type}`,
    recipientCount: capped.length,
    scheduledFor,
  });

  const results = [];
  for (const to of capped) {
    const result = await sendSmsMessage({
      to,
      body: smsBody,
      channel: smsChannel,
    });
    results.push({ to, ...result });
    await sendEventEmail({
      eventId: event.id,
      type: channel === "whatsapp" ? "whatsapp_reminder" : "sms_reminder",
      to,
      subject: `${channel.toUpperCase()} ${type}`,
      body: smsBody,
      html: `<pre>${smsBody.replace(/</g, "&lt;")}</pre>`,
      blastId: blast.id,
      channel,
      scheduledFor,
    }).catch(() => null);
  }

  const used = results.filter(
    (r) => r.status === "sent" || r.status === "preview",
  ).length;
  if (used > 0) {
    await updateEvent(slug, {
      smsCredits: Math.max(0, credits - used),
    });
  }

  return NextResponse.json({
    ok: true,
    channel,
    blastId: blast.id,
    sent: results.filter((r) => r.status === "sent").length,
    preview: results.filter((r) => r.status === "preview").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
    truncated,
    creditsUsed: used,
    creditsRemaining: Math.max(0, credits - used),
    note: [
      !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN
        ? "Twilio not configured — SMS saved as preview in outbound log."
        : null,
      truncated
        ? `Only ${capped.length} of ${phoneTargets.length} sent (SMS credit limit).`
        : null,
      used > 0 ? `Used ${used} SMS credit(s).` : null,
    ]
      .filter(Boolean)
      .join(" "),
  });
}
