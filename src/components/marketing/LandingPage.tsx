"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import HeroCraftMock from "@/components/marketing/HeroCraftMock";
import LandingReveal from "@/components/marketing/LandingReveal";
import LandingSparkle from "@/components/marketing/LandingSparkle";
import LandingStills from "@/components/marketing/LandingStills";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  bodyFont,
  displayFont,
  paperGrainStyle,
  paperThemeVars,
} from "@/lib/marketing-theme";

export default function LandingPage({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).landing;
  const nav = getDictionary(locale).nav;
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setHeroReady(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setHeroReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const fade = (delay: number): CSSProperties => ({
    opacity: heroReady ? 1 : 0,
    transform: heroReady ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 700ms ease ${delay}ms, transform 700ms ease ${delay}ms`,
  });

  return (
    <main
      className="paper-surface landing-root relative min-h-screen overflow-x-hidden"
      style={{ ...bodyFont, ...paperThemeVars }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={paperGrainStyle}
      />
      <LandingSparkle />

      <header
        className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6"
        style={fade(40)}
      >
        <BrandLogo tone="paper" height={28} href="/" />
        <nav
          className="flex flex-wrap items-center justify-end gap-3 text-sm sm:gap-5"
          style={{ color: "var(--landing-muted)" }}
        >
          <LanguageSwitcher locale={locale} path="/" variant="paper" />
          <Link
            href={localePath(locale, "/marketplace")}
            className="transition hover:text-[var(--landing-ink)]"
          >
            {nav.templates}
          </Link>
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
            style={{ background: "var(--landing-rose)" }}
          >
            {nav.signUp}
          </Link>
        </nav>
      </header>

      <section className="relative z-10">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-12 pt-2 sm:gap-10 sm:px-8 sm:pb-20 sm:pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:pb-24 lg:pt-4">
          <div>
            <p
              className="text-xs uppercase tracking-[0.28em]"
              style={{ color: "var(--landing-rose)", ...fade(80) }}
            >
              {t.brand}
            </p>
            <h1
              className="mt-3 max-w-xl"
              style={{
                ...displayFont,
                fontSize: "clamp(2.35rem, 8vw, 4.4rem)",
                fontWeight: 600,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                color: "var(--landing-ink)",
                ...fade(120),
              }}
            >
              {t.headline}
            </h1>
            <p
              className="mt-4 max-w-md text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--landing-muted)", ...fade(180) }}
            >
              {t.support}
            </p>
            <div
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch"
              style={fade(240)}
            >
              <Link
                href="/register"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 sm:flex-none sm:px-7"
                style={{
                  background: "var(--landing-rose)",
                  boxShadow: "0 1px 2px rgba(143,78,88,0.18)",
                }}
              >
                {t.ctaStart}
              </Link>
              <Link
                href={localePath(locale, "/preview/quince-princesa")}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md px-6 py-3.5 text-sm font-semibold transition hover:bg-[var(--landing-blush)] sm:flex-none sm:px-7"
                style={{
                  border: "1.5px solid var(--landing-rose)",
                  color: "var(--landing-rose-deep)",
                }}
              >
                {t.ctaDemo}
              </Link>
            </div>
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "var(--landing-muted)", ...fade(300) }}
            >
              {t.priceLine}
            </p>
          </div>

          <div style={fade(160)}>
            <HeroCraftMock
              url={t.mockUrl}
              peekHref={localePath(locale, "/preview/quince-princesa")}
              peekLabel={t.ctaDemo}
            />
          </div>
        </div>
      </section>

      <section
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <LandingReveal>
            <LandingStills locale={locale} title={t.stillsTitle} />
          </LandingReveal>
        </div>
      </section>

      <section
        id="how"
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <LandingReveal className="mx-auto max-w-2xl text-center">
            <h2
              style={{
                ...displayFont,
                fontSize: "clamp(1.85rem, 3.4vw, 2.65rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "var(--landing-ink)",
              }}
            >
              {t.domainTitle}
            </h2>
            <p
              className="mx-auto mt-5 max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--landing-muted)" }}
            >
              {t.domainBody}
            </p>
            <Link
              href={localePath(locale, "/domains")}
              className="mt-6 inline-block text-sm font-medium underline-offset-[6px] transition hover:underline"
              style={{ color: "var(--landing-cedar)" }}
            >
              {t.domainLink}
            </Link>
          </LandingReveal>
        </div>
      </section>

      <section
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <LandingReveal className="max-w-2xl">
            <h2
              style={{
                ...displayFont,
                fontSize: "clamp(1.85rem, 3.4vw, 2.65rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {t.guestTitle}
            </h2>
            <p
              className="mt-5 max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--landing-muted)" }}
            >
              {t.guestBody}
            </p>
          </LandingReveal>

          <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {t.guestSteps.map((step, i) => (
              <LandingReveal key={step} delayMs={i * 80}>
                <li className="list-none">
                  <p
                    style={{
                      ...displayFont,
                      fontSize: "0.875rem",
                      letterSpacing: "0.18em",
                      color: "var(--landing-rose)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p
                    style={{
                      ...displayFont,
                      marginTop: "0.75rem",
                      fontSize: "1.5rem",
                      fontWeight: 500,
                      color: "var(--landing-ink)",
                    }}
                  >
                    {step}
                  </p>
                </li>
              </LandingReveal>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <LandingReveal className="max-w-2xl">
            <h2
              style={{
                ...displayFont,
                fontSize: "clamp(1.85rem, 3.4vw, 2.65rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {t.occasionsTitle}
            </h2>
            <p
              className="mt-5 max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--landing-muted)" }}
            >
              {t.occasionsBody}
            </p>
            <ul className="mt-10 space-y-4">
              {t.occasions.map((line) => (
                <li
                  key={line}
                  className="border-t pt-4 text-xl sm:text-2xl"
                  style={{
                    ...displayFont,
                    borderColor: "var(--landing-line)",
                    color: "var(--landing-ink)",
                  }}
                >
                  {line}
                </li>
              ))}
            </ul>
          </LandingReveal>
        </div>
      </section>

      <section
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <LandingReveal>
            <h2
              style={{
                ...displayFont,
                fontSize: "clamp(1.9rem, 3.6vw, 2.85rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {t.closeTitle}
            </h2>
            <p
              className="mx-auto mt-5 max-w-md text-lg leading-relaxed"
              style={{ color: "var(--landing-muted)" }}
            >
              {t.closeBody}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-md px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-95"
                style={{ background: "var(--landing-rose)" }}
              >
                {t.ctaStart}
              </Link>
              <Link
                href={localePath(locale, "/pricing")}
                className="text-sm font-medium underline-offset-[6px] transition hover:underline"
                style={{ color: "var(--landing-cedar)" }}
              >
                {t.seePricing}
              </Link>
              <p className="mt-2 text-sm" style={{ color: "var(--landing-muted)" }}>
                {t.closeNote}
              </p>
            </div>
          </LandingReveal>
        </div>
      </section>

      <footer
        className="relative z-10 border-t px-5 py-10 sm:px-8"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm sm:flex-row"
          style={{ color: "var(--landing-muted)" }}
        >
          <BrandLogo tone="paper" height={22} href="/" />
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
    </main>
  );
}
