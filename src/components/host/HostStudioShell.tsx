import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import EventCustomizer from "@/components/host/EventCustomizer";
import GuestManager from "@/components/host/GuestManager";
import HostActions from "@/components/host/HostActions";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { EventRecord, RsvpSubmission } from "@/lib/types";

type HostStudioShellProps = {
  event: EventRecord;
  rsvps: RsvpSubmission[];
  locale?: Locale;
  canDelete?: boolean;
  showDashboard?: boolean;
};

export default function HostStudioShell({
  event,
  rsvps,
  locale = "en",
  canDelete = false,
  showDashboard = false,
}: HostStudioShellProps) {
  const t = getDictionary(locale).host;
  const nav = getDictionary(locale).nav;
  const attending = rsvps.filter((r) =>
    r.attendance.toLowerCase().includes("attend"),
  ).length;

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--ink)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <BrandLogo
              href={localePath(locale, showDashboard ? "/dashboard" : "/")}
              tone="champagne"
              height={26}
            />
            <span className="hidden text-sm text-[var(--mist)] sm:inline">
              {t.studio} · {event.title}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <LanguageSwitcher locale={locale} path={`/host/${event.slug}`} />
            {showDashboard ? (
              <Link
                href="/dashboard"
                className="hidden text-[var(--mist)] hover:text-[var(--ivory)] sm:inline"
              >
                {nav.dashboard}
              </Link>
            ) : null}
            <span className="rounded-md border border-white/10 bg-[var(--slate)] px-3 py-1.5 text-[var(--mist)]">
              {rsvps.length} {t.rsvps} · {attending} {t.yes}
            </span>
            <Link
              href={localePath(locale, `/e/${event.slug}`)}
              className="rounded-md bg-[var(--champagne)] px-3 py-1.5 font-medium text-[var(--ink)] transition hover:brightness-110"
            >
              {t.viewInvite}
            </Link>
          </div>
        </div>
      </header>
      <EventCustomizer event={event} locale={locale} />
      <div className="mx-auto max-w-[1600px] space-y-10 px-4 pb-16 sm:px-6">
        <GuestManager
          slug={event.slug}
          locale={locale}
          initialRsvps={rsvps}
        />
        <HostActions
          slug={event.slug}
          locale={locale}
          canDelete={canDelete}
        />
      </div>
    </div>
  );
}
