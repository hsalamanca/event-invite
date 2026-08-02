import LandingPage from "@/components/marketing/LandingPage";
import { getRequestLocale } from "@/lib/i18n/locale";

export default async function Home() {
  const locale = await getRequestLocale();
  return <LandingPage locale={locale} />;
}
