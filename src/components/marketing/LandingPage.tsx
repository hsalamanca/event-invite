"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import InviteCraft from "@/components/marketing/InviteCraft";
import LandingReveal from "@/components/marketing/LandingReveal";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=2400&q=85&auto=format&fit=crop";

const CRAFT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80&auto=format&fit=crop",
    alt: "Candlelit dinner table set for a celebration",
  },
  {
    src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80&auto=format&fit=crop",
    alt: "Garden gathering with flowers and soft daylight",
  },
  {
    src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80&auto=format&fit=crop",
    alt: "Champagne and confetti for a milestone night",
  },
];

const GUEST_IMAGE =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80&auto=format&fit=crop";

const displayFont: CSSProperties = {
  fontFamily: "var(--font-fraunces), 'Fraunces', Georgia, serif",
};

const bodyFont: CSSProperties = {
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
};

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

  return (
    <main
      className="landing-root relative min-h-screen overflow-x-hidden"
      style={
        {
          ...bodyFont,
          "--landing-ink": "#1A1714",
          "--landing-muted": "#5C564E",
          "--landing-paper": "#F7F3EE",
          "--landing-paper-2": "#EDE6DC",
          "--landing-cedar": "#6B5338",
          "--landing-cedar-deep": "#534028",
          "--landing-line": "#D9D0C4",
          "--landing-fg": "#1A1714",
          "--landing-soft": "#5C564E",
          "--landing-accent": "#6B5338",
          "--landing-surface": "#FFFFFF",
          background:
            "linear-gradient(180deg, #F7F3EE 0%, #EDE6DC 48%, #F7F3EE 100%)",
          color: "var(--landing-ink)",
        } as CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "multiply",
        }}
      />

      <section className="relative z-10 min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt=""
            className="h-full w-full object-cover object-[center_35%]"
            fetchPriority="high"
            style={{
              transform: heroReady ? "scale(1)" : "scale(1.04)",
              opacity: heroReady ? 1 : 0,
              transition:
                "opacity 800ms ease-out, transform 900ms ease-out",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(26,23,20,0.45) 0%, rgba(26,23,20,0.32) 34%, rgba(26,23,20,0.78) 72%, rgba(26,23,20,0.9) 100%)",
            }}
          />
        </div>

        <header
          className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6"
          style={{
            opacity: heroReady ? 1 : 0,
            transition: "opacity 600ms ease 80ms",
          }}
        >
          <BrandLogo tone="ivory" height={28} href="/" />
          <nav className="flex flex-wrap items-center justify-end gap-3 text-sm text-white/85 sm:gap-5">
            <LanguageSwitcher
              locale={locale}
              path="/"
              variant="marketing"
            />
            <Link
              href={localePath(locale, "/domains")}
              className="hidden transition hover:text-white sm:inline"
            >
              {nav.domains}
            </Link>
            <Link
              href={localePath(locale, "/pricing")}
              className="hidden transition hover:text-white sm:inline"
            >
              {nav.pricing}
            </Link>
            <Link href="/login" className="transition hover:text-white">
              {nav.signIn}
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-white/95 px-3.5 py-2 font-medium text-[var(--landing-ink)] transition hover:bg-white"
            >
              {nav.signUp}
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] max-w-6xl flex-col justify-end px-5 pb-16 pt-12 sm:px-8 sm:pb-24">
          <div className="max-w-2xl text-white">
            <h1
              style={{
                ...displayFont,
                fontSize: "clamp(3.4rem, 10vw, 6.25rem)",
                fontWeight: 600,
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(14px)",
                transition:
                  "opacity 700ms ease 120ms, transform 700ms ease 120ms",
              }}
            >
              {t.brand}
            </h1>
            <p
              style={{
                ...displayFont,
                marginTop: "1.25rem",
                fontSize: "clamp(1.65rem, 3.6vw, 2.6rem)",
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: "-0.015em",
                color: "rgba(255,255,255,0.96)",
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(14px)",
                transition:
                  "opacity 700ms ease 180ms, transform 700ms ease 180ms",
              }}
            >
              {t.headline}
            </p>
            <p
              style={{
                marginTop: "1.25rem",
                maxWidth: "28rem",
                fontSize: "1.125rem",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.88)",
                textShadow: "0 1px 12px rgba(26,23,20,0.35)",
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(14px)",
                transition:
                  "opacity 700ms ease 240ms, transform 700ms ease 240ms",
              }}
            >
              {t.support}
            </p>
            <div
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              style={{
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "translateY(0)" : "translateY(14px)",
                transition:
                  "opacity 700ms ease 300ms, transform 700ms ease 300ms",
              }}
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md px-6 py-3.5 text-sm font-semibold text-white transition"
                style={{
                  background: "var(--landing-cedar)",
                  boxShadow: "0 1px 2px rgba(26,23,20,0.12)",
                }}
              >
                {t.ctaStart}
              </Link>
              <Link
                href={localePath(locale, "/e/h-birthday-2026")}
                className="inline-flex items-center justify-center px-2 py-3.5 text-sm font-medium text-white/90 underline-offset-[6px] transition hover:underline sm:px-4"
              >
                {t.ctaDemo}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how"
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
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

          <LandingReveal delayMs={120} className="mt-14 sm:mt-16">
            <div
              className="overflow-hidden rounded-md border bg-white"
              style={{
                borderColor: "var(--landing-line)",
                boxShadow: "0 1px 2px rgba(26,23,20,0.06)",
              }}
            >
              <div
                className="flex items-center gap-2 border-b px-4 py-3"
                style={{ borderColor: "var(--landing-line)" }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#E4D8C8]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E4D8C8]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E4D8C8]" />
                <span
                  className="ml-3 flex-1 truncate rounded px-3 py-1.5 text-center text-xs sm:text-sm"
                  style={{
                    background: "var(--landing-paper)",
                    color: "var(--landing-muted)",
                  }}
                >
                  https://{t.domainUrl}
                </span>
              </div>
              <div
                className="relative px-6 py-16 text-center sm:py-20"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 80% at 50% 0%, #F3EBE0 0%, #F7F3EE 55%, #EDE6DC 100%)",
                }}
              >
                <p
                  style={{
                    ...displayFont,
                    fontSize: "0.875rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--landing-cedar)",
                  }}
                >
                  Ownvite
                </p>
                <p
                  style={{
                    ...displayFont,
                    marginTop: "1rem",
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                    fontWeight: 600,
                    color: "var(--landing-ink)",
                  }}
                >
                  {t.headline}
                </p>
                <p
                  className="mx-auto mt-4 max-w-md"
                  style={{ color: "var(--landing-muted)" }}
                >
                  {t.support}
                </p>
              </div>
            </div>
          </LandingReveal>
        </div>
      </section>

      <section
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
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
              {t.craftTitle}
            </h2>
            <p
              className="mt-5 max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--landing-muted)" }}
            >
              {t.craftBody}
            </p>
          </LandingReveal>
          <LandingReveal delayMs={100} className="mt-12">
            <InviteCraft captions={t.craftCaptions} images={CRAFT_IMAGES} />
          </LandingReveal>
        </div>
      </section>

      <section
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
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
                      color: "var(--landing-cedar)",
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

          <LandingReveal delayMs={120} className="mt-16">
            <div
              className="overflow-hidden rounded-md"
              style={{ aspectRatio: "21 / 9" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={GUEST_IMAGE}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </LandingReveal>
        </div>
      </section>

      <section
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
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
        <div
          className="mx-auto max-w-3xl px-5 py-28 text-center sm:px-8 sm:py-36"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(107,83,56,0.06) 0%, transparent 60%)",
          }}
        >
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
                className="inline-flex items-center justify-center rounded-md px-7 py-3.5 text-sm font-semibold text-white transition"
                style={{
                  background: "var(--landing-cedar)",
                  boxShadow: "0 1px 2px rgba(26,23,20,0.12)",
                }}
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
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--landing-muted)" }}
              >
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
          <BrandLogo tone="ink" height={22} href="/" />
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href={localePath(locale, "/domains")}
              className="transition hover:opacity-100"
              style={{ color: "inherit" }}
            >
              {nav.domains}
            </Link>
            <Link
              href={localePath(locale, "/pricing")}
              className="transition hover:opacity-100"
              style={{ color: "inherit" }}
            >
              {nav.pricing}
            </Link>
            <Link
              href="/register"
              className="transition hover:opacity-100"
              style={{ color: "inherit" }}
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
