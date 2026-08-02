import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HostStudioShell from "@/components/host/HostStudioShell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getEventBySlug } from "@/lib/events";
import { listRsvpsByEventId } from "@/lib/rsvp-store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: getDictionary("es").host.customize,
};

export default async function SpanishHostEditorPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();
  const rsvps = await listRsvpsByEventId(event.id);

  return <HostStudioShell event={event} rsvps={rsvps} locale="es" />;
}
