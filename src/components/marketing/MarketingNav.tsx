import type { ReactNode } from "react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type MarketingNavProps = {
  locale: Locale;
  path?: string;
  extra?: ReactNode;
  brand: ReactNode;
  maxWidthClass?: string;
};

export default function MarketingNav({
  locale,
  path = "/",
  extra,
  brand,
  maxWidthClass = "max-w-6xl",
}: MarketingNavProps) {
  const nav = getDictionary(locale).nav;

  const links = [
    { href: localePath(locale, "/marketplace"), label: nav.templates },
    { href: localePath(locale, "/domains"), label: nav.domains },
    { href: localePath(locale, "/pricing"), label: nav.pricing },
  ];
  const phoneLinks = [...links, { href: "/login", label: nav.signIn }];
  const linkClass = "transition hover:text-[var(--landing-rose-deep)]";

  return (
    <div>
      <div
        className={`mx-auto flex ${maxWidthClass} items-center justify-between px-5 py-3 sm:px-8 sm:py-5`}
      >
        {brand}
        <nav
          className="flex items-center justify-end gap-2.5 text-sm sm:gap-5"
          style={{ color: "var(--landing-ink)" }}
          aria-label={locale === "es" ? "Principal" : "Primary"}
        >
          <LanguageSwitcher locale={locale} path={path} variant="paper" />
          {extra ? <span className="hidden sm:inline">{extra}</span> : null}
          <div className="hidden items-center gap-5 sm:flex">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/login" className={`hidden sm:inline ${linkClass}`}>
            {nav.signIn}
          </Link>
          <Link
            href="/register"
            className="rounded-full px-3.5 py-2 font-medium text-white transition hover:opacity-95"
            style={{ background: "var(--landing-cta)" }}
          >
            {nav.signUp}
          </Link>
        </nav>
      </div>
      <nav
        className="border-t sm:hidden"
        style={{
          background: "rgba(255,252,250,0.96)",
          borderColor: "var(--landing-line)",
        }}
        aria-label={locale === "es" ? "Secciones" : "Sections"}
        data-marketing-phone-nav
      >
        <ul
          className={`mx-auto flex ${maxWidthClass} min-h-11 items-stretch gap-1 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          {extra ? (
            <li
              className="flex shrink-0 items-center border-r px-2"
              style={{ borderColor: "var(--landing-line)" }}
            >
              {extra}
            </li>
          ) : null}
          {phoneLinks.map((item) => (
            <li key={item.href} className="flex shrink-0 items-stretch">
              <Link
                href={item.href}
                className="flex min-h-11 items-center whitespace-nowrap px-3 text-sm font-medium"
                style={{ color: "var(--landing-ink)" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
