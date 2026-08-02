import type { Metadata } from "next";
import PricingPageView from "@/components/marketing/PricingPage";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: getDictionary("es").pricing.title,
  description: getDictionary("es").pricing.support,
};

export default function SpanishPricingPage() {
  return <PricingPageView locale="es" />;
}
