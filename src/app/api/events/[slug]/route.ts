import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import {
  adminDeleteEvent,
  deleteEvent,
  getEventBySlug,
  updateEvent,
} from "@/lib/events";
import { eventIsPro, canUseCheckIn, canUsePremiumTemplate, canUsePrivateInvite } from "@/lib/tier";
import { getTemplate } from "@/lib/templates";
import type { EventRecord } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ event });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  const existing = await getEventBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const access = await canManageEvent(existing);
  if (!access.allowed) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Partial<EventRecord> & {
    invitePassword?: string | null;
    clearInvitePassword?: boolean;
  };

  const partial: Partial<EventRecord> = { ...data };
  delete (partial as { invitePassword?: unknown }).invitePassword;
  delete (partial as { clearInvitePassword?: unknown }).clearInvitePassword;

  // Never accept a raw hash from the client
  delete partial.invitePasswordHash;

  if (data.clearInvitePassword) {
    partial.invitePasswordHash = null;
  } else if (
    typeof data.invitePassword === "string" &&
    data.invitePassword.trim()
  ) {
    partial.invitePasswordHash = await hash(data.invitePassword.trim(), 10);
  }

  if (Array.isArray(data.coHostEmails)) {
    partial.coHostEmails = data.coHostEmails
      .map((e) => String(e).trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof partial.templateId === "string" && partial.templateId) {
    const tpl = getTemplate(partial.templateId);
    if (
      tpl.premium &&
      !canUsePremiumTemplate(existing, tpl.id, true) &&
      !access.isAdmin
    ) {
      return NextResponse.json(
        {
          error: "Unlock this premium theme ($7) or upgrade to Pro Event.",
          upgradeRequired: true,
          product: "theme_unlock",
          templateId: tpl.id,
        },
        { status: 402 },
      );
    }
    if (tpl.premium) partial.premiumTheme = true;
  }

  if (
    partial.visibility === "private" &&
    !canUsePrivateInvite(existing) &&
    !access.isAdmin
  ) {
    return NextResponse.json(
      {
        error: "Private password invites are included with Pro Event.",
        upgradeRequired: true,
        product: "pro_event",
      },
      { status: 402 },
    );
  }

  if (
    partial.checkInEnabled === true &&
    !canUseCheckIn(existing) &&
    !access.isAdmin
  ) {
    return NextResponse.json(
      {
        error: "Door check-in is included with Pro Event.",
        upgradeRequired: true,
        product: "pro_event",
      },
      { status: 402 },
    );
  }

  // Free tier always shows Ownvite footer (Pro removes it via Stripe webhook)
  if (!eventIsPro(existing) && !access.isAdmin) {
    if (partial.showOwnviteFooter === false) {
      return NextResponse.json(
        {
          error: "Upgrade to Pro Event to remove the Ownvite footer.",
          upgradeRequired: true,
          product: "pro_event",
        },
        { status: 402 },
      );
    }
    partial.showOwnviteFooter = true;
  }

  // Clients cannot self-assign paid tiers / credits
  if (!access.isAdmin) {
    delete partial.tier;
    delete partial.emailCredits;
    delete partial.unlockedTemplateIds;
  }

  try {
    const updated = await updateEvent(slug, partial);
    return NextResponse.json({ event: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { slug } = await params;
  const existing = await getEventBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const { allowed, isAdmin, session } = await canManageEvent(existing);
  if (!allowed || !session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const ok = isAdmin
    ? await adminDeleteEvent(slug)
    : await deleteEvent(slug, session.user.id);
  if (!ok) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
