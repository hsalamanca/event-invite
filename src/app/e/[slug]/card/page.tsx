import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrintCard from "@/components/invite/PrintCard";
import { getEventBySlug } from "@/lib/events";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Save the date" };
  return { title: `Save the date · ${event.title}` };
}

export default async function CardPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event || !event.published) notFound();
  const base =
    process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`
      : "https://ownvite.com";
  return (
    <PrintCard
      event={event}
      inviteUrl={`${base}/e/${event.slug}`}
      qrUrl={`/api/events/${event.slug}/qr?format=png`}
    />
  );
}
