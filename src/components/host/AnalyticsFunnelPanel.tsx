"use client";

import { useCallback, useEffect, useState } from "react";

type AnalyticsPayload = {
  funnel: {
    invited: number;
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    pageOpens: number;
    rsvps: number;
    attending: number;
    declining: number;
    seats: number;
    checkedIn: number;
  };
  registry: {
    registryClicks: number;
    cashFundClicks: number;
    pledges: number;
    cashPledged: number;
    cashFundGoal: number | null;
    cashFundRaised: number | null;
  };
};

function rate(num: number, den: number) {
  if (!den) return null;
  return Math.round((num / den) * 100);
}

export function AnalyticsFunnelPanel({ slug }: { slug: string }) {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/analytics`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to load analytics");
      setData(json as AnalyticsPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-[var(--mist)]">Loading funnel…</p>;
  }
  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-rose-300">{error}</p>
        <button type="button" onClick={() => void load()} className="text-sm text-[var(--champagne)] underline">
          Retry
        </button>
      </div>
    );
  }
  if (!data) return null;

  const steps = [
    { label: "Invited", value: data.funnel.invited },
    {
      label: "Emails sent",
      value: data.funnel.emailsSent,
      pct: rate(data.funnel.emailsSent, data.funnel.invited),
    },
    {
      label: "Opened",
      value: data.funnel.emailsOpened,
      pct: rate(data.funnel.emailsOpened, data.funnel.emailsSent),
    },
    {
      label: "Clicked",
      value: data.funnel.emailsClicked,
      pct: rate(data.funnel.emailsClicked, data.funnel.emailsOpened),
    },
    { label: "Page opens", value: data.funnel.pageOpens },
    {
      label: "RSVP’d",
      value: data.funnel.rsvps,
      pct: rate(data.funnel.rsvps, data.funnel.invited),
    },
    { label: "Attending", value: data.funnel.attending },
  ];

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-[var(--slate)]/60 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ivory)]">Conversion funnel</h3>
          <p className="text-xs text-[var(--mist)]">
            Invites → opens → clicks → RSVPs from blasts and guest replies.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-[var(--ivory)]"
        >
          Refresh
        </button>
      </div>

      <ol className="space-y-2">
        {steps.map((step) => {
          const max = Math.max(data.funnel.invited, data.funnel.emailsSent, 1);
          const width = Math.max(8, Math.round((step.value / max) * 100));
          return (
            <li key={step.label} className="rounded-xl border border-white/10 bg-[var(--ink)]/40 px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--ivory)]">{step.label}</span>
                <span className="tabular-nums text-[var(--mist)]">
                  {step.value}
                  {typeof step.pct === "number" ? ` · ${step.pct}%` : ""}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[var(--champagne)] transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Seats" value={String(data.funnel.seats)} />
        <Stat label="Gift pledges" value={String(data.registry.pledges)} />
        <Stat
          label="Cash pledged"
          value={new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(data.registry.cashPledged || 0)}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--ink)]/40 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--mist)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--ivory)]">{value}</p>
    </div>
  );
}
