import { Suspense } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { AlbumModeration } from "@/components/host/AlbumModeration";
import { CheckInPanel } from "@/components/host/CheckInPanel";
import { AnalyticsFunnelPanel } from "@/components/host/AnalyticsFunnelPanel";
import { CollabPresenceBanner } from "@/components/host/CollabPresenceBanner";
import { DeliveryInbox } from "@/components/host/DeliveryInbox";
import EventCustomizer from "@/components/host/EventCustomizer";
import { GiftsThankYouPanel } from "@/components/host/GiftsThankYouPanel";
import { GuestBookPanel } from "@/components/host/GuestBookPanel";
import GuestManager from "@/components/host/GuestManager";
import { GuestbookModeration } from "@/components/host/GuestbookModeration";
import HostActions from "@/components/host/HostActions";
import HostStudioTabs from "@/components/host/HostStudioTabs";
import { MealDashboard } from "@/components/host/MealDashboard";
import { OpenTracking } from "@/components/host/OpenTracking";
import { PrivacyCompliancePanel } from "@/components/host/PrivacyCompliancePanel";
import { SeatingChart } from "@/components/host/SeatingChart";
import { WaitlistPanel } from "@/components/host/WaitlistPanel";
import { isAttendingRsvp, seatsTaken } from "@/lib/attendance";
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
  const attending = rsvps.filter((rsvp) => isAttendingRsvp(rsvp)).length;
  const seats = seatsTaken(rsvps);

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
            <span className="rounded-md border border-white/10 bg-[var(--slate)] px-2 py-1 text-xs text-[var(--mist)] sm:px-3 sm:py-1.5 sm:text-sm">
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
      <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6">
        <CollabPresenceBanner slug={event.slug} />
      </div>
      <HostStudioTabs
        labels={{
          tabDesign: t.tabDesign,
          tabGuests: t.tabGuests,
          tabShare: t.tabShare,
          tabDayOf: t.tabDayOf,
        }}
        hasRsvps={rsvps.length > 0}
        dayOfEmpty={t.dayOfEmpty}
        design={<EventCustomizer event={event} locale={locale} />}
        guests={
          <>
            <GuestManager
              slug={event.slug}
              locale={locale}
              initialRsvps={rsvps}
              questions={event.rsvpFields.customQuestions ?? []}
            />
            <MealDashboard
              rsvps={rsvps}
              questions={event.rsvpFields.customQuestions ?? []}
              dietaryEnabled={event.rsvpFields.dietary?.enabled !== false}
            />
            <WaitlistPanel slug={event.slug} capacity={event.capacity} />
            <GuestBookPanel slug={event.slug} />
          </>
        }
        share={
          <>
            <AnalyticsFunnelPanel slug={event.slug} />
            <OpenTracking slug={event.slug} />
            <DeliveryInbox slug={event.slug} />
            <PrivacyCompliancePanel slug={event.slug} />
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
          </>
        }
        dayOf={
          <>
            <SeatingChart event={event} rsvps={rsvps} />
            {event.checkInEnabled ? <CheckInPanel slug={event.slug} /> : null}
            <GuestbookModeration slug={event.slug} />
            <AlbumModeration
              slug={event.slug}
              enabled={Boolean(event.albumEnabled)}
            />
            <GiftsThankYouPanel slug={event.slug} />
          </>
        }
      />
    </div>
  );
}
