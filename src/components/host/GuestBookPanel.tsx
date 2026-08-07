"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuestBookContact } from "@/lib/types";

export function GuestBookPanel({ slug }: { slug: string }) {
  const [contacts, setContacts] = useState<GuestBookContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/guest-book");
      if (!res.ok) return;
      const data = (await res.json()) as { contacts?: GuestBookContact[] };
      setContacts(data.contacts ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function importSelected(all = false) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/guest-book/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          all,
          contactIds: all ? undefined : [...selected],
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        imported?: number;
        skipped?: number;
        message?: string;
      };
      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }
      setInfo(
        data.message ||
          `Imported ${data.imported ?? 0}, skipped ${data.skipped ?? 0} (already on list).`,
      );
      setSelected(new Set());
    } catch {
      setError("Import failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveEventGuestsToBook() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/guests?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as {
        rsvps?: { name: string; email: string; phone?: string; dietary?: string; attendance?: string; mealChoice?: string; guestCount?: number }[];
        guests?: { name: string; email: string; phone?: string }[];
      };
      let saved = 0;
      for (const r of data.rsvps ?? []) {
        if (!r.email) continue;
        const post = await fetch("/api/guest-book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: r.name,
            email: r.email,
            phone: r.phone,
            dietary: r.dietary,
          }),
        });
        if (post.ok) saved += 1;
      }
      for (const g of data.guests ?? []) {
        if (!g.email) continue;
        const post = await fetch("/api/guest-book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: g.name,
            email: g.email,
            phone: g.phone,
          }),
        });
        if (post.ok) saved += 1;
      }
      setInfo(`Saved ${saved} contact(s) to your guest book.`);
      await load();
    } catch {
      setError("Could not save to guest book");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-[var(--slate)]/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ivory)]">
            Guest book
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--mist)]">
            Reusable contacts across your events — dietary history, households,
            invite again in one click.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/dashboard/guests"
            className="rounded-md border border-white/15 px-3 py-2 text-xs text-[var(--mist)] hover:text-[var(--ivory)]"
          >
            Manage all
          </a>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveEventGuestsToBook()}
            className="rounded-md border border-white/15 px-3 py-2 text-xs text-[var(--mist)] hover:text-[var(--ivory)] disabled:opacity-50"
          >
            Save this event&apos;s guests
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="mt-3 text-sm text-[var(--champagne)]">{info}</p>
      ) : null}

      {contacts.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--mist)]">
          Your guest book is empty. Guests who RSVP are added automatically, or
          save this event&apos;s list above.
        </p>
      ) : (
        <>
          <ul className="mt-5 max-h-64 space-y-2 overflow-auto">
            {contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-3 rounded-md border border-white/5 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                  className="mt-1"
                  aria-label={`Select ${c.name}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--ivory)]">
                    {c.name}
                    {c.householdName ? (
                      <span className="text-[var(--mist)]">
                        {" "}
                        · {c.householdName}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-[var(--mist)]">
                    {c.email}
                    {c.phone ? ` · ${c.phone}` : ""}
                    {c.dietary ? ` · ${c.dietary}` : ""}
                  </p>
                  {c.history[0] ? (
                    <p className="truncate text-[11px] text-[var(--mist)]/80">
                      Last: {c.history[0].eventTitle}
                      {c.history[0].attendance
                        ? ` · ${c.history[0].attendance}`
                        : ""}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || selected.size === 0}
              onClick={() => void importSelected(false)}
              className="rounded-md bg-[var(--champagne)] px-3 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-50"
            >
              Invite selected ({selected.size})
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void importSelected(true)}
              className="rounded-md border border-white/15 px-3 py-2 text-sm text-[var(--mist)] hover:text-[var(--ivory)] disabled:opacity-50"
            >
              Invite entire book
            </button>
          </div>
        </>
      )}
    </section>
  );
}
