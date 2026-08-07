import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrintPostcard from "@/components/invite/PrintPostcard";
import { getEventBySlug } from "@/lib/events";
import { getRequestLocale } from "@/lib/i18n/locale";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: { absolute: "invite" } };
  // Browser "Save as PDF" uses document title as the default filename.
  const fileName = event.slug || event.title;
  return { title: { absolute: fileName } };
}

export default async function PostcardPrintPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const event = await getEventBySlug(slug);
  if (!event || !event.published) notFound();

  const base = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`
    : "https://ownvite.com";

  return (
    <PrintPostcard
      event={event}
      locale={locale}
      inviteUrl={`${base}/e/${event.slug}`}
      qrUrl={`/api/events/${event.slug}/qr?format=png`}
    />
  );
}
