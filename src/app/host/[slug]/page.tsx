import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EventCustomizer from "@/components/host/EventCustomizer";
import { getEventBySlug } from "@/lib/events";
import { listRsvpsByEventId } from "@/lib/rsvp-store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Customize invitation",
};

export default async function HostEditorPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const rsvps = await listRsvpsByEventId(event.id);
  const attending = rsvps.filter((r) =>
    r.attendance.toLowerCase().includes("attend")
  ).length;

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--ink)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-[family-name:var(--font-cormorant)] text-xl tracking-wide text-[var(--champagne)]"
            >
              Gatherly
            </Link>
            <span className="hidden text-sm text-[var(--mist)] sm:inline">
              Host studio · {event.title}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-md border border-white/10 bg-[var(--slate)] px-3 py-1.5 text-[var(--mist)]">
              {rsvps.length} RSVP{rsvps.length === 1 ? "" : "s"} · {attending}{" "}
              yes
            </span>
            <Link
              href={`/e/${event.slug}`}
              className="rounded-md bg-[var(--champagne)] px-3 py-1.5 font-medium text-[var(--ink)] transition hover:brightness-110"
            >
              View invite
            </Link>
          </div>
        </div>
      </header>
      <EventCustomizer event={event} />
    </div>
  );
}
