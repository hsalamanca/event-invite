import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { isAdminEmail } from "@/lib/admin";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/locale";
import {
  listEventsByCoHostEmail,
  listEventsByOwner,
} from "@/lib/events";
import { listRsvpsByEventId } from "@/lib/rsvp-store";
import { summarizeViews, listViewsByEventId } from "@/lib/view-store";
import type { EventRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Ownvite" };

async function withStats(events: EventRecord[]) {
  return Promise.all(
    events.map(async (event) => {
      const [rsvps, views] = await Promise.all([
        listRsvpsByEventId(event.id),
        listViewsByEventId(event.id),
      ]);
      const yes = rsvps.filter((r) =>
        r.attendance.toLowerCase().includes("attend"),
      ).length;
      const seats = rsvps
        .filter((r) => r.attendance.toLowerCase().includes("attend"))
        .reduce((n, r) => n + (r.guestCount || 1), 0);
      return {
        event,
        rsvpCount: rsvps.length,
        yes,
        seats,
        opens: summarizeViews(views).total,
      };
    }),
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const locale = await getRequestLocale();
  const t = getDictionary(locale).dashboard;
  const owned = await listEventsByOwner(session.user.id);
  const coHosted = (await listEventsByCoHostEmail(session.user.email ?? "")).filter(
    (e) => !owned.some((o) => o.id === e.id),
  );
  const ownedStats = await withStats(owned);
  const coHostStats = await withStats(coHosted);
  const isAdmin = isAdminEmail(session.user.email);

  return (
    <main className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <BrandLogo tone="champagne" height={28} />
          <div className="flex items-center gap-3 text-sm">
            <LanguageSwitcher locale={locale} path="/dashboard" />
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-md border border-[var(--champagne)]/40 px-3 py-1.5 text-[var(--champagne)] hover:bg-[var(--champagne)]/10"
              >
                Admin
              </Link>
            ) : null}
            <span className="hidden text-[var(--mist)] sm:inline">
              {session.user.name || session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-white/15 px-3 py-1.5 text-[var(--mist)] hover:border-[var(--champagne)]/40 hover:text-[var(--ivory)]"
              >
                {t.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--champagne)]">
              {t.eyebrow}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl tracking-tight">
              {t.title}
            </h1>
            <p className="mt-2 max-w-lg text-[var(--mist)]">{t.support}</p>
          </div>
          <Link
            href="/events/new"
            className="rounded-md bg-[var(--champagne)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:brightness-110"
          >
            {t.create}
          </Link>
        </div>

        {ownedStats.length === 0 && coHostStats.length === 0 ? (
          <div className="mt-14 border border-dashed border-white/15 px-6 py-14 text-center">
            <p className="font-[family-name:var(--font-cormorant)] text-2xl">
              {t.emptyTitle}
            </p>
            <p className="mx-auto mt-2 max-w-md text-[var(--mist)]">
              {t.emptyBody}
            </p>
            <Link
              href="/events/new"
              className="mt-6 inline-block rounded-md bg-[var(--champagne)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)]"
            >
              {t.create}
            </Link>
          </div>
        ) : (
          <>
            <EventList
              title={locale === "es" ? "Tus eventos" : "Your events"}
              rows={ownedStats}
              t={t}
              showRole={false}
            />
            {coHostStats.length > 0 ? (
              <EventList
                title={locale === "es" ? "Como co-anfitrión" : "Co-hosting"}
                rows={coHostStats}
                t={t}
                showRole
              />
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

function EventList({
  title,
  rows,
  t,
  showRole,
}: {
  title: string;
  rows: Awaited<ReturnType<typeof withStats>>;
  t: ReturnType<typeof getDictionary>["dashboard"];
  showRole: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
        {title}
      </h2>
      <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
        {rows.map(({ event, rsvpCount, yes, seats, opens }) => {
          const tier = event.tier ?? "free";
          const past =
            event.dateISO &&
            event.dateISO < new Date().toISOString().slice(0, 10);
          return (
            <li
              key={event.id}
              className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-[family-name:var(--font-cormorant)] text-2xl">
                    {event.title}
                  </p>
                  {tier !== "free" ? (
                    <span className="rounded border border-[var(--champagne)]/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--champagne)]">
                      {tier}
                    </span>
                  ) : null}
                  {!event.published ? (
                    <span className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--mist)]">
                      {t.draft}
                    </span>
                  ) : null}
                  {past ? (
                    <span className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--mist)]">
                      past
                    </span>
                  ) : null}
                  {showRole ? (
                    <span className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--mist)]">
                      co-host
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[var(--mist)]">
                  {event.dateISO} · {event.venue}
                  {event.customDomain ? ` · ${event.customDomain}` : ""}
                </p>
                <p className="mt-1 text-sm text-[var(--mist)]">
                  {rsvpCount} RSVPs · {yes} yes · {seats} seats · {opens} opens
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/host/${event.slug}`}
                  className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/50"
                >
                  {t.edit}
                </Link>
                <Link
                  href={`/e/${event.slug}`}
                  className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/50"
                >
                  {t.view}
                </Link>
                <Link
                  href={`/host/${event.slug}#guests`}
                  className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/15"
                >
                  {t.guests}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
