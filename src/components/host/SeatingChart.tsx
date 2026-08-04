"use client";

import { useMemo, useState } from "react";
import type { EventRecord, RsvpSubmission, SeatingTable } from "@/lib/types";
import { canUseSeating } from "@/lib/tier";

type SeatingChartProps = {
  event: EventRecord;
  rsvps: RsvpSubmission[];
};

function newTable(index: number): SeatingTable {
  return {
    id: `tbl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    name: `Table ${index}`,
    seats: 8,
    assignments: [],
  };
}

export function SeatingChart({ event, rsvps }: SeatingChartProps) {
  const pro = canUseSeating(event);
  const [tables, setTables] = useState<SeatingTable[]>(
    event.seatingTables ?? [],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const attending = useMemo(
    () =>
      rsvps.filter((r) => r.attendance.toLowerCase().includes("attend")),
    [rsvps],
  );

  const assignedIds = useMemo(() => {
    const set = new Set<string>();
    for (const t of tables) {
      for (const a of t.assignments) set.add(a.rsvpId);
    }
    return set;
  }, [tables]);

  const unassigned = attending.filter((r) => !assignedIds.has(r.id));

  async function save(next: SeatingTable[]) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/events/${event.slug}/seating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: next }),
      });
      const data = (await res.json()) as {
        error?: string;
        tables?: SeatingTable[];
        upgrade?: boolean;
      };
      if (!res.ok) {
        setError(data.error || "Could not save seating");
        return;
      }
      setTables(data.tables ?? next);
      setInfo("Seating saved.");
      setTimeout(() => setInfo(null), 2000);
    } catch {
      setError("Could not save seating");
    } finally {
      setBusy(false);
    }
  }

  async function upgrade() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: event.slug, product: "pro_event" }),
      });
      const data = (await res.json()) as {
        url?: string;
        mailto?: string;
        error?: string;
      };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.mailto) {
        window.location.href = data.mailto;
        return;
      }
      setError(data.error || "Checkout unavailable");
    } finally {
      setBusy(false);
    }
  }

  function addTable() {
    const next = [...tables, newTable(tables.length + 1)];
    setTables(next);
    if (pro) void save(next);
  }

  function assignGuest(tableId: string, rsvpId: string) {
    const guest = attending.find((r) => r.id === rsvpId);
    if (!guest) return;
    const next = tables.map((t) => {
      if (t.id !== tableId) {
        return {
          ...t,
          assignments: t.assignments.filter((a) => a.rsvpId !== rsvpId),
        };
      }
      if (t.assignments.length >= t.seats) return t;
      if (t.assignments.some((a) => a.rsvpId === rsvpId)) return t;
      return {
        ...t,
        assignments: [
          ...t.assignments,
          { rsvpId, guestName: guest.name },
        ],
      };
    });
    setTables(next);
    if (pro) void save(next);
  }

  function unassign(tableId: string, rsvpId: string) {
    const next = tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            assignments: t.assignments.filter((a) => a.rsvpId !== rsvpId),
          }
        : t,
    );
    setTables(next);
    if (pro) void save(next);
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ivory)]">
            Seating chart
          </h2>
          <p className="mt-1 text-sm text-[var(--mist)]">
            Arrange attending guests into tables. Pro Event feature.
          </p>
        </div>
        {!pro ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void upgrade()}
            className="rounded-md bg-[var(--champagne)] px-3 py-1.5 text-sm font-semibold text-[var(--ink)]"
          >
            Unlock with Pro · $29
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={addTable}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:border-[var(--champagne)]/40"
          >
            Add table
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-[var(--coral)]">{error}</p>
      ) : null}
      {info ? (
        <p className="mt-3 text-sm text-[var(--champagne)]">{info}</p>
      ) : null}

      {!pro ? (
        <p className="mt-4 text-sm text-[var(--mist)]">
          Upgrade to assign seats, export a door list by table, and keep the
          chart synced with RSVPs.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="grid gap-3 sm:grid-cols-2">
            {tables.length === 0 ? (
              <p className="text-sm text-[var(--mist)]">
                No tables yet — add one to start seating guests.
              </p>
            ) : null}
            {tables.map((table) => (
              <div
                key={table.id}
                className="rounded-lg border border-white/10 bg-[var(--ink)]/40 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    value={table.name}
                    onChange={(e) =>
                      setTables((all) =>
                        all.map((t) =>
                          t.id === table.id
                            ? { ...t, name: e.target.value }
                            : t,
                        ),
                      )
                    }
                    onBlur={() => void save(tables)}
                    className="w-full rounded border border-white/10 bg-transparent px-2 py-1 text-sm font-semibold"
                  />
                  <span className="shrink-0 text-xs text-[var(--mist)]">
                    {table.assignments.length}/{table.seats}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {table.assignments.map((a) => (
                    <li
                      key={a.rsvpId}
                      className="flex items-center justify-between gap-2 text-[var(--mist)]"
                    >
                      <span>{a.guestName || a.rsvpId}</span>
                      <button
                        type="button"
                        className="text-xs text-[var(--champagne)]"
                        onClick={() => unassign(table.id, a.rsvpId)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                {table.assignments.length < table.seats &&
                unassigned.length > 0 ? (
                  <select
                    className="mt-2 w-full rounded border border-white/15 bg-[var(--ink)] px-2 py-1.5 text-sm"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        assignGuest(table.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Seat a guest…</option>
                    {unassigned.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                        {g.guestCount > 1 ? ` (+${g.guestCount - 1})` : ""}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            ))}
          </div>
          <aside className="rounded-lg border border-white/10 p-3">
            <h3 className="text-sm font-semibold">Unassigned</h3>
            <p className="mt-1 text-xs text-[var(--mist)]">
              {unassigned.length} attending guest
              {unassigned.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-2 max-h-64 space-y-1 overflow-auto text-sm text-[var(--mist)]">
              {unassigned.map((g) => (
                <li key={g.id}>
                  {g.name}
                  {g.guestCount > 1 ? ` · ${g.guestCount}` : ""}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </section>
  );
}
