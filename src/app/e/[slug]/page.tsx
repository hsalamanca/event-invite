import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import InvitePage from "@/components/invite/InvitePage";
import InviteUnlock from "@/components/invite/InviteUnlock";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getEventBySlug } from "@/lib/events";
import { listRsvpsByEventId } from "@/lib/rsvp-store";
import { stripAboutHtml } from "@/lib/sanitize-about";
import { resolveLocalizedInviteCopy } from "@/lib/templates";
import { shouldShowOwnviteFooter } from "@/lib/tier";
import { fetchEventWeather } from "@/lib/weather";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const UNLOCK_COOKIE = "OWNVITE_INVITE_UNLOCK";

function isUnlocked(cookieValue: string | undefined, slug: string): boolean {
  if (!cookieValue) return false;
  return cookieValue.split(",").map((s) => s.trim()).includes(slug);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Invitation not found" };
  const locale = await getRequestLocale();
  const { headline, tagline } = resolveLocalizedInviteCopy(event, locale);
  const plainTagline = stripAboutHtml(tagline);
  return {
    title: event.title,
    description: plainTagline,
    openGraph: {
      title: headline,
      description: plainTagline,
      images: [{ url: event.heroImage }],
    },
  };
}

export default async function EventInvitePage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event || !event.published) notFound();
  const locale = await getRequestLocale();

  if (event.visibility === "private" && event.invitePasswordHash) {
    const jar = await cookies();
    const unlocked = isUnlocked(jar.get(UNLOCK_COOKIE)?.value, slug);
    if (!unlocked) {
      return <InviteUnlock slug={slug} title={event.title} />;
    }
  }

  const rsvps = await listRsvpsByEventId(event.id);
  const seatsTaken = rsvps
    .filter((r) => r.attendance.toLowerCase().includes("attend"))
    .reduce((n, r) => n + (r.guestCount || 1), 0);
  const atCapacity =
    event.capacity != null && event.capacity > 0 && seatsTaken >= event.capacity;

  const today = new Date().toISOString().slice(0, 10);
  const isPast = Boolean(event.dateISO && event.dateISO < today);

  const weather =
    !isPast && event.address
      ? await fetchEventWeather({
          address: event.address,
          dateISO: event.dateISO,
        })
      : null;

  const safeEvent = {
    ...event,
    invitePasswordHash: null,
    showOwnviteFooter: shouldShowOwnviteFooter(event),
  };

  return (
    <div className="relative">
      <div className="absolute right-3 top-3 z-30 sm:right-5 sm:top-5">
        <LanguageSwitcher locale={locale} variant="invite" />
      </div>
      <InvitePage
        event={safeEvent}
        locale={locale}
        seatsTaken={seatsTaken}
        atCapacity={atCapacity}
        isPast={isPast}
        weather={weather}
      />
    </div>
  );
}
