import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import EventCustomizer from "@/components/host/EventCustomizer";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { EventRecord } from "@/lib/types";
import type { RsvpSubmission } from "@/lib/types";

type HostStudioShellProps = {
  event: EventRecord;
  rsvps: RsvpSubmission[];
  locale?: Locale;
};

export default function HostStudioShell({
  event,
  rsvps,
  locale = "en",
}: HostStudioShellProps) {
  const t = getDictionary(locale).host;
  const attending = rsvps.filter((r) =>
    r.attendance.toLowerCase().includes("attend")
  ).length;

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--ink)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={localePath(locale, "/")}
              className="font-[family-name:var(--font-cormorant)] text-xl tracking-wide text-[var(--champagne)]"
            >
              Ownvite
            </Link>
            <span className="hidden text-sm text-[var(--mist)] sm:inline">
              {t.studio} · {event.title}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <LanguageSwitcher
              locale={locale}
              path={`/host/${event.slug}`}
            />
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
    </div>
  );
}
