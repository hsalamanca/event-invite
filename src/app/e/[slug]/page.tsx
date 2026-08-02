import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import InvitePage from "@/components/invite/InvitePage";
import InviteUnlock from "@/components/invite/InviteUnlock";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getEventBySlug } from "@/lib/events";

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
  return {
    title: event.title,
    description: event.tagline,
    openGraph: {
      title: event.headline,
      description: event.tagline,
      images: [{ url: event.heroImage }],
    },
  };
}

export default async function EventInvitePage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event || !event.published) notFound();
  const locale = await getRequestLocale();

  if (
    event.visibility === "private" &&
    event.invitePasswordHash
  ) {
    const jar = await cookies();
    const unlocked = isUnlocked(jar.get(UNLOCK_COOKIE)?.value, slug);
    if (!unlocked) {
      return <InviteUnlock slug={slug} title={event.title} />;
    }
  }

  // Never send password hash to the client
  const safeEvent = { ...event, invitePasswordHash: null };

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-30">
        <LanguageSwitcher locale={locale} />
      </div>
      <InvitePage event={safeEvent} locale={locale} />
    </div>
  );
}
