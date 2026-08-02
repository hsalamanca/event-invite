import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { isAdminEmail } from "@/lib/admin";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/locale";
import { listEventsByOwner } from "@/lib/events";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Ownvite" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const locale = await getRequestLocale();
  const t = getDictionary(locale).dashboard;
  const events = await listEventsByOwner(session.user.id);
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

        {events.length === 0 ? (
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
          <ul className="mt-10 divide-y divide-white/10 border-t border-white/10">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-cormorant)] text-2xl">
                    {event.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--mist)]">
                    {event.dateISO} · {event.venue}
                    {!event.published ? ` · ${t.draft}` : ""}
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
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
