import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HostStudioShell from "@/components/host/HostStudioShell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getEventBySlug } from "@/lib/events";
import { listRsvpsByEventId } from "@/lib/rsvp-store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: getDictionary(locale).host.customize };
}

export default async function HostEditorPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();
  const rsvps = await listRsvpsByEventId(event.id);
  const locale = await getRequestLocale();

  return <HostStudioShell event={event} rsvps={rsvps} locale={locale} />;
}
