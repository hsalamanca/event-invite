import type { ReactNode } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import {
  displayFont,
  paperGrainStyle,
  paperThemeVars,
} from "@/lib/marketing-theme";

type PaperAppShellProps = {
  locale: Locale;
  path: string;
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  support?: string;
  actions?: ReactNode;
  headerRight?: ReactNode;
  maxWidthClass?: string;
};

/** Shared paper chrome for dashboard / admin / create flows. */
export default function PaperAppShell({
  locale,
  path,
  children,
  eyebrow,
  title,
  support,
  actions,
  headerRight,
  maxWidthClass = "max-w-5xl",
}: PaperAppShellProps) {
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
          <BrandLogo href="/" tone="ink" height={28} />
          <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
            <LanguageSwitcher locale={locale} path={path} variant="paper" />
            {headerRight}
          </div>
        </div>
      </header>

      <div className={`relative z-10 mx-auto ${maxWidthClass} px-5 py-10 sm:px-8`}>
        {(eyebrow || title || support || actions) && (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {eyebrow ? (
                <p
                  className="text-xs uppercase tracking-[0.28em]"
                  style={{ color: "var(--landing-cedar)" }}
                >
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h1
                  className="mt-2"
                  style={{
                    ...displayFont,
                    fontSize: "clamp(2rem, 4vw, 2.75rem)",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: "var(--landing-ink)",
                  }}
                >
                  {title}
                </h1>
              ) : null}
              {support ? (
                <p
                  className="mt-2 max-w-lg"
                  style={{ color: "var(--landing-muted)" }}
                >
                  {support}
                </p>
              ) : null}
            </div>
            {actions}
          </div>
        )}
        {children}
      </div>
    </main>
  );
}

export function PaperButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  if (variant === "primary") {
    return (
      <Link
        href={href}
        className="rounded-md px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
        style={{ background: "var(--landing-cedar)" }}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-md border px-3 py-1.5 text-sm transition hover:border-[var(--landing-cedar)]"
      style={{
        borderColor: "var(--landing-line)",
        color: "var(--landing-ink)",
      }}
    >
      {children}
    </Link>
  );
}
