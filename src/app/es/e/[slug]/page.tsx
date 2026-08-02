import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InvitePage from "@/components/invite/InvitePage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getEventBySlug } from "@/lib/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Invitación no encontrada" };
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

export default async function SpanishEventInvitePage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event || !event.published) notFound();

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-30">
        <LanguageSwitcher locale="es" path={`/e/${slug}`} />
      </div>
      <InvitePage event={event} locale="es" />
    </div>
  );
}
