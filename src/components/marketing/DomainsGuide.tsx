import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  OWNVITE_APEX_IPS,
  OWNVITE_CNAME_TARGET,
} from "@/lib/dns-instructions";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function DomainsGuide({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).domains;

  return (
    <main className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(201,169,98,0.18), transparent 60%)",
        }}
      />

      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href={localePath(locale, "/")}
          className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]"
        >
          Ownvite
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher locale={locale} path="/domains" />
          <Link
            href={localePath(locale, "/host/h-birthday-2026")}
            className="text-sm text-[var(--mist)] hover:text-[var(--ivory)]"
          >
            {t.openStudio}
          </Link>
        </div>
      </header>

      <article className="relative mx-auto max-w-3xl px-6 pb-24 pt-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--champagne)]">
          {t.eyebrow}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl leading-tight sm:text-5xl">
          {t.headline}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--mist)]">{t.support}</p>

        <section className="mt-12 space-y-8">
          {t.steps.map((step) => (
            <div key={step.title}>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]">
                {step.title}
              </h2>
              <p className="mt-2 leading-relaxed text-[var(--mist)]">
                {step.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-14 rounded-2xl border border-white/10 bg-[var(--slate)]/50 p-6">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
            {t.cheatSheet}
          </h2>
          <p className="mt-2 text-sm text-[var(--mist)]">{t.cheatIntro}</p>

          <h3 className="mt-6 text-sm uppercase tracking-[0.18em] text-[var(--champagne)]">
            {t.subdomainTitle}
          </h3>
          <p className="mt-2 text-sm text-[var(--mist)]">{t.subdomainExample}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[var(--mist)]">
                <tr>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Host</th>
                  <th className="py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/10">
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

          <h3 className="mt-8 text-sm uppercase tracking-[0.18em] text-[var(--champagne)]">
            {t.apexTitle}
          </h3>
          <p className="mt-2 text-sm text-[var(--mist)]">{t.apexExample}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[var(--mist)]">
                <tr>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Host</th>
                  <th className="py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {OWNVITE_APEX_IPS.map((ip) => (
                  <tr key={ip} className="border-t border-white/10">
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
                <tr className="border-t border-white/10">
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
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]">
            {t.registrarTitle}
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--mist)]">
            {t.registrarTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]">
            {t.freeTitle}
          </h2>
          <p className="mt-3 text-[var(--mist)]">{t.freeIntro}</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--mist)]">
            <li>
              <code className="text-[var(--ivory)]">{t.freePath}</code>
            </li>
            <li>
              <code className="text-[var(--ivory)]">{t.freeSub}</code>
            </li>
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-[var(--champagne)]/30 bg-[var(--slate)]/40 p-6">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
            {t.tryTitle}
          </h2>
          <p className="mt-2 text-[var(--mist)]">{t.tryBody}</p>
          <Link
            href={localePath(locale, "/host/h-birthday-2026")}
            className="mt-5 inline-block rounded-md bg-[var(--champagne)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)]"
          >
            {t.tryCta}
          </Link>
        </section>
      </article>
    </main>
  );
}
