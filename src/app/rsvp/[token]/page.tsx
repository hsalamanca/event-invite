import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UpdateRsvpForm from "@/components/invite/UpdateRsvpForm";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getEventById } from "@/lib/events";
import { getRsvpByToken } from "@/lib/rsvp-store";

type PageProps = { params: Promise<{ token: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const rsvp = await getRsvpByToken(token);
  if (!rsvp) return { title: "Update RSVP" };
  const event = await getEventById(rsvp.eventId);
  return { title: event ? `Update RSVP · ${event.title}` : "Update RSVP" };
}

export default async function UpdateRsvpPage({ params }: PageProps) {
  const { token } = await params;
  const rsvp = await getRsvpByToken(token);
  if (!rsvp) notFound();
  const event = await getEventById(rsvp.eventId);
  if (!event) notFound();
  const locale = await getRequestLocale();

  return (
    <UpdateRsvpForm event={event} rsvp={rsvp} token={token} locale={locale} />
  );
}
