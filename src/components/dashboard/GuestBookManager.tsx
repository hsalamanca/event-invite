"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { GuestBookContact } from "@/lib/types";

export function GuestBookManager({
  initialContacts,
}: {
  initialContacts: GuestBookContact[];
}) {
  const [contacts, setContacts] = useState(initialContacts);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [dietary, setDietary] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.includes(q) ||
        (c.householdName ?? "").toLowerCase().includes(q) ||
        (c.dietary ?? "").toLowerCase().includes(q),
    );
  }, [contacts, query]);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/guest-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          householdName,
          dietary,
          notes,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        contact?: GuestBookContact;
      };
      if (!res.ok || !data.contact) {
        setError(data.error || "Could not save");
        return;
      }
      setContacts((prev) => {
        const rest = prev.filter((c) => c.id !== data.contact!.id);
        return [...rest, data.contact!].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });
      setName("");
      setEmail("");
      setPhone("");
      setHouseholdName("");
      setDietary("");
      setNotes("");
    } catch {
      setError("Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this contact from your guest book?")) return;
    const res = await fetch(`/api/guest-book?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onAdd}
        className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <input
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--landing-line)" }}
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--landing-line)" }}
        />
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--landing-line)" }}
        />
        <input
          placeholder="Household"
          value={householdName}
          onChange={(e) => setHouseholdName(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--landing-line)" }}
        />
        <input
          placeholder="Dietary notes"
          value={dietary}
          onChange={(e) => setDietary(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--landing-line)" }}
        />
        <input
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--landing-line)" }}
        />
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--landing-cedar)" }}
          >
            Add contact
          </button>
          {error ? (
            <p className="mt-2 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>

      <div>
        <input
          placeholder="Search name, email, household…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4 w-full max-w-md rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--landing-line)" }}
        />
        {filtered.length === 0 ? (
          <p style={{ color: "var(--landing-muted)" }}>No contacts yet.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--landing-line)" }}>
            {filtered.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-medium">
                    {c.name}
                    {c.householdName ? (
                      <span
                        className="ml-2 text-sm font-normal"
                        style={{ color: "var(--landing-muted)" }}
                      >
                        {c.householdName}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm" style={{ color: "var(--landing-muted)" }}>
                    {c.email}
                    {c.phone ? ` · ${c.phone}` : ""}
                    {c.dietary ? ` · ${c.dietary}` : ""}
                  </p>
                  {c.notes ? (
                    <p className="mt-1 text-sm" style={{ color: "var(--landing-muted)" }}>
                      {c.notes}
                    </p>
                  ) : null}
                  {c.history.length > 0 ? (
                    <ul className="mt-2 space-y-0.5 text-xs" style={{ color: "var(--landing-muted)" }}>
                      {c.history.slice(0, 4).map((h) => (
                        <li key={`${h.eventId}-${h.at}`}>
                          {h.eventTitle}
                          {h.attendance ? ` · ${h.attendance}` : ""}
                          {h.mealChoice ? ` · ${h.mealChoice}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void remove(c.id)}
                  className="text-sm underline"
                  style={{ color: "var(--landing-muted)" }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
