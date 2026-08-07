import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createAgencyClient,
  isAgencyActive,
  listAgencyClients,
} from "@/lib/agency-clients";
import { listEventsByOwner } from "@/lib/events";
import { findUserById } from "@/lib/users";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const user = await findUserById(session.user.id);
  if (!user || !isAgencyActive(user)) {
    return NextResponse.json(
      { error: "Agency plan required", upgradeRequired: true },
      { status: 402 },
    );
  }

  const [clients, events] = await Promise.all([
    listAgencyClients(user.id),
    listEventsByOwner(user.id),
  ]);

  const withCounts = clients.map((c) => ({
    ...c,
    eventCount: events.filter((e) => e.clientId === c.id).length,
    events: events
      .filter((e) => e.clientId === c.id)
      .map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        published: e.published,
        dateISO: e.dateISO,
        whiteLabel: e.whiteLabel,
      })),
  }));

  const unassigned = events
    .filter((e) => !e.clientId)
    .map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      published: e.published,
      dateISO: e.dateISO,
    }));

  return NextResponse.json({
    clients: withCounts,
    unassigned,
    agencyActive: true,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const user = await findUserById(session.user.id);
  if (!user || !isAgencyActive(user)) {
    return NextResponse.json(
      { error: "Agency plan required", upgradeRequired: true },
      { status: 402 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    notes?: string;
  };
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Client name required" }, { status: 400 });
  }
  const client = await createAgencyClient({
    agencyOwnerId: user.id,
    name,
    email: body.email?.trim() || "",
    notes: body.notes,
  });
  return NextResponse.json({ client }, { status: 201 });
}
