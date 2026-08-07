"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type ClientEvent = {
  slug: string;
  title: string;
  published: boolean;
  dateISO: string;
  whiteLabel?: boolean;
};

type ClientRow = {
  id: string;
  name: string;
  email: string;
  notes?: string;
  createdAt: string;
  events: ClientEvent[];
};

export function AgencyDashboard({
  initialClients,
  unassigned,
}: {
  initialClients: ClientRow[];
  unassigned: ClientEvent[];
}) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [pool, setPool] = useState(unassigned);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/agency/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, notes }),
      });
      const data = (await res.json()) as {
        error?: string;
        client?: { id: string; name: string; email: string; notes?: string; createdAt: string };
      };
      if (!res.ok || !data.client) {
        setError(data.error || "Could not create client");
        return;
      }
      setClients((prev) =>
        [...prev, { ...data.client!, events: [] }].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setName("");
      setEmail("");
      setNotes("");
    } catch {
      setError("Could not create client");
    } finally {
      setBusy(false);
    }
  }

  async function assign(clientId: string, slug: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/agency/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignSlug: slug }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not assign");
        return;
      }
      const event = pool.find((e) => e.slug === slug);
      if (event) {
        setPool((prev) => prev.filter((e) => e.slug !== slug));
        setClients((prev) =>
          prev.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  events: [
                    ...c.events,
                    { ...event, whiteLabel: true },
                  ].sort((a, b) => a.title.localeCompare(b.title)),
                }
              : c,
          ),
        );
      }
      router.refresh();
    } catch {
      setError("Could not assign");
    } finally {
      setBusy(false);
    }
  }

  async function removeClient(id: string) {
    if (!window.confirm("Delete this client workspace? Events stay, unassigned."))
      return;
    const res = await fetch(`/api/agency/clients/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (client?.events.length) {
      setPool((prev) =>
        [...prev, ...client.events.map(({ whiteLabel: _w, ...e }) => e)].sort(
          (a, b) => a.title.localeCompare(b.title),
        ),
      );
    }
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
        style={{ borderColor: "var(--landing-line)" }}
      >
        <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--landing-cedar)" }}>
          New client
        </h2>
        <input
          required
          placeholder="Client / couple name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--landing-line)" }}
        />
        <input
          type="email"
          placeholder="Client email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--landing-line)" }}
        />
        <input
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm sm:col-span-2"
          style={{ borderColor: "var(--landing-line)" }}
        />
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--landing-cedar)" }}
          >
            Create client workspace
          </button>
          {error ? (
            <p className="mt-2 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>

      {pool.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--landing-cedar)" }}>
            Unassigned events
          </h2>
          <ul className="mt-3 space-y-2">
            {pool.map((e) => (
              <li
                key={e.slug}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                style={{ borderColor: "var(--landing-line)" }}
              >
                <div>
                  <Link href={`/host/${e.slug}`} className="font-medium hover:underline">
                    {e.title}
                  </Link>
                  <p className="text-xs" style={{ color: "var(--landing-muted)" }}>
                    {e.dateISO} · {e.published ? "Live" : "Draft"}
                  </p>
                </div>
                {clients.length > 0 ? (
                  <select
                    className="rounded-md border px-2 py-1 text-sm"
                    style={{ borderColor: "var(--landing-line)" }}
                    defaultValue=""
                    disabled={busy}
                    onChange={(ev) => {
                      const clientId = ev.target.value;
                      if (clientId) void assign(clientId, e.slug);
                      ev.target.value = "";
                    }}
                  >
                    <option value="">Assign to client…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs" style={{ color: "var(--landing-muted)" }}>
                    Create a client first
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--landing-cedar)" }}>
          Clients ({clients.length})
        </h2>
        {clients.length === 0 ? (
          <p style={{ color: "var(--landing-muted)" }}>
            No client workspaces yet.
          </p>
        ) : (
          clients.map((c) => (
            <article
              key={c.id}
              className="rounded-lg border p-4"
              style={{ borderColor: "var(--landing-line)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                  <p className="text-sm" style={{ color: "var(--landing-muted)" }}>
                    {c.email || "No email"}
                    {c.notes ? ` · ${c.notes}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeClient(c.id)}
                  className="text-sm underline"
                  style={{ color: "var(--landing-muted)" }}
                >
                  Delete
                </button>
              </div>
              {c.events.length === 0 ? (
                <p className="mt-3 text-sm" style={{ color: "var(--landing-muted)" }}>
                  No events assigned — white-label applies when you assign one.
                </p>
              ) : (
                <ul className="mt-3 space-y-1.5">
                  {c.events.map((e) => (
                    <li key={e.slug} className="flex flex-wrap items-center gap-3 text-sm">
                      <Link href={`/host/${e.slug}`} className="font-medium hover:underline">
                        {e.title}
                      </Link>
                      <span style={{ color: "var(--landing-muted)" }}>
                        {e.dateISO}
                      </span>
                      {e.whiteLabel ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            background: "color-mix(in srgb, var(--landing-cedar) 15%, transparent)",
                            color: "var(--landing-cedar)",
                          }}
                        >
                          White-label
                        </span>
                      ) : null}
                      <Link
                        href={`/e/${e.slug}`}
                        className="underline"
                        style={{ color: "var(--landing-muted)" }}
                      >
                        View invite
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
