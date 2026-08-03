"use client";

import { useCallback, useEffect, useState } from "react";
import type { WaitlistEntry } from "@/lib/types";

export function WaitlistPanel({
  slug,
  capacity,
}: {
  slug: string;
  capacity: number | null;
}) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!capacity) return;
    try {
      const res = await fetch(
        `/api/waitlist?slug=${encodeURIComponent(slug)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { entries?: WaitlistEntry[] };
      setEntries(data.entries ?? []);
    } catch {
      /* ignore */
    }
  }, [slug, capacity]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!capacity) return null;

  async function remove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(
        `/api/waitlist?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Could not remove");
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove");
    } finally {
      setBusyId(null);
    }
  }

  async function copyLink(email: string) {
    setInfo(null);
    try {
      const url = `${window.location.origin}/e/${slug}?e=${encodeURIComponent(email)}`;
      await navigator.clipboard.writeText(url);
      setInfo(`Copied personal invite link for ${email}`);
      setTimeout(() => setInfo(null), 2500);
    } catch {
      setError("Could not copy link");
    }
  }

  return (
    <section className="scroll-mt-24 border-t border-white/10 pt-8">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
          Waitlist
        </h2>
        <p className="mt-1 text-sm text-[var(--mist)]">
          Guests who joined when the event hit capacity ({capacity} seats).
          Copy a personal link when a seat opens.
        </p>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="mt-3 text-sm text-[var(--champagne)]">{info}</p>
      ) : null}
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--mist)]">
          No one on the waitlist yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {entries.map((e, idx) => (
            <li
              key={e.id}
              className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block">
                    #{idx + 1} · {e.name}
                    {e.guestCount > 1 ? ` (+${e.guestCount - 1})` : ""}
                  </strong>
                  <p className="mt-0.5 text-sm text-[var(--mist)]">{e.email}</p>
                  {e.note ? (
                    <p className="mt-1 text-sm text-[var(--mist)]">{e.note}</p>
                  ) : null}
                  <time className="mt-2 block text-xs text-[var(--mist)]/70">
                    {new Date(e.createdAt).toLocaleString()}
                  </time>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="rounded border border-white/15 px-2.5 py-1 text-xs text-[var(--mist)] hover:border-[var(--champagne)]/50 hover:text-[var(--champagne)]"
                    onClick={() => void copyLink(e.email)}
                  >
                    Copy link
                  </button>
                  <button
                    type="button"
                    className="rounded border border-white/15 px-2.5 py-1 text-xs text-[var(--mist)] hover:border-red-400/40 hover:text-red-200"
                    disabled={busyId === e.id}
                    onClick={() => void remove(e.id)}
                  >
                    {busyId === e.id ? "…" : "Remove"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
