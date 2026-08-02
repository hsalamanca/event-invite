"use client";

import { useCallback, useEffect, useState } from "react";

type Summary = {
  total: number;
  last24h: number;
  days: { date: string; count: number }[];
};

export function OpenTracking({ slug }: { slug: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [ignored, setIgnored] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [viewsRes, guestsRes] = await Promise.all([
        fetch(`/api/events/${encodeURIComponent(slug)}/views`),
        fetch(`/api/guests?slug=${encodeURIComponent(slug)}`),
      ]);
      if (viewsRes.ok) {
        const data = (await viewsRes.json()) as { summary?: Summary };
        if (data.summary) setSummary(data.summary);
      }
      if (guestsRes.ok) {
        const data = (await guestsRes.json()) as {
          guests?: { status: string }[];
          rsvps?: unknown[];
        };
        const invited = (data.guests ?? []).filter(
          (g) => g.status === "invited",
        ).length;
        setIgnored(invited);
      }
    } catch {
      /* ignore */
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="scroll-mt-24 border-t border-white/10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
            Open tracking
          </h2>
          <p className="mt-1 text-sm text-[var(--mist)]">
            Invite page views and guests who still haven’t opened after an
            invite.
          </p>
        </div>
        <a
          href={`/api/events/${encodeURIComponent(slug)}/views?format=csv`}
          className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:border-[var(--champagne)]/40"
        >
          Export opens CSV
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="min-w-[7rem] rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
          <strong className="block text-xl">{summary?.total ?? "—"}</strong>
          <span className="text-sm text-[var(--mist)]">Total opens</span>
        </div>
        <div className="min-w-[7rem] rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
          <strong className="block text-xl">{summary?.last24h ?? "—"}</strong>
          <span className="text-sm text-[var(--mist)]">Last 24h</span>
        </div>
        <div className="min-w-[7rem] rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
          <strong className="block text-xl">{ignored ?? "—"}</strong>
          <span className="text-sm text-[var(--mist)]">Still invited</span>
        </div>
      </div>
      {summary?.days?.length ? (
        <ul className="mt-4 space-y-1 text-sm text-[var(--mist)]">
          {summary.days.slice(0, 7).map((d) => (
            <li key={d.date} className="flex justify-between gap-4 border-b border-white/5 py-1">
              <span>{d.date}</span>
              <span>{d.count} opens</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[var(--mist)]">
          Opens appear after guests visit the invite link.
        </p>
      )}
    </section>
  );
}
