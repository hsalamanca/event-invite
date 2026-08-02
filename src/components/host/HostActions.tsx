"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function HostActions({
  slug,
  locale = "en",
  canDelete,
}: {
  slug: string;
  locale?: Locale;
  canDelete: boolean;
}) {
  const t = getDictionary(locale).hostActions;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/e/${slug}`
      : `/e/${slug}`;

  async function copyLink() {
    try {
      const url = `${window.location.origin}/e/${slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t.copyFail);
    }
  }

  async function duplicate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${slug}/duplicate`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        event?: { slug: string };
      };
      if (!res.ok || !data.event) {
        setError(data.error || t.error);
        return;
      }
      router.push(`/host/${data.event.slug}`);
      router.refresh();
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!canDelete) return;
    if (!window.confirm(t.deleteConfirm)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || t.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`You're invited: ${inviteUrl}`)}`;
  const mail = `mailto:?subject=${encodeURIComponent("You're invited")}&body=${encodeURIComponent(inviteUrl)}`;

  return (
    <section className="border-t border-white/10 pt-8">
      <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-[var(--mist)]">{t.support}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => void copyLink()}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40"
        >
          {copied ? t.copied : t.copy}
        </button>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40"
        >
          WhatsApp
        </a>
        <a
          href={mail}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40"
        >
          Email
        </a>
        <a
          href={`/api/events/${slug}/ics`}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40"
        >
          {t.calendar}
        </a>
        <button
          type="button"
          disabled={busy}
          onClick={() => void duplicate()}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40 disabled:opacity-60"
        >
          {t.duplicate}
        </button>
        {canDelete ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void remove()}
            className="rounded-md border border-red-400/40 px-3 py-1.5 text-red-200 hover:bg-red-500/10 disabled:opacity-60"
          >
            {t.delete}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[var(--coral)]">{error}</p>
      ) : null}
    </section>
  );
}
