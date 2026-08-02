"use client";

import { useEffect, useState } from "react";
import type { DomainBinding, DnsRecordInstruction } from "@/lib/domain-types";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type DomainConnectProps = {
  slug: string;
  initialDomain?: string | null;
  onDomainChange?: (domain: string | null) => void;
  locale?: Locale;
};

type StatusPayload = {
  binding: DomainBinding | null;
  platformUrls: {
    path: string;
    subdomain: string;
  } | null;
};

export default function DomainConnect({
  slug,
  initialDomain,
  onDomainChange,
  locale = "en",
}: DomainConnectProps) {
  const t = getDictionary(locale).domainConnect;
  const [domainInput, setDomainInput] = useState(initialDomain ?? "");
  const [binding, setBinding] = useState<DomainBinding | null>(null);
  const [platformUrls, setPlatformUrls] = useState<StatusPayload["platformUrls"]>(
    null
  );
  const [dns, setDns] = useState<DnsRecordInstruction[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch(`/api/domains?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) return;
    const data = (await res.json()) as StatusPayload;
    setBinding(data.binding);
    setPlatformUrls(data.platformUrls);
    if (data.binding) {
      setDomainInput(data.binding.domain);
      setDns(data.binding.dns);
      onDomainChange?.(data.binding.domain);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function connect() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, domain: domainInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not connect domain");
      setBinding(data.binding);
      setDns(data.instructions?.dns ?? data.binding?.dns ?? []);
      setMessage(
        data.binding?.status === "active"
          ? "Domain is already live."
          : "Domain registered. Add the DNS records below, then click Verify."
      );
      onDomainChange?.(data.binding.domain);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verify failed");
      setBinding(data.binding);
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!binding) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/domains?slug=${encodeURIComponent(slug)}&domain=${encodeURIComponent(binding.domain)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not remove domain");
      setBinding(null);
      setDns([]);
      setMessage("Custom domain removed. Guests can still use your Ownvite link.");
      onDomainChange?.(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setBusy(false);
    }
  }

  const status = binding?.status ?? null;

  return (
    <section className="domain-connect">
      <header className="domain-head">
        <h2>{t.title}</h2>
        <p>{t.intro}</p>
      </header>

      {platformUrls && (
        <div className="domain-platform">
          <p className="label">{t.alwaysWorks}</p>
          <a href={platformUrls.path} target="_blank" rel="noreferrer">
            {platformUrls.path}
          </a>
          <p className="label">{t.freeSub}</p>
          <a href={platformUrls.subdomain} target="_blank" rel="noreferrer">
            {platformUrls.subdomain}
          </a>
          <p className="hint">{t.subHint}</p>
        </div>
      )}

      <label className="domain-input">
        <span>{t.yourDomain}</span>
        <div className="row">
          <input
            value={domainInput}
            placeholder="party.yourdomain.com"
            onChange={(e) => setDomainInput(e.target.value)}
            disabled={busy}
          />
          <button type="button" onClick={connect} disabled={busy || !domainInput.trim()}>
            {busy ? t.working : binding ? t.update : t.connect}
          </button>
        </div>
      </label>

      {status && (
        <p className={`status status-${status}`}>
          {t.status}: <strong>{status.replace("_", " ")}</strong>
          {binding?.vercelVerified ? " · SSL" : ""}
        </p>
      )}

      {dns.length > 0 && (
        <div className="dns-box">
          <h3>{t.dnsTitle}</h3>
          <p>{t.dnsIntro}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.type}</th>
                  <th>{t.host}</th>
                  <th>{t.value}</th>
                </tr>
              </thead>
              <tbody>
                {dns.map((record) => (
                  <tr key={`${record.type}-${record.host}-${record.value}`}>
                    <td>
                      <code>{record.type}</code>
                    </td>
                    <td>
                      <code>{record.host}</code>
                    </td>
                    <td>
                      <code>{record.value}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="tips">
            {t.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <div className="actions">
            <button type="button" className="primary" onClick={verify} disabled={busy}>
              {t.verify}
            </button>
            {binding && (
              <button type="button" className="ghost" onClick={disconnect} disabled={busy}>
                {t.remove}
              </button>
            )}
          </div>
        </div>
      )}

      {message && <p className="msg ok">{message}</p>}
      {error && <p className="msg err">{error}</p>}

      <p className="more">
        {t.more}{" "}
        <a href={localePath(locale, "/domains")}>
          ownvite.com{localePath(locale, "/domains")}
        </a>
      </p>

      <style jsx>{`
        .domain-connect {
          border: 1px solid color-mix(in srgb, var(--host-accent) 28%, transparent);
          background: color-mix(in srgb, var(--host-surface) 80%, transparent);
          padding: 1.25rem;
          border-radius: 12px;
          display: grid;
          gap: 1rem;
        }
        .domain-head h2 {
          margin: 0 0 0.35rem;
          font-size: 1.15rem;
          font-weight: 500;
        }
        .domain-head p {
          margin: 0;
          color: var(--host-muted);
          font-size: 0.92rem;
          line-height: 1.45;
        }
        .domain-platform {
          display: grid;
          gap: 0.35rem;
          font-size: 0.88rem;
        }
        .domain-platform .label {
          margin: 0.4rem 0 0;
          color: var(--host-muted);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .domain-platform a {
          color: var(--host-accent);
          word-break: break-all;
        }
        .hint {
          margin: 0.25rem 0 0;
          color: var(--host-muted);
          font-size: 0.8rem;
        }
        .domain-input span {
          display: block;
          margin-bottom: 0.35rem;
          font-size: 0.85rem;
          color: var(--host-muted);
        }
        .row {
          display: flex;
          gap: 0.5rem;
        }
        .row input {
          flex: 1;
          min-height: 42px;
          border-radius: 8px;
          border: 1px solid color-mix(in srgb, var(--host-muted) 35%, transparent);
          background: var(--host-bg);
          color: var(--host-text);
          padding: 0.5rem 0.75rem;
        }
        .row button,
        .actions button {
          min-height: 42px;
          border-radius: 8px;
          border: none;
          padding: 0 0.9rem;
          background: var(--host-accent);
          color: var(--host-bg);
          font-weight: 600;
          cursor: pointer;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .actions .ghost {
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--host-muted) 40%, transparent);
          color: var(--host-text);
        }
        .status {
          margin: 0;
          font-size: 0.9rem;
        }
        .status-active {
          color: #8fd19e;
        }
        .status-pending_dns,
        .status-verifying {
          color: var(--host-accent);
        }
        .dns-box h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
        }
        .dns-box p {
          margin: 0 0 0.75rem;
          color: var(--host-muted);
          font-size: 0.88rem;
        }
        .table-wrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        th,
        td {
          text-align: left;
          padding: 0.5rem 0.4rem;
          border-bottom: 1px solid color-mix(in srgb, var(--host-muted) 25%, transparent);
        }
        code {
          font-size: 0.82em;
        }
        .tips {
          margin: 0.75rem 0 0;
          padding-left: 1.1rem;
          color: var(--host-muted);
          font-size: 0.82rem;
        }
        .msg {
          margin: 0;
          font-size: 0.88rem;
        }
        .msg.ok {
          color: #8fd19e;
        }
        .msg.err {
          color: #f0a090;
        }
        .more {
          margin: 0;
          font-size: 0.85rem;
          color: var(--host-muted);
        }
        .more a {
          color: var(--host-accent);
        }
      `}</style>
    </section>
  );
}
