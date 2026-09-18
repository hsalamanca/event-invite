import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { canManageEvent, managerDeniedStatus } from "@/lib/access";
import {
  adminDeleteEvent,
  deleteEvent,
  getEventBySlug,
  updateEvent,
} from "@/lib/events";
import { toPublicEvent } from "@/lib/public-event";
import { safeHttpsUrl } from "@/lib/safe-https-url";
import {
  eventIsPro,
  canUseCheckIn,
  canUsePremiumTemplate,
  canUsePrivateInvite,
} from "@/lib/tier";
import { getTemplate } from "@/lib/templates";
import type { EventRecord } from "@/lib/types";
import { findUserById } from "@/lib/users";

export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

function normalizeGiftUrl(raw: unknown): string | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  return trimmed ? (safeHttpsUrl(trimmed) ?? null) : null;
}

function validateHttpsGiftUrl(
  data: Partial<EventRecord>,
  field: "registryUrl" | "cashFundUrl",
): string | null {
  if (!(field in data)) return null;
  const raw = data[field];
  if (raw == null || String(raw).trim() === "") return null;
  if (!safeHttpsUrl(String(raw))) {
    return `${field} must be an https URL`;
  }
  return null;
}

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const access = await canManageEvent(event);
  if (access.allowed) {
    return NextResponse.json({
      event: { ...event, invitePasswordHash: null },
    });
  }
  if (!event.published) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ event: toPublicEvent(event) });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  const existing = await getEventBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const access = await canManageEvent(existing);
  const denied = managerDeniedStatus(access);
  if (denied) {
    return NextResponse.json(
      { error: denied === 401 ? "Unauthorized" : "Not allowed" },
      { status: denied },
    );
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

  const giftUrlError = validateHttpsGiftUrl(data, "registryUrl")
    ?? validateHttpsGiftUrl(data, "cashFundUrl");
  if (giftUrlError) {
    return NextResponse.json({ error: giftUrlError }, { status: 400 });
  }
  if ("registryUrl" in data) {
    partial.registryUrl = normalizeGiftUrl(data.registryUrl);
  }
  if ("cashFundUrl" in data) {
    partial.cashFundUrl = normalizeGiftUrl(data.cashFundUrl);
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

  if (partial.whiteLabel === true && !access.isAdmin) {
    const userId = access.session?.user?.id;
    const user = userId ? await findUserById(userId) : null;
    if (user?.agencyStatus !== "active") {
      return NextResponse.json(
        {
          error: "White-label requires an Agency subscription.",
          upgradeRequired: true,
          product: "agency",
        },
        { status: 402 },
      );
    }
  }

  // Clients cannot self-assign paid tiers / credits / analytics counters
  if (!access.isAdmin) {
    delete partial.tier;
    delete partial.emailCredits;
    delete partial.smsCredits;
    delete partial.unlockedTemplateIds;
    delete partial.unlockedPackIds;
    delete partial.registryClicks;
    delete partial.cashFundClicks;
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
