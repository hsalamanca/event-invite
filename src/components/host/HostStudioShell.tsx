import { Suspense } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { AlbumModeration } from "@/components/host/AlbumModeration";
import { CheckInPanel } from "@/components/host/CheckInPanel";
import EventCustomizer from "@/components/host/EventCustomizer";
import GuestManager from "@/components/host/GuestManager";
import { GuestbookModeration } from "@/components/host/GuestbookModeration";
import HostActions from "@/components/host/HostActions";
import { MealDashboard } from "@/components/host/MealDashboard";
import { OpenTracking } from "@/components/host/OpenTracking";
import { SeatingChart } from "@/components/host/SeatingChart";
import { WaitlistPanel } from "@/components/host/WaitlistPanel";
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
  const seats = rsvps
    .filter((r) => r.attendance.toLowerCase().includes("attend"))
    .reduce((n, r) => n + (r.guestCount || 1), 0);

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--ink)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <BrandLogo
              href={localePath(locale, showDashboard ? "/dashboard" : "/")}
              tone="champagne"
              height={26}
            />
            <span className="hidden truncate text-sm text-[var(--mist)] md:inline">
              {t.studio} · {event.title}
            </span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 text-sm sm:gap-3">
            <LanguageSwitcher locale={locale} path={`/host/${event.slug}`} />
            {showDashboard ? (
              <Link
                href="/dashboard"
                className="hidden text-[var(--mist)] hover:text-[var(--ivory)] sm:inline"
              >
                {nav.dashboard}
              </Link>
            ) : null}
            <span className="hidden rounded-md border border-white/10 bg-[var(--slate)] px-3 py-1.5 text-[var(--mist)] sm:inline">
              {rsvps.length} {t.rsvps} · {attending} {t.yes}
              {event.capacity ? ` · ${seats}/${event.capacity}` : ""}
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
      <div className="mx-auto max-w-[1600px] space-y-10 px-4 pb-24 sm:px-6 sm:pb-16">
        <MealDashboard
          rsvps={rsvps}
          questions={event.rsvpFields.customQuestions ?? []}
          dietaryEnabled={event.rsvpFields.dietary?.enabled !== false}
        />
        <WaitlistPanel slug={event.slug} capacity={event.capacity} />
        <GuestbookModeration slug={event.slug} />
        <AlbumModeration
          slug={event.slug}
          enabled={Boolean(event.albumEnabled)}
        />
        <OpenTracking slug={event.slug} />
        <GuestManager
          slug={event.slug}
          locale={locale}
          initialRsvps={rsvps}
          questions={event.rsvpFields.customQuestions ?? []}
        />
        <SeatingChart event={event} rsvps={rsvps} />
        {event.checkInEnabled ? <CheckInPanel slug={event.slug} /> : null}
        <Suspense fallback={null}>
          <HostActions
            slug={event.slug}
            locale={locale}
            canDelete={canDelete}
            tier={event.tier ?? "free"}
            emailCredits={event.emailCredits ?? 0}
            smsCredits={event.smsCredits ?? 0}
            unlockedPackIds={event.unlockedPackIds ?? []}
            registryClicks={event.registryClicks ?? 0}
            cashFundClicks={event.cashFundClicks ?? 0}
          />
        </Suspense>
      </div>
    </div>
  );
}
