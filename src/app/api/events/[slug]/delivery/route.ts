import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import {
  listBlastsForEvent,
  summarizeBlastDelivery,
} from "@/lib/blast-store";
import { listOutboundForEvent } from "@/lib/email";
import { getEventBySlug } from "@/lib/events";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [blasts, messages] = await Promise.all([
    listBlastsForEvent(event.id),
    listOutboundForEvent(event.id),
  ]);

  const inbox = blasts.map((blast) => {
    const summary = summarizeBlastDelivery(messages, blast.id);
    return {
      ...blast,
      sent: summary.sent,
      failed: summary.failed,
      opened: summary.opened,
      clicked: summary.clicked,
      unopenedCount: summary.unopened.length,
      unopenedEmails: summary.unopened.map((m) => m.to),
      recipients: summary.recipients.map((m) => ({
        id: m.id,
        to: m.to,
        status: m.status,
        openedAt: m.openedAt ?? null,
        clickedAt: m.clickedAt ?? null,
        createdAt: m.createdAt,
        error: m.error,
      })),
    };
  });

  // Orphan outbound (no blast) — still show in a synthetic group
  const orphaned = messages.filter((m) => !m.blastId).slice(0, 40);

  return NextResponse.json({
    blasts: inbox,
    orphaned: orphaned.map((m) => ({
      id: m.id,
      type: m.type,
      channel: m.channel ?? "email",
      to: m.to,
      subject: m.subject,
      status: m.status,
      openedAt: m.openedAt ?? null,
      clickedAt: m.clickedAt ?? null,
      createdAt: m.createdAt,
    })),
  });
}
