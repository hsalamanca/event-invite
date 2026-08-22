"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type GiftPledge = {
  id: string;
  name: string;
  email: string;
  kind: "registry" | "cash";
  amount?: number;
  note: string;
  createdAt: string;
};

type ThankYouItem = {
  id: string;
  guestName: string;
  email: string;
  note: string;
  status: "todo" | "sent";
  createdAt: string;
  sentAt?: string | null;
};

export function GiftsThankYouPanel({ slug }: { slug: string }) {
  const [pledges, setPledges] = useState<GiftPledge[]>([]);
  const [thankYous, setThankYous] = useState<ThankYouItem[]>([]);
  const [cashFundGoal, setCashFundGoal] = useState(0);
  const [cashFundRaised, setCashFundRaised] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/gifts`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load gifts");
      setPledges(data.pledges || []);
      setThankYous(data.thankYous || []);
      setCashFundGoal(Number(data.cashFundGoal || 0));
      setCashFundRaised(Number(data.cashFundRaised || 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markThanked(itemId: string) {
    const res = await fetch(`/api/events/${encodeURIComponent(slug)}/gifts`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_thanks", itemId }),
    });
    if (res.ok) void load();
  }

  async function onAddThankYou(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/gifts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "thankyou",
          guestName,
          note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save thank-you");
      setGuestName("");
      setNote("");
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--mist)]">Loading gifts…</p>;
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-[var(--slate)]/60 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--ivory)]">Registry & thank-yous</h3>
        <p className="text-xs text-[var(--mist)]">
          Track cash pledges and draft thank-you notes for guests.
        </p>
        {(cashFundGoal > 0 || cashFundRaised > 0) && (
          <p className="mt-2 text-sm text-[var(--ivory)]">
            Cash fund:{" "}
            <strong>
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(cashFundRaised)}
            </strong>
            {cashFundGoal > 0
              ? ` of ${new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(cashFundGoal)}`
              : ""}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--mist)]">
          Pledges ({pledges.length})
        </h4>
        {pledges.length === 0 ? (
          <p className="text-sm text-[var(--mist)]">No pledges yet.</p>
        ) : (
          <ul className="space-y-2">
            {pledges.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-white/10 bg-[var(--ink)]/40 px-3 py-2.5"
              >
                <p className="text-sm font-medium text-[var(--ivory)]">
                  {p.name}
                  {p.amount
                    ? ` · ${new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "USD",
                      }).format(p.amount)}`
                    : ""}
                  <span className="ml-2 text-xs font-normal text-[var(--mist)]">
                    {p.kind}
                  </span>
                </p>
                {p.note && <p className="text-xs text-[var(--mist)]">{p.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={onAddThankYou}
        className="space-y-2 rounded-xl border border-white/10 bg-[var(--ink)]/30 p-3"
      >
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--mist)]">
          Add thank-you note
        </h4>
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
          placeholder="Guest name"
          className="w-full rounded-lg border border-white/15 bg-[var(--ink)] px-3 py-2 text-sm text-[var(--ivory)]"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
          rows={3}
          placeholder="Thank-you message"
          className="w-full rounded-lg border border-white/15 bg-[var(--ink)] px-3 py-2 text-sm text-[var(--ivory)]"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--champagne)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save note"}
        </button>
      </form>

      {thankYous.length > 0 && (
        <ul className="space-y-2">
          {thankYous.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-white/10 bg-[var(--ink)]/40 px-3 py-2.5 text-sm"
            >
              <div>
                <p className="font-medium text-[var(--ivory)]">{t.guestName}</p>
                <p className="mt-1 text-[var(--mist)]">{t.note}</p>
              </div>
              {t.status === "sent" ? (
                <span className="text-xs text-emerald-300">Sent</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void markThanked(t.id)}
                  className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold text-[var(--ivory)]"
                >
                  Mark sent
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
