"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { EventTier } from "@/lib/types";

export default function HostActions({
  slug,
  locale = "en",
  canDelete,
  tier = "free",
  emailCredits = 0,
}: {
  slug: string;
  locale?: Locale;
  canDelete: boolean;
  tier?: EventTier;
  emailCredits?: number;
}) {
  const t = getDictionary(locale).hostActions;
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (search.get("upgraded") === "1") {
      setInfo(
        "Pro Event unlocked — domain, premium themes, check-in, seating, 500-email blasts.",
      );
    }
    if (search.get("theme") === "1") {
      setInfo("Premium theme unlocked — apply it from the template list.");
    }
    if (search.get("credits") === "1") {
      setInfo("Reminder Pack added — +100 email credits for this event.");
    }
  }, [search]);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/e/${slug}`
      : `/e/${slug}`;

  const isPro = tier === "pro" || tier === "studio";

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

  async function remind(type: "invite" | "rsvp_reminder" | "event_reminder") {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/events/${slug}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        preview?: number;
        note?: string;
      };
      if (!res.ok) {
        setError(data.error || t.error);
        return;
      }
      setInfo(
        `Emails: ${data.sent ?? 0} sent, ${data.preview ?? 0} preview.${
          data.note ? ` ${data.note}` : ""
        }`,
      );
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function checkout(
    product: "pro_event" | "reminder_pack" | "studio",
  ) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, product }),
      });
      const data = (await res.json()) as {
        error?: string;
        url?: string;
        alreadyPro?: boolean;
        alreadyStudio?: boolean;
        mailto?: string;
        note?: string;
      };
      if (data.alreadyPro || data.alreadyStudio) {
        setInfo(
          data.alreadyStudio
            ? "Studio is already active on your account."
            : "This event is already Pro.",
        );
        router.refresh();
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.mailto) {
        setInfo(
          data.note ||
            "Stripe not configured — email hello@ownvite.com to upgrade.",
        );
        window.location.href = data.mailto;
        return;
      }
      setError(data.error || t.error);
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
        {!isPro ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void checkout("pro_event")}
            className="rounded-md bg-[var(--champagne)] px-3 py-1.5 font-semibold text-[var(--ink)] disabled:opacity-60"
          >
            Upgrade to Pro · $29
          </button>
        ) : (
          <span className="rounded-md border border-[var(--champagne)]/40 px-3 py-1.5 text-[var(--champagne)]">
            {tier === "studio" ? "Studio" : "Pro Event"}
          </span>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void checkout("reminder_pack")}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40 disabled:opacity-60"
        >
          Reminder Pack · $9 (+100)
        </button>
        {tier !== "studio" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void checkout("studio")}
            className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40 disabled:opacity-60"
          >
            Studio · $12/mo
          </button>
        ) : null}
        {!isPro ? (
          <span className="rounded-md border border-white/10 px-3 py-1.5 text-[var(--mist)]">
            Credits: {emailCredits}
          </span>
        ) : null}
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
          href={`/e/${slug}/card`}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40"
        >
          Print / save-the-date
        </a>
        <a
          href={`/api/events/${slug}/qr?format=png`}
          download={`${slug}-qr.png`}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40"
        >
          Download QR
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
          onClick={() => void remind("rsvp_reminder")}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40 disabled:opacity-60"
        >
          Send RSVP reminders
        </button>
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
      {info ? (
        <p className="mt-2 text-sm text-[var(--champagne)]">{info}</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-[var(--coral)]">{error}</p>
      ) : null}
    </section>
  );
}
