"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { ManualGuest, RsvpSubmission } from "@/lib/types";

type GuestManagerProps = {
  slug: string;
  locale?: Locale;
  initialRsvps: RsvpSubmission[];
};

export default function GuestManager({
  slug,
  locale = "en",
  initialRsvps,
}: GuestManagerProps) {
  const t = getDictionary(locale).guests;
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [guests, setGuests] = useState<ManualGuest[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  function exportCsv() {
    const rows = [
      ["type", "name", "email", "status", "guests", "dietary", "note", "createdAt"],
      ...rsvps.map((r) => [
        "rsvp",
        r.name,
        r.email,
        r.attendance,
        String(r.guestCount),
        r.dietary,
        r.note,
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
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:border-[var(--champagne)]/40"
        >
          {t.exportCsv}
        </button>
      </div>

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

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[var(--mist)]">
            <tr className="border-b border-white/10">
              <th className="py-2 pr-3 font-medium">{t.colName}</th>
              <th className="py-2 pr-3 font-medium">{t.colEmail}</th>
              <th className="py-2 pr-3 font-medium">{t.colStatus}</th>
              <th className="py-2 pr-3 font-medium">{t.colGuests}</th>
              <th className="py-2 font-medium">{t.colNote}</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((r) => (
              <tr key={r.id} className="border-b border-white/5">
                <td className="py-2.5 pr-3">{r.name}</td>
                <td className="py-2.5 pr-3 text-[var(--mist)]">{r.email}</td>
                <td className="py-2.5 pr-3">{r.attendance}</td>
                <td className="py-2.5 pr-3">{r.guestCount}</td>
                <td className="py-2.5 text-[var(--mist)]">
                  {[r.dietary, r.note].filter(Boolean).join(" · ")}
                </td>
              </tr>
            ))}
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
                <td className="py-2.5 text-[var(--mist)]">{t.manualTag}</td>
              </tr>
            ))}
            {rsvps.length === 0 && guests.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-[var(--mist)]">
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
