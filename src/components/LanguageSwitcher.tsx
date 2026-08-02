import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
  /** Path without locale prefix, e.g. `/pricing` or `/host/x` */
  path?: string;
};

export default function LanguageSwitcher({
  locale,
  path = "/",
}: LanguageSwitcherProps) {
  const nextLocale: Locale = locale === "en" ? "es" : "en";
  const label = locale === "en" ? "ES" : "EN";
  const href = localePath(nextLocale, path);

  return (
    <Link
      href={href}
      hrefLang={nextLocale}
      className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium tracking-wide text-[var(--mist)] transition hover:border-[var(--champagne)]/40 hover:text-[var(--ivory)]"
      aria-label={locale === "en" ? "Cambiar a español" : "Switch to English"}
    >
      {label}
    </Link>
  );
}
