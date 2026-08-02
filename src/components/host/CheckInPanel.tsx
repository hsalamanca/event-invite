"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  name: string;
  email: string;
  attendance: string;
  guestCount: number;
  checkedIn: boolean;
  checkedInAt: string | null;
};

export function CheckInPanel({ slug }: { slug: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/check-in`);
      if (!res.ok) return;
      const data = (await res.json()) as { rsvps?: Row[] };
      if (data.rsvps) setRows(data.rsvps);
    } catch {
      /* ignore */
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(id: string, checkedIn: boolean) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpId: id, checkedIn }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Check-in failed");
        return;
      }
      await load();
    } catch {
      setError("Check-in failed");
    } finally {
      setBusy(null);
    }
  }

  const attending = rows.filter((r) =>
    r.attendance.toLowerCase().includes("attend"),
  );
  const filtered = attending.filter((r) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return (
      r.name.toLowerCase().includes(needle) ||
      r.email.toLowerCase().includes(needle)
    );
  });
  const inCount = attending.filter((r) => r.checkedIn).length;

  return (
    <section className="scroll-mt-24 border-t border-white/10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
            Door check-in
          </h2>
          <p className="mt-1 text-sm text-[var(--mist)]">
            {inCount} / {attending.length} checked in
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search guest…"
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
        />
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[var(--coral)]">{error}</p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {filtered.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm"
          >
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-[var(--mist)]">
                {r.email}
                {r.guestCount > 1 ? ` · ${r.guestCount} guests` : ""}
              </div>
            </div>
            <button
              type="button"
              disabled={busy === r.id}
              onClick={() => void toggle(r.id, !r.checkedIn)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60 ${
                r.checkedIn
                  ? "border border-white/20 text-[var(--mist)]"
                  : "bg-[var(--champagne)] text-[var(--ink)]"
              }`}
            >
              {r.checkedIn ? "Undo" : "Check in"}
            </button>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="py-6 text-sm text-[var(--mist)]">
            No attending guests to check in yet.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
