import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function LandingPage({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).landing;
  const nav = getDictionary(locale).nav;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ink)] text-[var(--ivory)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 70% 10%, rgba(224,122,95,0.16) 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 15% 80%, rgba(201,169,98,0.12) 0%, transparent 45%), linear-gradient(180deg, #0f1a2e 0%, #121f38 45%, #0f1a2e 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-[family-name:var(--font-cormorant)] text-2xl tracking-wide text-[var(--champagne)]">
          Ownvite
        </span>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm text-[var(--mist)] sm:gap-4">
          <LanguageSwitcher locale={locale} path="/" />
          <Link
            href={localePath(locale, "/domains")}
            className="hover:text-[var(--ivory)]"
          >
            {nav.domains}
          </Link>
          <Link
            href={localePath(locale, "/pricing")}
            className="hover:text-[var(--ivory)]"
          >
            {nav.pricing}
          </Link>
          <Link
            href="/login"
            className="hover:text-[var(--ivory)]"
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

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div
          className="max-w-xl"
          style={{ animation: "ownvite-fade-up 0.8s ease both" }}
        >
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[var(--champagne)]">
            {t.brand}
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.75rem,6vw,4.25rem)] leading-[1.05] tracking-tight">
            {t.headline1}
            <span className="block text-[var(--champagne)]">{t.headline2}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--mist)]">
            {t.support}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-md bg-[var(--champagne)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:brightness-110"
            >
              {t.ctaStart}
            </Link>
            <Link
              href={localePath(locale, "/e/h-birthday-2026")}
              className="rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-[var(--ivory)] transition hover:border-[var(--champagne)]/50"
            >
              {t.ctaDemo}
            </Link>
          </div>
        </div>

        <Link
          href={localePath(locale, "/e/h-birthday-2026")}
          className="group relative block overflow-hidden rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--champagne)]"
          style={{ animation: "ownvite-fade-up 0.9s ease 0.12s both" }}
        >
          <div className="aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80&auto=format&fit=crop"
              alt=""
              className="h-full w-full object-cover transition duration-[1.4s] ease-out group-hover:scale-105"
              style={{ animation: "ownvite-drift 18s ease-in-out infinite" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--champagne)]">
                {t.previewEyebrow}
              </p>
              <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl leading-tight sm:text-4xl">
                {t.previewHeadline}
              </p>
              <p className="mt-2 text-sm text-[var(--mist)]">{t.previewMeta}</p>
            </div>
          </div>
        </Link>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-[var(--slate)]/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-3">
          {t.features.map((feature, i) => (
            <div
              key={feature.title}
              style={{
                animation: `ownvite-fade-up 0.7s ease ${0.1 + i * 0.08}s both`,
              }}
            >
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]">
                {feature.title}
              </h2>
              <p className="mt-3 leading-relaxed text-[var(--mist)]">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl">
          {t.compareTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--mist)]">
          {t.compareBody}
        </p>
        <Link
          href={localePath(locale, "/pricing")}
          className="mt-8 inline-block text-sm font-medium text-[var(--champagne)] underline-offset-4 hover:underline"
        >
          {t.seePricing}
        </Link>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-sm text-[var(--mist)]">
        {t.footer}
      </footer>
    </main>
  );
}
