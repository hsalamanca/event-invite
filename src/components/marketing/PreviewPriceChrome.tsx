import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { bodyFont, paperThemeVars } from "@/lib/marketing-theme";

/** Price honesty on preview surfaces — same line as home, no invented metrics. */
export default function PreviewPriceChrome({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).landing;

  return (
    <div
      className="relative z-40 flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2.5 pr-24 sm:px-6 sm:pr-28"
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
    </div>
  );
}
