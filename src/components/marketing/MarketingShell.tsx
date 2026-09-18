import type { ReactNode } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import MarketingNav from "@/components/marketing/MarketingNav";
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
      className="paper-surface relative min-h-screen overflow-x-hidden"
      style={paperThemeVars}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={paperGrainStyle}
      />

      <header className="relative z-20 border-b border-[var(--landing-line)]">
        <MarketingNav
          locale={locale}
          path={path}
          extra={headerExtra}
          maxWidthClass={maxWidthClass}
          brand={
            <BrandLogo
              href={localePath(locale, "/")}
              tone="paper"
              height={28}
            />
          }
        />
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
              tone="paper"
              height={22}
            />
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link
                href={localePath(locale, "/marketplace")}
                className="transition hover:text-[var(--landing-ink)]"
              >
                {nav.templates}
              </Link>
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
