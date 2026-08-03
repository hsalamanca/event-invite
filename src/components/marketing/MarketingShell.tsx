import type { ReactNode } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  bodyFont,
  paperGrainStyle,
  paperThemeVars,
} from "@/lib/marketing-theme";

type MarketingShellProps = {
  locale?: Locale;
  children: ReactNode;
  /** Active path for language switcher refresh */
  path?: string;
  /** Extra header actions (right side, before auth links) */
  headerExtra?: ReactNode;
  /** Show marketing footer */
  footer?: boolean;
  /** Constrain main content width */
  maxWidthClass?: string;
};

export default function MarketingShell({
  locale = "en",
  children,
  path = "/",
  headerExtra,
  footer = true,
  maxWidthClass = "max-w-5xl",
}: MarketingShellProps) {
  const nav = getDictionary(locale).nav;
  const t = getDictionary(locale).landing;

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={paperThemeVars}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={paperGrainStyle}
      />

      <header className="relative z-20 border-b border-[var(--landing-line)]">
        <div
          className={`mx-auto flex ${maxWidthClass} items-center justify-between gap-4 px-5 py-5 sm:px-8`}
        >
          <BrandLogo
            href={localePath(locale, "/")}
            tone="ink"
            height={28}
          />
          <nav
            className="flex flex-wrap items-center justify-end gap-3 text-sm sm:gap-5"
            style={{ ...bodyFont, color: "var(--landing-muted)" }}
          >
            <LanguageSwitcher
              locale={locale}
              path={path}
              variant="paper"
            />
            {headerExtra}
            <Link
              href={localePath(locale, "/domains")}
              className="hidden transition hover:text-[var(--landing-ink)] sm:inline"
            >
              {nav.domains}
            </Link>
            <Link
              href={localePath(locale, "/pricing")}
              className="hidden transition hover:text-[var(--landing-ink)] sm:inline"
            >
              {nav.pricing}
            </Link>
            <Link
              href="/login"
              className="transition hover:text-[var(--landing-ink)]"
            >
              {nav.signIn}
            </Link>
            <Link
              href="/register"
              className="rounded-md px-3.5 py-2 font-medium text-white transition hover:opacity-95"
              style={{ background: "var(--landing-cedar)" }}
            >
              {nav.signUp}
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      {footer ? (
        <footer className="relative z-10 border-t border-[var(--landing-line)] px-5 py-10 sm:px-8">
          <div
            className={`mx-auto flex ${maxWidthClass} flex-col items-center justify-between gap-4 text-sm sm:flex-row`}
            style={{ color: "var(--landing-muted)", ...bodyFont }}
          >
            <BrandLogo
              href={localePath(locale, "/")}
              tone="ink"
              height={22}
            />
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link
                href={localePath(locale, "/domains")}
                className="transition hover:text-[var(--landing-ink)]"
              >
                {nav.domains}
              </Link>
              <Link
                href={localePath(locale, "/pricing")}
                className="transition hover:text-[var(--landing-ink)]"
              >
                {nav.pricing}
              </Link>
              <Link
                href="/register"
                className="transition hover:text-[var(--landing-ink)]"
              >
                {nav.signUp}
              </Link>
            </div>
            <p>{t.footer}</p>
          </div>
        </footer>
      ) : null}
    </main>
  );
}
