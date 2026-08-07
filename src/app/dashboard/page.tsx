import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { isAdminEmail } from "@/lib/admin";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/locale";
import { isAgencyActive } from "@/lib/agency-clients";
import {
  listEventsByCoHostEmail,
  listEventsByOwner,
} from "@/lib/events";
import { listRsvpsByEventId } from "@/lib/rsvp-store";
import { summarizeViews, listViewsByEventId } from "@/lib/view-store";
import type { EventRecord } from "@/lib/types";
import {
  displayFont,
  paperGrainStyle,
  paperThemeVars,
} from "@/lib/marketing-theme";
import { findUserById } from "@/lib/users";

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
  const user = await findUserById(session.user.id);
  const agencyActive = user ? isAgencyActive(user) : false;

  return (
    <main className="relative min-h-screen overflow-x-hidden" style={paperThemeVars}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={paperGrainStyle}
      />
      <header className="relative z-20 border-b border-[var(--landing-line)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <BrandLogo tone="ink" height={28} />
          <div className="flex items-center gap-3 text-sm">
            <LanguageSwitcher locale={locale} path="/dashboard" variant="paper" />
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-md border px-3 py-1.5"
                style={{
                  borderColor: "var(--landing-cedar)",
                  color: "var(--landing-cedar)",
                }}
              >
                Admin
              </Link>
            ) : null}
            <span
              className="hidden sm:inline"
              style={{ color: "var(--landing-muted)" }}
            >
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
                className="rounded-md border px-3 py-1.5"
                style={{
                  borderColor: "var(--landing-line)",
                  color: "var(--landing-muted)",
                }}
              >
                {t.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="text-xs uppercase tracking-[0.28em]"
              style={{ color: "var(--landing-cedar)" }}
            >
              {t.eyebrow}
            </p>
            <h1
              className="mt-2"
              style={{
                ...displayFont,
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {t.title}
            </h1>
            <p className="mt-2 max-w-lg" style={{ color: "var(--landing-muted)" }}>
              {t.support}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/guests"
              className="rounded-md border px-4 py-2.5 text-sm font-semibold"
              style={{
                borderColor: "var(--landing-line)",
                color: "var(--landing-ink)",
              }}
            >
              Guest book
            </Link>
            <Link
              href="/agency"
              className="rounded-md border px-4 py-2.5 text-sm font-semibold"
              style={{
                borderColor: agencyActive
                  ? "var(--landing-cedar)"
                  : "var(--landing-line)",
                color: agencyActive
                  ? "var(--landing-cedar)"
                  : "var(--landing-ink)",
              }}
            >
              {agencyActive ? "Agency" : "Agency plan"}
            </Link>
            <Link
              href="/events/new"
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--landing-cedar)" }}
            >
              {t.create}
            </Link>
          </div>
        </div>

        {ownedStats.length === 0 && coHostStats.length === 0 ? (
          <div
            className="mt-14 border border-dashed px-6 py-14 text-center"
            style={{ borderColor: "var(--landing-line)" }}
          >
            <p
              style={{
                ...displayFont,
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              {t.emptyTitle}
            </p>
            <p
              className="mx-auto mt-2 max-w-md"
              style={{ color: "var(--landing-muted)" }}
            >
              {t.emptyBody}
            </p>
            <Link
              href="/events/new"
              className="mt-6 inline-block rounded-md px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--landing-cedar)" }}
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
      <h2
        style={{
          ...displayFont,
          fontSize: "1.5rem",
          fontWeight: 600,
        }}
      >
        {title}
      </h2>
      <ul className="mt-4 border-t" style={{ borderColor: "var(--landing-line)" }}>
        {rows.map(({ event, rsvpCount, yes, seats, opens }) => {
          const tier = event.tier ?? "free";
          const past =
            event.dateISO &&
            event.dateISO < new Date().toISOString().slice(0, 10);
          return (
            <li
              key={event.id}
              className="flex flex-col gap-4 border-b py-6 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "var(--landing-line)" }}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    style={{
                      ...displayFont,
                      fontSize: "1.35rem",
                      fontWeight: 600,
                    }}
                  >
                    {event.title}
                  </p>
                  {tier !== "free" ? (
                    <span
                      className="rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                      style={{
                        borderColor: "var(--landing-cedar)",
                        color: "var(--landing-cedar)",
                      }}
                    >
                      {tier}
                    </span>
                  ) : null}
                  {!event.published ? (
                    <span
                      className="rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                      style={{
                        borderColor: "var(--landing-line)",
                        color: "var(--landing-muted)",
                      }}
                    >
                      {t.draft}
                    </span>
                  ) : null}
                  {past ? (
                    <span
                      className="rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                      style={{
                        borderColor: "var(--landing-line)",
                        color: "var(--landing-muted)",
                      }}
                    >
                      past
                    </span>
                  ) : null}
                  {showRole ? (
                    <span
                      className="rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                      style={{
                        borderColor: "var(--landing-line)",
                        color: "var(--landing-muted)",
                      }}
                    >
                      co-host
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm" style={{ color: "var(--landing-muted)" }}>
                  {event.dateISO} · {event.venue}
                  {event.customDomain ? ` · ${event.customDomain}` : ""}
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--landing-muted)" }}>
                  {rsvpCount} RSVPs · {yes} yes · {seats} seats · {opens} opens
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/host/${event.slug}`}
                  className="rounded-md border px-3 py-1.5"
                  style={{ borderColor: "var(--landing-line)" }}
                >
                  {t.edit}
                </Link>
                <Link
                  href={`/e/${event.slug}`}
                  className="rounded-md border px-3 py-1.5"
                  style={{ borderColor: "var(--landing-line)" }}
                >
                  {t.view}
                </Link>
                <Link
                  href={`/host/${event.slug}#guests`}
                  className="rounded-md px-3 py-1.5 text-white"
                  style={{ background: "var(--landing-cedar)" }}
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
