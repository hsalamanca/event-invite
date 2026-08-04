import Link from "next/link";
import MarketingShell from "@/components/marketing/MarketingShell";
import StudioCheckoutButton from "@/components/marketing/StudioCheckoutButton";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { displayFont } from "@/lib/marketing-theme";

export default function PricingPageView({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).pricing;

  const hrefs = [
    "/register",
    "/register?next=/dashboard",
    "/register?next=/pricing",
  ];

  return (
    <MarketingShell
      locale={locale}
      path="/pricing"
      headerExtra={
        <Link
          href={localePath(locale, "/e/h-birthday-2026")}
          className="hidden text-sm transition hover:text-[var(--landing-ink)] sm:inline"
          style={{ color: "var(--landing-muted)" }}
        >
          {t.seeDemo}
        </Link>
      }
    >
      <section className="mx-auto max-w-5xl px-5 pb-24 pt-14 text-center sm:px-8 sm:pt-20">
        <p
          className="mb-3 text-xs uppercase tracking-[0.28em]"
          style={{ color: "var(--landing-cedar)" }}
        >
          {t.eyebrow}
        </p>
        <h1
          style={{
            ...displayFont,
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--landing-ink)",
          }}
        >
          {t.headline}
        </h1>
        <p
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--landing-muted)" }}
        >
          {t.support}
        </p>

        <div className="mt-14 grid gap-5 text-left md:grid-cols-3">
          {t.tiers.map((tier, i) => (
            <article
              key={tier.name}
              className="relative flex flex-col rounded-md border p-6"
              style={{
                borderColor:
                  i === 1
                    ? "var(--landing-cedar)"
                    : "var(--landing-line)",
                background:
                  i === 1
                    ? "linear-gradient(180deg, rgba(107,83,56,0.06) 0%, #FFFFFF 40%)"
                    : "var(--landing-surface)",
                boxShadow: "0 1px 2px rgba(26,23,20,0.04)",
              }}
            >
              {i === 1 ? (
                <span
                  className="mb-3 w-fit text-xs uppercase tracking-[0.2em]"
                  style={{ color: "var(--landing-cedar)" }}
                >
                  {t.mostPopular}
                </span>
              ) : null}
              <h2
                style={{
                  ...displayFont,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "var(--landing-ink)",
                }}
              >
                {tier.name}
              </h2>
              <p className="mt-2 flex items-baseline gap-2">
                <span
                  className="text-3xl font-semibold"
                  style={{ color: "var(--landing-ink)" }}
                >
                  {tier.price}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--landing-muted)" }}
                >
                  {tier.detail}
                </span>
              </p>
              <ul
                className="mt-6 flex-1 space-y-3 text-sm"
                style={{ color: "var(--landing-muted)" }}
              >
                {tier.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span style={{ color: "var(--landing-cedar)" }} aria-hidden>
                      —
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              {i === 2 ? (
                <StudioCheckoutButton
                  label={tier.cta}
                  className="mt-8 block w-full rounded-md px-4 py-2.5 text-center text-sm font-semibold transition"
                  style={{
                    border: "1px solid var(--landing-line)",
                    color: "var(--landing-ink)",
                    background: "transparent",
                  }}
                />
              ) : (
                <Link
                  href={hrefs[i]!}
                  className="mt-8 block rounded-md px-4 py-2.5 text-center text-sm font-semibold transition"
                  style={
                    i === 1
                      ? {
                          background: "var(--landing-cedar)",
                          color: "#fff",
                        }
                      : {
                          border: "1px solid var(--landing-line)",
                          color: "var(--landing-ink)",
                          background: "transparent",
                        }
                  }
                >
                  {tier.cta}
                </Link>
              )}
            </article>
          ))}
        </div>

        <div
          className="mx-auto mt-16 max-w-2xl text-left text-sm"
          style={{ color: "var(--landing-muted)" }}
        >
          <h2
            style={{
              ...displayFont,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--landing-ink)",
            }}
          >
            {locale === "es" ? "Temas premium y extras" : "Premium themes & add-ons"}
          </h2>
          <ul className="mt-4 space-y-2">
            <li>
              {locale === "es"
                ? "Desbloqueo de un tema premium: $7 · pack de recordatorios (+100 emails): $9 · seating + check-in en Pro"
                : "Single premium theme unlock: $7 · Reminder Pack (+100 emails): $9 · seating + check-in in Pro"}
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
          className="mt-12 text-sm"
          style={{ color: "var(--landing-muted)" }}
        >
          {t.agency}{" "}
          <a
            href="mailto:hello@ownvite.com"
            className="underline-offset-2 hover:underline"
            style={{ color: "var(--landing-cedar)" }}
          >
            hello@ownvite.com
          </a>
        </p>
      </section>
    </MarketingShell>
  );
}
