import Link from "next/link";
import MarketingShell from "@/components/marketing/MarketingShell";
import {
  OWNVITE_APEX_IPS,
  OWNVITE_CNAME_TARGET,
} from "@/lib/dns-instructions";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { displayFont } from "@/lib/marketing-theme";

export default function DomainsGuide({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).domains;

  return (
    <MarketingShell
      locale={locale}
      path="/domains"
      maxWidthClass="max-w-3xl"
      headerExtra={
        <Link
          href={localePath(locale, "/host/h-birthday-2026")}
          className="hidden text-sm transition hover:text-[var(--landing-ink)] sm:inline"
          style={{ color: "var(--landing-muted)" }}
        >
          {t.openStudio}
        </Link>
      }
    >
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <p
          className="text-xs uppercase tracking-[0.28em]"
          style={{ color: "var(--landing-cedar)" }}
        >
          {t.eyebrow}
        </p>
        <h1
          className="mt-3"
          style={{
            ...displayFont,
            fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--landing-ink)",
          }}
        >
          {t.headline}
        </h1>
        <p
          className="mt-5 max-w-2xl text-lg leading-relaxed"
          style={{ color: "var(--landing-muted)" }}
        >
          {t.support}
        </p>

        <section className="mt-14 space-y-10">
          {t.steps.map((step) => (
            <div key={step.title}>
              <h2
                style={{
                  ...displayFont,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "var(--landing-ink)",
                }}
              >
                {step.title}
              </h2>
              <p
                className="mt-2 leading-relaxed"
                style={{ color: "var(--landing-muted)" }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </section>

        <section
          className="mt-14 rounded-md border p-6"
          style={{
            borderColor: "var(--landing-line)",
            background: "var(--landing-surface)",
            boxShadow: "0 1px 2px rgba(26,23,20,0.04)",
          }}
        >
          <h2
            style={{
              ...displayFont,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--landing-ink)",
            }}
          >
            {t.cheatSheet}
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--landing-muted)" }}
          >
            {t.cheatIntro}
          </p>

          <h3
            className="mt-6 text-sm uppercase tracking-[0.18em]"
            style={{ color: "var(--landing-cedar)" }}
          >
            {t.subdomainTitle}
          </h3>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--landing-muted)" }}
          >
            {t.subdomainExample}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ color: "var(--landing-muted)" }}>
                <tr>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Host</th>
                  <th className="py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t" style={{ borderColor: "var(--landing-line)" }}>
                  <td className="py-2 pr-3">
                    <code>CNAME</code>
                  </td>
                  <td className="py-2 pr-3">
                    <code>party</code>
                  </td>
                  <td className="py-2">
                    <code>{OWNVITE_CNAME_TARGET}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3
            className="mt-8 text-sm uppercase tracking-[0.18em]"
            style={{ color: "var(--landing-cedar)" }}
          >
            {t.apexTitle}
          </h3>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--landing-muted)" }}
          >
            {t.apexExample}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ color: "var(--landing-muted)" }}>
                <tr>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Host</th>
                  <th className="py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {OWNVITE_APEX_IPS.map((ip) => (
                  <tr
                    key={ip}
                    className="border-t"
                    style={{ borderColor: "var(--landing-line)" }}
                  >
                    <td className="py-2 pr-3">
                      <code>A</code>
                    </td>
                    <td className="py-2 pr-3">
                      <code>@</code>
                    </td>
                    <td className="py-2">
                      <code>{ip}</code>
                    </td>
                  </tr>
                ))}
                <tr
                  className="border-t"
                  style={{ borderColor: "var(--landing-line)" }}
                >
                  <td className="py-2 pr-3">
                    <code>CNAME</code>
                  </td>
                  <td className="py-2 pr-3">
                    <code>www</code>
                  </td>
                  <td className="py-2">
                    <code>{OWNVITE_CNAME_TARGET}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2
            style={{
              ...displayFont,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--landing-ink)",
            }}
          >
            {t.registrarTitle}
          </h2>
          <ul
            className="mt-4 list-disc space-y-2 pl-5"
            style={{ color: "var(--landing-muted)" }}
          >
            {t.registrarTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2
            style={{
              ...displayFont,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--landing-ink)",
            }}
          >
            {t.freeTitle}
          </h2>
          <p className="mt-3" style={{ color: "var(--landing-muted)" }}>
            {t.freeIntro}
          </p>
          <ul
            className="mt-3 list-disc space-y-2 pl-5"
            style={{ color: "var(--landing-muted)" }}
          >
            <li>
              <code style={{ color: "var(--landing-ink)" }}>{t.freePath}</code>
            </li>
            <li>
              <code style={{ color: "var(--landing-ink)" }}>{t.freeSub}</code>
            </li>
          </ul>
        </section>

        <section
          className="mt-14 rounded-md border p-6"
          style={{
            borderColor: "var(--landing-line)",
            background:
              "linear-gradient(180deg, rgba(107,83,56,0.05) 0%, var(--landing-surface) 50%)",
          }}
        >
          <h2
            style={{
              ...displayFont,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--landing-ink)",
            }}
          >
            {t.tryTitle}
          </h2>
          <p className="mt-2" style={{ color: "var(--landing-muted)" }}>
            {t.tryBody}
          </p>
          <Link
            href={localePath(locale, "/host/h-birthday-2026")}
            className="mt-5 inline-block rounded-md px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "var(--landing-cedar)" }}
          >
            {t.tryCta}
          </Link>
        </section>
      </article>
    </MarketingShell>
  );
}
