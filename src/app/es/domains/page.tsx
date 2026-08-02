import type { Metadata } from "next";
import DomainsGuide from "@/components/marketing/DomainsGuide";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: getDictionary("es").domains.title,
  description: getDictionary("es").domains.support,
};

export default function SpanishDomainsPage() {
  return <DomainsGuide locale="es" />;
}
