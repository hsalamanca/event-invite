import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { listEvents } from "@/lib/events";
import { listUsers, findUserById } from "@/lib/users";
import { listRsvpsByEventId } from "@/lib/rsvp-store";
import { getDomainRegistry } from "@/lib/domain-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const [users, events, registry] = await Promise.all([
    listUsers(),
    listEvents(),
    getDomainRegistry({ fresh: true }).catch(() => ({ bindings: [] as { domain: string; slug: string }[] })),
  ]);
  const domains = registry.bindings ?? [];

  const eventsWithMeta = await Promise.all(
    events.map(async (event) => {
      const rsvps = await listRsvpsByEventId(event.id);
      const owner = event.ownerId
        ? await findUserById(event.ownerId)
        : undefined;
      return {
        id: event.id,
        slug: event.slug,
        title: event.title,
        hostName: event.hostName,
        dateISO: event.dateISO,
        published: event.published,
        visibility: event.visibility,
        templateId: event.templateId,
        customDomain: event.customDomain,
        ownerId: event.ownerId,
        ownerEmail: owner?.email ?? null,
        ownerName: owner?.name ?? null,
        rsvpCount: rsvps.length,
        attendingCount: rsvps.filter((r) =>
          r.attendance.toLowerCase().includes("attend"),
        ).length,
        updatedAt: event.updatedAt,
        createdAt: event.createdAt,
      };
    }),
  );

  eventsWithMeta.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return NextResponse.json({
    stats: {
      users: users.length,
      events: events.length,
      published: events.filter((e) => e.published).length,
      domains: Array.isArray(domains) ? domains.length : 0,
      rsvps: eventsWithMeta.reduce((n, e) => n + e.rsvpCount, 0),
    },
    users,
    events: eventsWithMeta,
    domains,
  });
}
