import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { getEventBySlug, updateEvent } from "@/lib/events";
import {
  addPledge,
  addThankYou,
  deleteThankYou,
  listPledges,
  listThankYous,
  markThankYouSent,
  sumCashPledges,
} from "@/lib/gifts";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [pledges, thankYous, cashPledged] = await Promise.all([
    listPledges(event.id),
    listThankYous(event.id),
    sumCashPledges(event.id),
  ]);
  return NextResponse.json({
    pledges,
    thankYous,
    cashFundGoal: event.cashFundGoal ?? null,
    cashFundRaised: (event.cashFundRaised ?? 0) + cashPledged,
    cashPledged,
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event || !event.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: "pledge" | "thankyou" | "mark_thanks" | "delete_thanks" | "goal";
    name?: string;
    email?: string;
    kind?: "registry" | "cash";
    amount?: number;
    note?: string;
    guestName?: string;
    itemId?: string;
    cashFundGoal?: number | null;
    cashFundRaised?: number | null;
  };

  // Public pledge from invite
  if (body.action === "pledge" || (!body.action && body.name && body.email)) {
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email required" },
        { status: 400 },
      );
    }
    const pledge = await addPledge({
      eventId: event.id,
      name,
      email,
      kind: body.kind === "cash" ? "cash" : "registry",
      amount: body.amount,
      note: body.note,
    });
    // Auto thank-you todo for host
    await addThankYou({
      eventId: event.id,
      guestName: name,
      email,
      note:
        body.kind === "cash" && body.amount
          ? `Cash gift $${body.amount}`
          : body.note || "Registry / gift",
    });
    return NextResponse.json({ ok: true, pledge }, { status: 201 });
  }

  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (body.action === "thankyou") {
    const item = await addThankYou({
      eventId: event.id,
      guestName: body.guestName || body.name || "Guest",
      email: body.email || "",
      note: body.note,
    });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  }

  if (body.action === "mark_thanks" && body.itemId) {
    const item = await markThankYouSent(event.id, body.itemId);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  }

  if (body.action === "delete_thanks" && body.itemId) {
    const ok = await deleteThankYou(event.id, body.itemId);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "goal") {
    await updateEvent(slug, {
      cashFundGoal:
        body.cashFundGoal == null ? null : Math.max(0, Number(body.cashFundGoal) || 0),
      cashFundRaised:
        body.cashFundRaised == null
          ? event.cashFundRaised ?? null
          : Math.max(0, Number(body.cashFundRaised) || 0),
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
