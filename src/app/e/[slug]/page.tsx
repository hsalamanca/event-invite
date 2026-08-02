import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InvitePage from "@/components/invite/InvitePage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getEventBySlug } from "@/lib/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
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
  const event = getEventBySlug(slug);
  if (!event || !event.published) notFound();
  const locale = await getRequestLocale();

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-30">
        <LanguageSwitcher locale={locale} />
      </div>
      <InvitePage event={event} locale={locale} />
    </div>
  );
}
