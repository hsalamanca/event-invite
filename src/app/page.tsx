import type { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getDictionary(locale).meta;
  return { title: { absolute: meta.title }, description: meta.description };
}

export default async function Home() {
  const locale = await getRequestLocale();
  return <LandingPage locale={locale} />;
}
