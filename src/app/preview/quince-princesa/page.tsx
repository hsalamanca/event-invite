import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getQuincePrincesaPreviewEvent } from "@/lib/quince-princesa-preview";
import PreviewInvite from "../quince-tiara/PreviewInvite";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quince princesa preview" };

export default async function QuincePrincesaPreviewPage() {
  const locale = await getRequestLocale();
  const event = getQuincePrincesaPreviewEvent();

  return (
    <div className="relative">
      <div className="absolute right-3 top-14 z-30 sm:right-5 sm:top-16">
        <LanguageSwitcher locale={locale} variant="invite" />
      </div>
      <PreviewInvite event={event} locale={locale} />
    </div>
  );
}
