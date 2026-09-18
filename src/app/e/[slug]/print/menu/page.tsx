import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrintMenu from "@/components/invite/PrintSuite";
import { getEventBySlug } from "@/lib/events";
import { canAccessGuestPrintSuite } from "@/lib/print-access";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!canAccessGuestPrintSuite(event)) return { title: "Menu" };
  return { title: `Menu · ${event.title}` };
}

export default async function MenuPrintPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!canAccessGuestPrintSuite(event)) notFound();
  return <PrintMenu event={event} />;
}
