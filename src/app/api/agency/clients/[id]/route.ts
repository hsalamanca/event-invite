import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteAgencyClient,
  getAgencyClient,
  isAgencyActive,
  updateAgencyClient,
} from "@/lib/agency-clients";
import { listEventsByOwner, updateEvent } from "@/lib/events";
import { findUserById } from "@/lib/users";

export const runtime = "nodejs";

async function requireAgency() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }
  const user = await findUserById(session.user.id);
  if (!user || !isAgencyActive(user)) {
    return {
      error: NextResponse.json(
        { error: "Agency plan required", upgradeRequired: true },
        { status: 402 },
      ),
    };
  }
  return { user };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireAgency();
  if ("error" in gate && gate.error) return gate.error;
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    notes?: string;
    /** Assign event slug to this client (or null to unassign) */
    assignSlug?: string | null;
  };

  if (body.assignSlug !== undefined) {
    const owned = await listEventsByOwner(gate.user.id);
    const event = owned.find((e) => e.slug === body.assignSlug);
    if (!event && body.assignSlug) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event) {
      const client = await getAgencyClient(gate.user.id, id);
      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
      await updateEvent(event.slug, {
        clientId: id,
        whiteLabel: true,
        showOwnviteFooter: false,
        tier: event.tier === "free" ? "studio" : event.tier,
      });
      return NextResponse.json({ ok: true, assigned: event.slug, clientId: id });
    }
  }

  const updated = await updateAgencyClient(gate.user.id, id, {
    name: body.name,
    email: body.email,
    notes: body.notes,
  });
  if (!updated) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  return NextResponse.json({ client: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireAgency();
  if ("error" in gate && gate.error) return gate.error;
  const { id } = await context.params;

  const owned = await listEventsByOwner(gate.user.id);
  for (const event of owned.filter((e) => e.clientId === id)) {
    await updateEvent(event.slug, { clientId: null });
  }

  const ok = await deleteAgencyClient(gate.user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
