import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BrandLogo from "@/components/BrandLogo";
import { AgencyDashboard } from "@/components/agency/AgencyDashboard";
import { isAgencyActive, listAgencyClients } from "@/lib/agency-clients";
import { listEventsByOwner } from "@/lib/events";
import {
  displayFont,
  paperGrainStyle,
  paperThemeVars,
} from "@/lib/marketing-theme";
import { findUserById } from "@/lib/users";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agency · Ownvite" };

export default async function AgencyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/agency");
  }
  const user = await findUserById(session.user.id);
  if (!user) redirect("/dashboard");

  const agencyActive = isAgencyActive(user);
  const [clients, events] = agencyActive
    ? await Promise.all([
        listAgencyClients(user.id),
        listEventsByOwner(user.id),
      ])
    : [[], []];

  const clientRows = clients.map((c) => ({
    ...c,
    events: events
      .filter((e) => e.clientId === c.id)
      .map((e) => ({
        slug: e.slug,
        title: e.title,
        published: e.published,
        dateISO: e.dateISO,
        whiteLabel: Boolean(e.whiteLabel),
      })),
  }));
  const unassigned = events
    .filter((e) => !e.clientId)
    .map((e) => ({
      slug: e.slug,
      title: e.title,
      published: e.published,
      dateISO: e.dateISO,
    }));

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
          <Link
            href="/dashboard"
            className="text-sm"
            style={{ color: "var(--landing-muted)" }}
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p
          className="text-xs uppercase tracking-[0.28em]"
          style={{ color: "var(--landing-cedar)" }}
        >
          White-label
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
          Agency workspace
        </h1>
        <p className="mt-2 max-w-xl" style={{ color: "var(--landing-muted)" }}>
          Client folders, branded invites without Ownvite chrome, and a planner
          view across every event you run for them.
        </p>

        {!agencyActive ? (
          <div
            className="mt-10 rounded-lg border p-6"
            style={{ borderColor: "var(--landing-line)" }}
          >
            <p className="font-medium">Agency is not active on this account.</p>
            <p className="mt-2 text-sm" style={{ color: "var(--landing-muted)" }}>
              Upgrade to Agency ($199/mo) from any host studio to unlock client
              workspaces and full white-label.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-block rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--landing-cedar)" }}
            >
              View pricing
            </Link>
          </div>
        ) : (
          <div className="mt-10">
            <AgencyDashboard
              initialClients={clientRows}
              unassigned={unassigned}
            />
          </div>
        )}
      </div>
    </main>
  );
}
