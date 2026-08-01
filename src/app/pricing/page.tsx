import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent event pricing with custom domains — no ads, no coins, no per-guest math.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    detail: "Forever",
    points: [
      "Subdomain on ownvite.app",
      "Standard templates",
      "RSVP collection",
      "Ownvite footer",
    ],
    cta: "Start free",
    href: "/host/h-birthday-2026",
    featured: false,
  },
  {
    name: "Pro Event",
    price: "$29",
    detail: "One-time · launch $19",
    points: [
      "Custom domain + SSL",
      "No ads or watermark",
      "Premium themes & motion",
      "Guest messaging · 500 emails",
    ],
    cta: "Upgrade this event",
    href: "/host/h-birthday-2026",
    featured: true,
  },
  {
    name: "Studio",
    price: "$12",
    detail: "per month · or $99/yr",
    points: [
      "5 active events",
      "All Pro features",
      "Font & CSS overrides",
      "Analytics & priority support",
    ],
    cta: "Talk to us",
    href: "mailto:hello@ownvite.com",
    featured: false,
  },
];

export default function PricingPage() {
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
          href="/"
          className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]"
        >
          Ownvite
        </Link>
        <Link
          href="/e/h-birthday-2026"
          className="text-sm text-[var(--mist)] transition hover:text-[var(--ivory)]"
        >
          See demo invite →
        </Link>
      </header>

      <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-10 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--champagne)]">
          Pricing
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl leading-tight sm:text-5xl">
          Pay for the event, not the guest list
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--mist)]">
          Transparent one-time event passes with custom domains — no coin packs,
          no ads on your guests, no per-head surprise.
        </p>

        <div className="mt-14 grid gap-6 text-left md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col rounded-2xl border p-6 ${
                tier.featured
                  ? "border-[var(--champagne)]/50 bg-[var(--slate)] shadow-[0_0_0_1px_rgba(201,169,98,0.15)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {tier.featured && (
                <span className="mb-3 w-fit text-xs uppercase tracking-[0.2em] text-[var(--champagne)]">
                  Most popular
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
                href={tier.href}
                className={`mt-8 block rounded-md px-4 py-2.5 text-center text-sm font-medium transition ${
                  tier.featured
                    ? "bg-[var(--champagne)] text-[var(--ink)] hover:brightness-110"
                    : "border border-white/15 text-[var(--ivory)] hover:border-[var(--champagne)]/40"
                }`}
              >
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-12 text-sm text-[var(--mist)]">
          Agency / white-label from $199/mo —{" "}
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
