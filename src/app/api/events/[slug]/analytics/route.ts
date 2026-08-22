import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { listBlastsForEvent, summarizeBlastDelivery } from "@/lib/blast-store";
import { listOutboundForEvent } from "@/lib/email";
import { getEventBySlug } from "@/lib/events";
import { listManualGuests } from "@/lib/guest-extras";
import { listPledges, sumCashPledges } from "@/lib/gifts";
import { listRsvpsByEventId } from "@/lib/rsvp-store";
import { listViewsByEventId, summarizeViews } from "@/lib/view-store";

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

  const [rsvps, manual, views, blasts, messages, pledges, cashPledged] =
    await Promise.all([
      listRsvpsByEventId(event.id),
      listManualGuests(event.id),
      listViewsByEventId(event.id),
      listBlastsForEvent(event.id),
      listOutboundForEvent(event.id),
      listPledges(event.id),
      sumCashPledges(event.id),
    ]);

  const viewSummary = summarizeViews(views);
  const yes = rsvps.filter((r) =>
    r.attendance.toLowerCase().includes("attend"),
  );
  const no = rsvps.filter((r) =>
    r.attendance.toLowerCase().includes("declin"),
  );
  const checkedIn = rsvps.filter((r) => r.checkedIn).length;
  const mealChoices: Record<string, number> = {};
  for (const r of yes) {
    const meal = r.mealChoice?.trim() || "(none)";
    mealChoices[meal] = (mealChoices[meal] || 0) + (r.guestCount || 1);
  }

  let emailsSent = 0;
  let emailsOpened = 0;
  let emailsClicked = 0;
  for (const blast of blasts) {
    const s = summarizeBlastDelivery(messages, blast.id);
    emailsSent += s.sent;
    emailsOpened += s.opened;
    emailsClicked += s.clicked;
  }

  const invited = new Set(
    [
      ...manual.map((g) => g.email.toLowerCase()).filter(Boolean),
      ...rsvps.map((r) => r.email.toLowerCase()),
    ].filter(Boolean),
  );

  return NextResponse.json({
    funnel: {
      invited: invited.size || manual.length,
      emailsSent,
      emailsOpened,
      emailsClicked,
      pageOpens: viewSummary.total,
      rsvps: rsvps.length,
      attending: yes.length,
      declining: no.length,
      seats: yes.reduce((n, r) => n + (r.guestCount || 1), 0),
      checkedIn,
    },
    meals: mealChoices,
    registry: {
      registryClicks: event.registryClicks ?? 0,
      cashFundClicks: event.cashFundClicks ?? 0,
      pledges: pledges.length,
      cashPledged,
      cashFundGoal: event.cashFundGoal ?? null,
      cashFundRaised: (event.cashFundRaised ?? 0) + cashPledged,
    },
    opensByDay: Object.fromEntries(
      (viewSummary.days ?? []).map((d) => [d.date, d.count]),
    ),
  });
}
