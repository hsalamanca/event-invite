import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintPlaceCards } from "@/components/invite/PrintSuite";
import { getEventBySlug } from "@/lib/events";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Place cards" };
  return { title: `Place cards · ${event.title}` };
}

export default async function PlaceCardsPrintPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  return (
    <PrintPlaceCards
      event={event}
      tables={event.seatingTables ?? []}
    />
  );
}
