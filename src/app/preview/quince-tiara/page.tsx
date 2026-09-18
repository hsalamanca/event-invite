import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getQuinceTiaraPreviewEvent } from "@/lib/quince-tiara-preview";
import PreviewInvite from "./PreviewInvite";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quince tiara preview · Ownvite" };

export default async function QuinceTiaraPreviewPage() {
  const locale = await getRequestLocale();
  const event = getQuinceTiaraPreviewEvent();

  return (
    <div className="relative">
      <div className="absolute right-3 top-3 z-30 sm:right-5 sm:top-5">
        <LanguageSwitcher locale={locale} variant="invite" />
      </div>
      <PreviewInvite event={event} locale={locale} />
    </div>
  );
}
