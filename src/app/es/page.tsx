import type { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: getDictionary("es").meta.title,
  description: getDictionary("es").meta.description,
};

export default function SpanishHome() {
  return <LandingPage locale="es" />;
}
