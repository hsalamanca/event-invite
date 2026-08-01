import type { Metadata } from "next";
import Link from "next/link";
import {
  OWNVITE_APEX_IPS,
  OWNVITE_CNAME_TARGET,
} from "@/lib/dns-instructions";

export const metadata: Metadata = {
  title: "Connect a custom domain",
  description:
    "Point your domain at Ownvite so guests open your invite on your hostname — with step-by-step DNS instructions.",
};

const steps = [
  {
    title: "1. Open Host studio",
    body: "Go to your event’s customize page and find Custom domain. Enter a hostname you control — we recommend a subdomain like party.yourname.com or bday.yourname.com.",
  },
  {
    title: "2. Click Connect",
    body: "Ownvite registers the hostname on our hosting edge and shows the exact DNS records to create. SSL certificates are issued automatically once DNS is correct.",
  },
  {
    title: "3. Add DNS at your registrar",
    body: "In Namecheap, Cloudflare, GoDaddy, Google Domains, Route 53, etc., open DNS for the parent domain and add the records Ownvite displays. Save, then return and click Verify DNS.",
  },
  {
    title: "4. Share your link",
    body: "When status is active, guests can open https://your-hostname — Ownvite serves the same invite as /e/your-slug, with your brand in the URL bar.",
  },
];

export default function DomainsGuidePage() {
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
          href="/"
          className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]"
        >
          Ownvite
        </Link>
        <Link
          href="/host/h-birthday-2026"
          className="text-sm text-[var(--mist)] hover:text-[var(--ivory)]"
        >
          Open host studio →
        </Link>
      </header>

      <article className="relative mx-auto max-w-3xl px-6 pb-24 pt-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--champagne)]">
          Custom domains
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl leading-tight sm:text-5xl">
          Point your domain at Ownvite
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--mist)]">
          Guests should see <em>your</em> hostname — not a long path under
          someone else&apos;s brand. Ownvite terminates SSL and routes the host
          to your event invite.
        </p>

        <section className="mt-12 space-y-8">
          {steps.map((step) => (
            <div key={step.title}>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]">
                {step.title}
              </h2>
              <p className="mt-2 text-[var(--mist)] leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-14 rounded-2xl border border-white/10 bg-[var(--slate)]/50 p-6">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
            DNS cheat sheet
          </h2>
          <p className="mt-2 text-sm text-[var(--mist)]">
            Exact hosts are shown in Host studio after you connect. These are
            the Ownvite targets:
          </p>

          <h3 className="mt-6 text-sm uppercase tracking-[0.18em] text-[var(--champagne)]">
            Subdomain (recommended)
          </h3>
          <p className="mt-2 text-sm text-[var(--mist)]">
            Example: <code className="text-[var(--ivory)]">party.yourdomain.com</code>
          </p>
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
            Apex / root domain
          </h3>
          <p className="mt-2 text-sm text-[var(--mist)]">
            Example: <code className="text-[var(--ivory)]">yourdomain.com</code>{" "}
            (harder — prefer a subdomain when you can)
          </p>
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
            Registrar tips
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--mist)]">
            <li>
              <strong className="text-[var(--ivory)]">Namecheap:</strong> Domain
              List → Manage → Advanced DNS → Add new record.
            </li>
            <li>
              <strong className="text-[var(--ivory)]">Cloudflare:</strong> DNS →
              Records. For CNAMEs, proxy status can be DNS only (gray cloud) while
              verifying; orange-cloud also works once proxied correctly.
            </li>
            <li>
              <strong className="text-[var(--ivory)]">GoDaddy:</strong> DNS →
              Manage DNS → Add. Delete existing records that conflict on the same
              host.
            </li>
            <li>
              TTL: use Automatic or 300 seconds while testing.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--champagne)]">
            Free Ownvite URLs (no custom domain)
          </h2>
          <p className="mt-3 text-[var(--mist)] leading-relaxed">
            Every event also gets:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--mist)]">
            <li>
              Path:{" "}
              <code className="text-[var(--ivory)]">
                https://ownvite.com/e/your-slug
              </code>
            </li>
            <li>
              Subdomain:{" "}
              <code className="text-[var(--ivory)]">
                https://your-slug.ownvite.app
              </code>{" "}
              (after platform wildcard DNS is active)
            </li>
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-[var(--champagne)]/30 bg-[var(--slate)]/40 p-6">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
            Try it on the birthday demo
          </h2>
          <p className="mt-2 text-[var(--mist)]">
            Connect a domain you own to the sample event and walk through Verify
            DNS end-to-end.
          </p>
          <Link
            href="/host/h-birthday-2026"
            className="mt-5 inline-block rounded-md bg-[var(--champagne)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)]"
          >
            Open host studio
          </Link>
        </section>
      </article>
    </main>
  );
}
