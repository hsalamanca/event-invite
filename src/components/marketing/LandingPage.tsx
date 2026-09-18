import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import AddressBarMarquee from "@/components/marketing/AddressBarMarquee";
import LandingReveal from "@/components/marketing/LandingReveal";
import LandingStills from "@/components/marketing/LandingStills";
import MarketingNav from "@/components/marketing/MarketingNav";
import PeekFilmstrip from "@/components/marketing/PeekFilmstrip";
import { MARQUEE } from "@/lib/marquee-assets";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  bodyFont,
  displayFont,
  heroDisplayFont,
  paperGrainStyle,
  paperThemeVars,
} from "@/lib/marketing-theme";
import { PEEK_DEMO_PATH } from "@/lib/template-gallery";

export default function LandingPage({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).landing;
  const nav = getDictionary(locale).nav;
  const peekHref = localePath(locale, PEEK_DEMO_PATH);

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

      <section className="relative isolate min-h-[100svh]">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <picture>
            <source media="(min-width: 640px)" srcSet={MARQUEE.heroDesk} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MARQUEE.heroPhone}
              alt=""
              className="h-full w-full object-cover object-[center_18%] sm:object-center"
            />
          </picture>
          <div className="marquee-hero-veil absolute inset-0" />
        </div>

        <header
          className="relative z-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,252,250,0.9) 0%, rgba(255,252,250,0.45) 65%, transparent 100%)",
          }}
        >
          <MarketingNav
            locale={locale}
            path="/"
            brand={<BrandLogo tone="paper" height={26} href="/" />}
          />
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-6xl grid-cols-1 content-end gap-6 px-5 pb-8 pt-6 md:min-h-[calc(100svh-4.5rem)] md:grid-cols-2 md:items-center md:gap-12 md:px-8 md:pb-16">
          <div className="order-2 md:order-1">
            <h1
              className="max-w-xl text-balance"
              style={{
                ...heroDisplayFont,
                fontSize: "clamp(2.15rem, 9.2vw, 4.35rem)",
                fontWeight: 600,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                color: "#FFFCFA",
                textShadow: "0 2px 24px rgba(58,42,48,0.35)",
              }}
            >
              {t.headline}
            </h1>
            <p
              className="mt-3 max-w-lg text-base leading-snug sm:mt-4 sm:text-lg"
              style={{ color: "#FFFCFA" }}
            >
              {t.support}
            </p>
            <div className="mt-5 flex w-full max-w-md flex-col items-start gap-3 sm:mt-7">
              <Link
                href="/register"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 sm:w-auto sm:min-w-[12.5rem]"
                style={{
                  background: "var(--landing-cta)",
                  boxShadow: "0 8px 20px rgba(183,110,121,0.32)",
                }}
              >
                {t.ctaStart}
              </Link>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
                <Link
                  href={peekHref}
                  className="underline-offset-[5px] transition hover:underline"
                  style={{ color: "#FFFCFA" }}
                >
                  {t.ctaDemo} →
                </Link>
                <Link
                  href={localePath(locale, "/marketplace")}
                  className="underline-offset-[5px] transition hover:underline"
                  style={{ color: "rgba(255,252,250,0.82)" }}
                >
                  {t.ctaBrowse}
                </Link>
              </div>
            </div>
            <Link
              href={localePath(locale, "/pricing")}
              className="marquee-price mt-4 inline-flex max-w-md items-center rounded-lg px-3 py-2 text-xs leading-relaxed transition hover:opacity-90 sm:text-sm"
              style={{ color: "var(--landing-ink)" }}
            >
              {t.priceLine}
            </Link>
          </div>
          <div className="order-1 flex flex-col items-center md:order-2">
            <AddressBarMarquee urls={[t.mockUrl, t.demoUrl]} size="hero" />
            <p
              className="mt-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] sm:text-xs"
              style={{ color: "#FFFCFA" }}
            >
              {t.demoCredit}
            </p>
          </div>
        </div>
      </section>

      <section
        className="relative z-10 border-t"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <LandingReveal>
            <PeekFilmstrip
              locale={locale}
              title={t.filmstripTitle}
              captions={t.filmstripCaptions}
              peekLabel={t.ctaDemo}
            />
          </LandingReveal>
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
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8 sm:py-24">
          <LandingReveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MARQUEE.storyDomain}
              alt={
                locale === "es"
                  ? "yourevent.com llega al teléfono del invitado"
                  : "yourevent.com arriving on a guest’s phone"
              }
              className="w-full rounded-2xl"
              style={{
                boxShadow: "0 18px 40px rgba(58,42,48,0.1)",
                border: "1px solid var(--landing-champagne)",
              }}
            />
          </LandingReveal>
          <LandingReveal delayMs={80}>
            <p
              className="text-[11px] uppercase tracking-[0.28em]"
              style={{ color: "var(--landing-rose)" }}
            >
              {t.demoUrl}
            </p>
            <h2
              className="mt-3"
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
              className="mt-5 max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--landing-muted)" }}
            >
              {t.domainBody}
            </p>
            <div className="mt-8">
              <AddressBarMarquee urls={[t.mockUrl, t.demoUrl]} size="band" />
            </div>
            <Link
              href={localePath(locale, "/domains")}
              className="mt-6 inline-block text-sm font-medium underline-offset-[6px] transition hover:underline"
              style={{ color: "var(--landing-rose-deep)" }}
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
                className="inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-95"
                style={{ background: "var(--landing-cta)" }}
              >
                {t.ctaStart}
              </Link>
              <Link
                href={peekHref}
                className="text-sm font-semibold underline-offset-[6px] transition hover:underline"
                style={{ color: "var(--landing-rose-deep)" }}
              >
                {t.ctaDemo} →
              </Link>
              <Link
                href={localePath(locale, "/pricing")}
                className="text-sm font-medium underline-offset-[6px] transition hover:underline"
                style={{ color: "var(--landing-muted)" }}
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
