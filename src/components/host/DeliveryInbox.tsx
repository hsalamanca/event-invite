"use client";

import { useCallback, useEffect, useState } from "react";

type Recipient = {
  id: string;
  to: string;
  status: string;
  openedAt: string | null;
  clickedAt: string | null;
  createdAt: string;
  error?: string;
};

type BlastRow = {
  id: string;
  type: string;
  channel: string;
  subject: string;
  status: string;
  scheduledFor?: string | null;
  createdAt: string;
  recipientCount: number;
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
  unopenedCount: number;
  unopenedEmails: string[];
  recipients: Recipient[];
};

export function DeliveryInbox({ slug }: { slug: string }) {
  const [blasts, setBlasts] = useState<BlastRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${slug}/delivery`);
      if (!res.ok) return;
      const data = (await res.json()) as { blasts?: BlastRow[] };
      setBlasts(data.blasts ?? []);
    } catch {
      /* ignore */
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function resendUnopened(blast: BlastRow) {
    if (!blast.unopenedEmails.length) return;
    if (
      !window.confirm(
        `Resend to ${blast.unopenedEmails.length} guest(s) who haven't opened?`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/events/${slug}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: blast.type === "event_reminder" ? "event_reminder" : blast.type === "invite" ? "invite" : "rsvp_reminder",
          channel: "email",
          emails: blast.unopenedEmails,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        preview?: number;
        note?: string;
      };
      if (!res.ok) {
        setError(data.error || "Could not resend");
        return;
      }
      setInfo(
        `Resent: ${data.sent ?? 0} sent, ${data.preview ?? 0} preview.${data.note ? ` ${data.note}` : ""}`,
      );
      await load();
    } catch {
      setError("Could not resend");
    } finally {
      setBusy(false);
    }
  }

  async function sendInvites() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/events/${slug}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "invite", channel: "email" }),
      });
      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        preview?: number;
        message?: string;
        note?: string;
      };
      if (!res.ok) {
        setError(data.error || "Could not send invites");
        return;
      }
      setInfo(
        `Invites: ${data.sent ?? 0} sent, ${data.preview ?? 0} preview.${
          data.message ? ` ${data.message}` : ""
        }${data.note ? ` ${data.note}` : ""}`,
      );
      await load();
    } catch {
      setError("Could not send invites");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-[var(--slate)]/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ivory)]">
            Delivery inbox
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--mist)]">
            Track invite and reminder blasts — opens, clicks, and who still
            hasn&apos;t looked.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void sendInvites()}
          className="rounded-md bg-[var(--champagne)] px-3 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-50"
        >
          Send invites
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="mt-3 text-sm text-[var(--champagne)]">{info}</p>
      ) : null}

      {blasts.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--mist)]">
          No blasts yet. Add guests, then send invites from here or Host
          actions.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {blasts.map((b) => {
            const openRate =
              b.sent > 0 ? Math.round((b.opened / b.sent) * 100) : 0;
            const expanded = openId === b.id;
            return (
              <li
                key={b.id}
                className="rounded-lg border border-white/10 bg-[var(--ink)]/40"
              >
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
                  onClick={() => setOpenId(expanded ? null : b.id)}
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--ivory)]">
                      {b.subject}
                    </p>
                    <p className="text-xs text-[var(--mist)]">
                      {b.channel} · {b.type.replace(/_/g, " ")} ·{" "}
                      {new Date(b.createdAt).toLocaleString()}
                      {b.scheduledFor
                        ? ` · scheduled ${new Date(b.scheduledFor).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--mist)]">
                    <span>
                      {b.sent} sent
                      {b.failed ? ` · ${b.failed} failed` : ""}
                    </span>
                    <span>
                      {b.opened} opened ({openRate}%)
                    </span>
                    <span>{b.clicked} clicked</span>
                    <span>{b.unopenedCount} unopened</span>
                  </div>
                </button>
                {expanded ? (
                  <div className="border-t border-white/10 px-4 py-3">
                    {b.unopenedCount > 0 ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void resendUnopened(b)}
                        className="mb-3 rounded-md border border-[var(--champagne)]/40 px-3 py-1.5 text-xs font-medium text-[var(--champagne)] disabled:opacity-50"
                      >
                        Resend to {b.unopenedCount} unopened
                      </button>
                    ) : null}
                    <div className="max-h-56 overflow-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[var(--mist)]">
                          <tr>
                            <th className="py-1 pr-2 font-medium">Guest</th>
                            <th className="py-1 pr-2 font-medium">Status</th>
                            <th className="py-1 pr-2 font-medium">Opened</th>
                            <th className="py-1 font-medium">Clicked</th>
                          </tr>
                        </thead>
                        <tbody>
                          {b.recipients.map((r) => (
                            <tr
                              key={r.id}
                              className="border-t border-white/5 text-[var(--ivory)]/90"
                            >
                              <td className="py-1.5 pr-2">{r.to}</td>
                              <td className="py-1.5 pr-2">{r.status}</td>
                              <td className="py-1.5 pr-2">
                                {r.openedAt
                                  ? new Date(r.openedAt).toLocaleString()
                                  : "—"}
                              </td>
                              <td className="py-1.5">
                                {r.clickedAt
                                  ? new Date(r.clickedAt).toLocaleString()
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
