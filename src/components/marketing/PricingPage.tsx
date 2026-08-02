import Link from "next/link";
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
    <main className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 85% 20%, rgba(201,169,98,0.18) 0%, transparent 55%)",
        }}
      />
      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link
          href={localePath(locale, "/")}
          className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]"
        >
          Ownvite
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher locale={locale} path="/pricing" />
          <Link
            href={localePath(locale, "/e/h-birthday-2026")}
            className="text-sm text-[var(--mist)] transition hover:text-[var(--ivory)]"
          >
            {t.seeDemo}
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-10 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--champagne)]">
          {t.eyebrow}
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl leading-tight sm:text-5xl">
          {t.headline}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--mist)]">{t.support}</p>

        <div className="mt-14 grid gap-6 text-left md:grid-cols-3">
          {t.tiers.map((tier, i) => (
            <article
              key={tier.name}
              className={`flex flex-col rounded-2xl border p-6 ${
                i === 1
                  ? "border-[var(--champagne)]/50 bg-[var(--slate)] shadow-[0_0_0_1px_rgba(201,169,98,0.15)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {i === 1 && (
                <span className="mb-3 w-fit text-xs uppercase tracking-[0.2em] text-[var(--champagne)]">
                  {t.mostPopular}
                </span>
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
                    <span className="text-[var(--champagne)]">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href={hrefs[i]!}
                className={`mt-8 block rounded-md px-4 py-2.5 text-center text-sm font-medium transition ${
                  i === 1
                    ? "bg-[var(--champagne)] text-[var(--ink)] hover:brightness-110"
                    : "border border-white/15 text-[var(--ivory)] hover:border-[var(--champagne)]/40"
                }`}
              >
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-left text-sm text-[var(--mist)]">
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

        <p className="mt-12 text-sm text-[var(--mist)]">
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
