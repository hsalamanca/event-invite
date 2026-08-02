import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  detectLocaleFromAcceptLanguage,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "./config";

/** Server-side locale from cookie (falls back to Accept-Language, then English). */
export async function getRequestLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const hdrs = await headers();
  const fromHeader = detectLocaleFromAcceptLanguage(
    hdrs.get("accept-language")
  );
  return fromHeader ?? defaultLocale;
}
