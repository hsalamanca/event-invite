import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { bodyFont, paperThemeVars } from "@/lib/marketing-theme";

/** Price honesty on preview surfaces — same line as home, no invented metrics. */
export default function PreviewPriceChrome({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).landing;

  return (
    <div
      className="sticky top-0 z-50 flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2.5 shadow-[0_8px_24px_rgba(26,23,20,0.06)] sm:px-6"
      style={{
        ...bodyFont,
        ...paperThemeVars,
        background: "var(--landing-paper)",
        borderColor: "var(--landing-champagne)",
      }}
    >
      <Link
        href={localePath(locale, "/pricing")}
        className="text-xs leading-relaxed transition hover:opacity-90 sm:text-sm"
        style={{ color: "var(--landing-muted)" }}
      >
        {t.priceLine}
      </Link>
      <Link
        href="/register"
        className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-95 sm:text-sm"
        style={{ background: "var(--landing-cta)" }}
      >
        {t.ctaStart}
      </Link>
      <div className="ml-auto">
        <LanguageSwitcher locale={locale} variant="invite" />
      </div>
    </div>
  );
}
