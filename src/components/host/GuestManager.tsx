"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { CustomQuestion, ManualGuest, RsvpSubmission } from "@/lib/types";

type GuestManagerProps = {
  slug: string;
  locale?: Locale;
  initialRsvps: RsvpSubmission[];
  questions?: CustomQuestion[];
};

function formatAnswers(
  r: RsvpSubmission,
  questions: CustomQuestion[],
): string {
  const parts: string[] = [];
  if (r.mealChoice) parts.push(`Meal: ${r.mealChoice}`);
  for (const q of questions) {
    const raw = r.answers?.[q.id];
    if (raw == null || raw === "" || (Array.isArray(raw) && !raw.length)) {
      continue;
    }
    if (q.type === "meal" && r.mealChoice) continue;
    parts.push(
      `${q.label}: ${Array.isArray(raw) ? raw.join(", ") : String(raw)}`,
    );
  }
  return parts.join(" · ");
}

export default function GuestManager({
  slug,
  locale = "en",
  initialRsvps,
  questions = [],
}: GuestManagerProps) {
  const t = getDictionary(locale).guests;
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [guests, setGuests] = useState<ManualGuest[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [csvText, setCsvText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/guests?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        rsvps?: RsvpSubmission[];
        guests?: ManualGuest[];
      };
      if (data.rsvps) setRsvps(data.rsvps);
      if (data.guests) setGuests(data.guests);
    } catch {
      /* ignore */
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const yes = rsvps.filter((r) =>
      r.attendance.toLowerCase().includes("attend"),
    ).length;
    const no = rsvps.filter((r) =>
      r.attendance.toLowerCase().includes("declin"),
    ).length;
    const heads = rsvps
      .filter((r) => r.attendance.toLowerCase().includes("attend"))
      .reduce((n, r) => n + (r.guestCount || 1), 0);
    return { yes, no, heads, total: rsvps.length };
  }, [rsvps]);

  async function removeEntry(kind: "rsvp" | "manual", id: string, label: string) {
    if (!window.confirm(`Remove ${label}? This cannot be undone.`)) return;
    setError(null);
    setRemovingId(id);
    try {
      const res = await fetch(
        `/api/guests?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}&kind=${kind}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || t.error);
        return;
      }
      if (kind === "rsvp") {
        setRsvps((list) => list.filter((r) => r.id !== id));
      } else {
        setGuests((list) => list.filter((g) => g.id !== id));
      }
    } catch {
      setError(t.error);
    } finally {
      setRemovingId(null);
    }
  }

  async function addGuest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, email }),
      });
      const data = (await res.json()) as { error?: string; guest?: ManualGuest };
      if (!res.ok || !data.guest) {
        setError(data.error || t.error);
        return;
      }
      setGuests((g) => [...g, data.guest!]);
      setName("");
      setEmail("");
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: ManualGuest["status"]) {
    const res = await fetch("/api/guests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, id, status }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { guest?: ManualGuest };
    if (data.guest) {
      setGuests((list) =>
        list.map((g) => (g.id === data.guest!.id ? data.guest! : g)),
      );
    }
  }

  async function importCsv() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/guests/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, csv: csvText }),
      });
      const data = (await res.json()) as {
        error?: string;
        added?: number;
        skipped?: number;
      };
      if (!res.ok) {
        setError(data.error || t.error);
        return;
      }
      setInfo(`Imported ${data.added ?? 0} guests (${data.skipped ?? 0} skipped).`);
      setCsvText("");
      setShowImport(false);
      await load();
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function sendRemind(type: "invite" | "rsvp_reminder" | "event_reminder") {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        preview?: number;
        message?: string;
        note?: string;
      };
      if (!res.ok) {
        setError(data.error || t.error);
        return;
      }
      setInfo(
        [
          data.message,
          `Sent ${data.sent ?? 0}, preview ${data.preview ?? 0}.`,
          data.note,
        ]
          .filter(Boolean)
          .join(" "),
      );
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const rows = [
      [
        "type",
        "name",
        "email",
        "status",
        "guests",
        "dietary",
        "note",
        "answers",
        "createdAt",
      ],
      ...rsvps.map((r) => [
        "rsvp",
        r.name,
        r.email,
        r.attendance,
        String(r.guestCount),
        r.dietary,
        r.note,
        formatAnswers(r, questions),
        r.createdAt,
      ]),
      ...guests.map((g) => [
        "manual",
        g.name,
        g.email,
        g.status,
        "1",
        "",
        "",
        "",
        g.createdAt,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-guests.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="guests" className="scroll-mt-24 border-t border-white/10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
            {t.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--mist)]">{t.support}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:border-[var(--champagne)]/40"
          >
            Import CSV
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:border-[var(--champagne)]/40"
          >
            {t.exportCsv}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          disabled={busy}
          onClick={() => void sendRemind("invite")}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40 disabled:opacity-60"
        >
          Email invites
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void sendRemind("rsvp_reminder")}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40 disabled:opacity-60"
        >
          RSVP reminders
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void sendRemind("event_reminder")}
          className="rounded-md border border-white/15 px-3 py-1.5 hover:border-[var(--champagne)]/40 disabled:opacity-60"
        >
          Event reminders
        </button>
      </div>

      {showImport ? (
        <div className="mt-4 space-y-2 rounded-md border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-[var(--mist)]">
            Paste CSV with columns <code>name,email</code> (header optional).
          </p>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-[var(--ink)] px-3 py-2 text-sm"
            placeholder={"name,email\nAda Lovelace,ada@example.com"}
          />
          <button
            type="button"
            disabled={busy || !csvText.trim()}
            onClick={() => void importCsv()}
            className="rounded-md bg-[var(--champagne)] px-3 py-1.5 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
          >
            Import guests
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--mist)]">
        <span>
          {stats.total} {t.rsvps}
        </span>
        <span>
          {stats.yes} {t.yes}
        </span>
        <span>
          {stats.no} {t.no}
        </span>
        <span>
          {stats.heads} {t.headcount}
        </span>
        <span>
          {guests.length} {t.manual}
        </span>
      </div>

      <form
        onSubmit={addGuest}
        className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          required
          placeholder={t.namePh}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
        />
        <input
          type="email"
          placeholder={t.emailPh}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-[var(--champagne)] px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
        >
          {t.add}
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-sm text-[var(--coral)]">{error}</p>
      ) : null}
      {info ? (
        <p className="mt-2 text-sm text-[var(--champagne)]">{info}</p>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[var(--mist)]">
            <tr className="border-b border-white/10">
              <th className="py-2 pr-3 font-medium">{t.colName}</th>
              <th className="py-2 pr-3 font-medium">{t.colEmail}</th>
              <th className="py-2 pr-3 font-medium">{t.colStatus}</th>
              <th className="py-2 pr-3 font-medium">{t.colGuests}</th>
              <th className="py-2 pr-3 font-medium">{t.colNote}</th>
              <th className="py-2 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((r) => {
              const answers = formatAnswers(r, questions);
              return (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="py-2.5 pr-3">{r.name}</td>
                  <td className="py-2.5 pr-3 text-[var(--mist)]">{r.email}</td>
                  <td className="py-2.5 pr-3">{r.attendance}</td>
                  <td className="py-2.5 pr-3">{r.guestCount}</td>
                  <td className="py-2.5 text-[var(--mist)]">
                    {[r.dietary, r.note, answers].filter(Boolean).join(" · ")}
                    {r.editToken ? (
                      <>
                        {" · "}
                        <a
                          href={`/rsvp/${r.editToken}`}
                          className="text-[var(--champagne)] underline-offset-2 hover:underline"
                        >
                          Edit link
                        </a>
                      </>
                    ) : null}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      className="rounded border border-white/15 px-2.5 py-1 text-xs text-[var(--mist)] hover:border-red-400/40 hover:text-red-200 disabled:opacity-60"
                      disabled={removingId === r.id}
                      onClick={() => void removeEntry("rsvp", r.id, r.name)}
                    >
                      {removingId === r.id ? "…" : "Remove"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {guests.map((g) => (
              <tr key={g.id} className="border-b border-white/5">
                <td className="py-2.5 pr-3">{g.name}</td>
                <td className="py-2.5 pr-3 text-[var(--mist)]">{g.email}</td>
                <td className="py-2.5 pr-3">
                  <select
                    value={g.status}
                    onChange={(e) =>
                      void setStatus(
                        g.id,
                        e.target.value as ManualGuest["status"],
                      )
                    }
                    className="rounded border border-white/15 bg-[var(--ink)] px-2 py-1"
                  >
                    <option value="invited">invited</option>
                    <option value="opened">opened</option>
                    <option value="going">going</option>
                    <option value="maybe">maybe</option>
                    <option value="declined">declined</option>
                  </select>
                </td>
                <td className="py-2.5 pr-3">1</td>
                <td className="py-2.5 text-[var(--mist)]">
                  <button
                    type="button"
                    className="text-[var(--champagne)] underline-offset-2 hover:underline"
                    onClick={() => {
                      const url = `${window.location.origin}/e/${slug}?e=${encodeURIComponent(g.email)}`;
                      void navigator.clipboard.writeText(url).then(
                        () => {
                          setInfo(`Copied personal link for ${g.email}`);
                          setTimeout(() => setInfo(null), 2500);
                        },
                        () => setError("Could not copy link"),
                      );
                    }}
                  >
                    Copy personal link
                  </button>
                </td>
                <td className="py-2.5 text-right">
                  <button
                    type="button"
                    className="rounded border border-white/15 px-2.5 py-1 text-xs text-[var(--mist)] hover:border-red-400/40 hover:text-red-200 disabled:opacity-60"
                    disabled={removingId === g.id}
                    onClick={() => void removeEntry("manual", g.id, g.name)}
                  >
                    {removingId === g.id ? "…" : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
            {rsvps.length === 0 && guests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-[var(--mist)]">
                  {t.empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
