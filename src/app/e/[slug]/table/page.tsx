"use client";

import { FormEvent, use, useState } from "react";
import Link from "next/link";

type TableResult = {
  guestName: string;
  tableName: string | null;
  seatLabel: string | null;
  eventTitle?: string;
  message?: string;
};

export default function FindTablePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TableResult | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const q = new URLSearchParams({ email: email.trim() });
      const res = await fetch(
        `/api/events/${encodeURIComponent(slug)}/table?${q.toString()}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not find your table");
      setResult(data as TableResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-10">
      <Link href={`/e/${slug}`} className="text-sm text-[var(--brand)] hover:underline">
        ← Back to invitation
      </Link>
      <h1 className="mt-4 font-display text-3xl text-[var(--ink)]">Find your table</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Enter the email you RSVP’d with to see your seating assignment.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[var(--ink)]">RSVP email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Looking up…" : "Find my table"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Seating for {result.guestName}
          </p>
          {result.tableName ? (
            <>
              <p className="mt-2 font-display text-3xl text-[var(--ink)]">
                {result.tableName}
              </p>
              {result.seatLabel && (
                <p className="mt-1 text-sm text-[var(--ink)]">Seat: {result.seatLabel}</p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {result.message || "You're on the list — table assignment coming soon."}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
