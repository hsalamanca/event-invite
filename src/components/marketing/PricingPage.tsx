import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function PricingPageView({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).pricing;

  const hrefs = [
    "/register",
    "/register?next=/dashboard",
    "mailto:hello@ownvite.com?subject=Ownvite%20Studio",
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ink)] text-[var(--ivory)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(255,200,87,0.16) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 15%, rgba(224,122,95,0.14) 0%, transparent 50%), radial-gradient(ellipse 60% 45% at 50% 100%, rgba(201,169,98,0.1) 0%, transparent 55%), linear-gradient(180deg, #121f38 0%, #0f1a2e 45%, #15243d 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,248,240,0.9) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Soft floating glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-4rem] top-24 h-64 w-64 rounded-full blur-3xl"
        style={{
          background: "rgba(255,200,87,0.22)",
          animation: "ownvite-glow-pulse 8s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-3rem] top-40 h-72 w-72 rounded-full blur-3xl"
        style={{
          background: "rgba(224,122,95,0.18)",
          animation: "ownvite-glow-pulse 10s ease-in-out 1.2s infinite",
        }}
      />

      <header
        className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-6"
        style={{ animation: "ownvite-fade-in 0.7s ease both" }}
      >
        <BrandLogo href={localePath(locale, "/")} tone="champagne" height={28} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher locale={locale} path="/pricing" />
          <Link
            href={localePath(locale, "/e/h-birthday-2026")}
            className="text-sm text-[var(--mist)] transition hover:text-[var(--champagne-bright)]"
          >
            {t.seeDemo}
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-10 text-center">
        <p
          className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--champagne)]"
          style={{ animation: "ownvite-fade-up 0.7s ease both" }}
        >
          {t.eyebrow}
        </p>
        <h1
          className="font-[family-name:var(--font-cormorant)] text-4xl leading-tight sm:text-5xl md:text-6xl"
          style={{ animation: "ownvite-fade-up 0.85s ease 0.08s both" }}
        >
          {t.headline}
        </h1>
        <p
          className="mx-auto mt-4 max-w-xl text-[var(--mist)]"
          style={{ animation: "ownvite-fade-up 0.85s ease 0.16s both" }}
        >
          {t.support}
        </p>

        <div className="mt-14 grid gap-6 text-left md:grid-cols-3">
          {t.tiers.map((tier, i) => (
            <article
              key={tier.name}
              className={`relative flex flex-col overflow-hidden rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 ${
                i === 1
                  ? "border-[var(--champagne)]/55 bg-gradient-to-b from-[rgba(255,200,87,0.12)] to-[var(--slate)] shadow-[0_0_48px_rgba(201,169,98,0.14)]"
                  : "border-white/10 bg-white/[0.03] hover:border-[var(--champagne)]/30 hover:bg-white/[0.05]"
              }`}
              style={{
                animation: `ownvite-rise 0.85s ease ${0.18 + i * 0.1}s both`,
              }}
            >
              {i === 1 && (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--champagne-bright)] to-transparent opacity-80"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[var(--sun)]/15 blur-3xl"
                    style={{
                      animation: "ownvite-glow-pulse 5s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="mb-3 w-fit text-xs uppercase tracking-[0.2em] text-[var(--champagne-bright)]"
                    style={{
                      animation: "ownvite-glow-pulse 3.5s ease-in-out infinite",
                    }}
                  >
                    {t.mostPopular}
                  </span>
                </>
              )}
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
                {tier.name}
              </h2>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--ivory)]">
                  {tier.price}
                </span>
                <span className="text-sm text-[var(--mist)]">{tier.detail}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--mist)]">
                {tier.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="text-[var(--champagne-bright)]" aria-hidden>
                      ✦
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href={hrefs[i]!}
                className={`mt-8 block rounded-md px-4 py-2.5 text-center text-sm font-medium transition ${
                  i === 1
                    ? "cta-shimmer text-[var(--ink)] hover:brightness-110"
                    : "border border-white/15 text-[var(--ivory)] hover:border-[var(--champagne)]/40"
                }`}
              >
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>

        <div
          className="mx-auto mt-16 max-w-2xl text-left text-sm text-[var(--mist)]"
          style={{ animation: "ownvite-fade-up 0.8s ease 0.4s both" }}
        >
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--ivory)]">
            {locale === "es" ? "Temas premium y extras" : "Premium themes & add-ons"}
          </h2>
          <ul className="mt-4 space-y-2">
            <li>
              {locale === "es"
                ? "Desbloqueo de un tema premium: $7 · packs de temporada: $12"
                : "Single premium theme unlock: $7 · seasonal packs: $12"}
            </li>
            <li>
              {locale === "es"
                ? "Dominio propio à la carte en Free: $9 · incluido en Pro"
                : "Custom domain à la carte on Free: $9 · included in Pro"}
            </li>
            <li>
              {locale === "es"
                ? "Emails/SMS extras · invitaciones con contraseña · check-in en puerta"
                : "Email/SMS overage · password invites · door check-in"}
            </li>
          </ul>
        </div>

        <p
          className="mt-12 text-sm text-[var(--mist)]"
          style={{ animation: "ownvite-fade-up 0.8s ease 0.48s both" }}
        >
          {t.agency}{" "}
          <a
            href="mailto:hello@ownvite.com"
            className="text-[var(--champagne)] underline-offset-2 hover:underline"
          >
            hello@ownvite.com
          </a>
        </p>
      </section>
    </main>
  );
}
