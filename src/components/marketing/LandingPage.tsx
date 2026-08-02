import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=2000&q=80&auto=format&fit=crop";

export default function LandingPage({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).landing;
  const nav = getDictionary(locale).nav;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--ink)] text-[var(--ivory)]">
      {/* Full-bleed celebratory hero */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt=""
            className="h-full w-full object-cover object-center"
            style={{ animation: "ownvite-drift 22s ease-in-out infinite" }}
            fetchPriority="high"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,26,46,0.35) 0%, rgba(15,26,46,0.55) 42%, rgba(15,26,46,0.92) 100%), radial-gradient(ellipse 70% 55% at 20% 30%, rgba(255,200,87,0.28) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 85% 70%, rgba(224,122,95,0.22) 0%, transparent 50%)",
            }}
          />
        </div>

        {/* Soft ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full blur-3xl"
          style={{
            background: "rgba(255,200,87,0.35)",
            animation: "ownvite-glow-pulse 7s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-32 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: "rgba(224,122,95,0.28)",
            animation: "ownvite-glow-pulse 9s ease-in-out 1s infinite",
          }}
        />

        {/* Twinkling spark accents */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[
            { top: "16%", left: "10%", delay: "0s", size: 16 },
            { top: "26%", left: "76%", delay: "0.7s", size: 22 },
            { top: "58%", left: "86%", delay: "1.3s", size: 14 },
            { top: "70%", left: "16%", delay: "1.9s", size: 18 },
            { top: "38%", left: "52%", delay: "1.0s", size: 12 },
            { top: "48%", left: "30%", delay: "2.4s", size: 10 },
          ].map((s, i) => (
            <span
              key={i}
              className="absolute block"
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                background:
                  "radial-gradient(circle, #ffc857 0%, rgba(255,200,87,0.35) 40%, transparent 72%)",
                animation: `ownvite-twinkle 2.6s ease-in-out ${s.delay} infinite`,
              }}
            />
          ))}
        </div>

        <header
          className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6"
          style={{ animation: "ownvite-fade-in 0.7s ease both" }}
        >
          <BrandLogo tone="champagne" height={30} />
          <nav className="flex flex-wrap items-center justify-end gap-2.5 text-sm text-[var(--ivory)]/85 sm:gap-4">
            <LanguageSwitcher locale={locale} path="/" />
            <Link
              href={localePath(locale, "/domains")}
              className="hidden transition hover:text-[var(--champagne-bright)] sm:inline"
            >
              {nav.domains}
            </Link>
            <Link
              href={localePath(locale, "/pricing")}
              className="hidden transition hover:text-[var(--champagne-bright)] sm:inline"
            >
              {nav.pricing}
            </Link>
            <Link
              href="/login"
              className="transition hover:text-[var(--champagne-bright)]"
            >
              {nav.signIn}
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-[var(--champagne)] px-3.5 py-2 font-medium text-[var(--ink)] transition hover:brightness-110"
            >
              {nav.signUp}
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5.5rem)] max-w-6xl flex-col justify-end px-6 pb-16 pt-10 sm:pb-20">
          <div className="max-w-2xl">
            <p
              className="mb-3 font-[family-name:var(--font-cormorant)] text-[clamp(3.25rem,11vw,6rem)] font-semibold leading-none tracking-tight text-[var(--champagne-bright)]"
              style={{ animation: "ownvite-fade-up 0.85s ease both" }}
            >
              {t.brand}
            </p>
            <h1
              className="font-[family-name:var(--font-cormorant)] text-[clamp(1.75rem,4.5vw,2.85rem)] leading-[1.1] tracking-tight text-[var(--ivory)]"
              style={{ animation: "ownvite-fade-up 0.9s ease 0.08s both" }}
            >
              {t.headline1}{" "}
              <span className="text-[var(--sun)]">{t.headline2}</span>
            </h1>
            <p
              className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--ivory)]/85"
              style={{ animation: "ownvite-fade-up 0.9s ease 0.16s both" }}
            >
              {t.support}
            </p>
            <div
              className="mt-9 flex flex-wrap gap-3"
              style={{ animation: "ownvite-fade-up 0.9s ease 0.24s both" }}
            >
              <Link
                href="/register"
                className="cta-shimmer rounded-md px-6 py-3.5 text-sm font-semibold text-[var(--ink)] transition hover:brightness-105"
              >
                {t.ctaStart}
              </Link>
              <Link
                href={localePath(locale, "/e/h-birthday-2026")}
                className="rounded-md border border-[var(--ivory)]/35 bg-white/5 px-6 py-3.5 text-sm font-medium text-[var(--ivory)] backdrop-blur-sm transition hover:border-[var(--champagne)]/70 hover:bg-white/10"
              >
                {t.ctaDemo}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* One job: why Ownvite feels joyful to host with */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,169,98,0.14) 0%, transparent 55%), linear-gradient(180deg, #121f38 0%, #0f1a2e 100%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-24">
          <p
            className="text-xs uppercase tracking-[0.28em] text-[var(--champagne)]"
            style={{ animation: "ownvite-fade-up 0.7s ease both" }}
          >
            {locale === "es" ? "Hecho para celebrar" : "Made for celebrating"}
          </p>
          <div className="mt-10 grid gap-12 md:grid-cols-3 md:gap-10">
            {t.features.map((feature, i) => (
              <div
                key={feature.title}
                className="group"
                style={{
                  animation: `ownvite-rise 0.8s ease ${0.1 + i * 0.12}s both`,
                }}
              >
                <div
                  className="mb-4 h-1 w-10 origin-left rounded-full bg-[var(--champagne)] transition duration-500 group-hover:w-16"
                  style={{
                    animation: `ownvite-shimmer 4s linear ${i * 0.4}s infinite`,
                    backgroundImage:
                      "linear-gradient(90deg, #c9a962, #ffc857, #e07a5f, #c9a962)",
                    backgroundSize: "200% 100%",
                  }}
                />
                <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[var(--ivory)]">
                  {feature.title}
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--mist)]">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing invitation */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 100%, rgba(224,122,95,0.18) 0%, transparent 55%), linear-gradient(180deg, #0f1a2e 0%, #15243d 100%)",
          }}
        />
        <div
          className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center"
          style={{ animation: "ownvite-fade-up 0.85s ease both" }}
        >
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2rem,4vw,3rem)] leading-tight">
            {t.compareTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--mist)]">
            {t.compareBody}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="cta-shimmer rounded-md px-6 py-3.5 text-sm font-semibold text-[var(--ink)]"
            >
              {t.ctaStart}
            </Link>
            <Link
              href={localePath(locale, "/pricing")}
              className="text-sm font-medium text-[var(--champagne-bright)] underline-offset-4 transition hover:underline"
            >
              {t.seePricing}
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-sm text-[var(--mist)]">
        {t.footer}
      </footer>
    </main>
  );
}
