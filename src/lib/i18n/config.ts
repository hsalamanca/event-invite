export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Cookie that stores the visitor language preference (no URL prefix). */
export const LOCALE_COOKIE = "OWNVITE_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

/** Paths stay locale-agnostic — language is cookie-based. */
export function localePath(_locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "" ? "/" : clean;
}

export function detectLocaleFromAcceptLanguage(
  header: string | null
): Locale | null {
  if (!header) return null;
  const primary = header.split(",")[0]?.trim().toLowerCase() ?? "";
  if (primary.startsWith("es")) return "es";
  if (primary.startsWith("en")) return "en";
  return null;
}
