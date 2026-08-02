"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

type AdminEvent = {
  id: string;
  slug: string;
  title: string;
  hostName: string;
  dateISO: string;
  published: boolean;
  visibility: string;
  tier: string;
  templateId: string;
  customDomain: string | null;
  ownerId: string | null;
  ownerEmail: string | null;
  ownerName: string | null;
  rsvpCount: number;
  attendingCount: number;
  updatedAt: string;
  createdAt: string;
};

type DomainBinding = {
  domain: string;
  slug: string;
  status?: string;
};

type Overview = {
  stats: {
    users: number;
    events: number;
    published: number;
    domains: number;
    rsvps: number;
  };
  googleAuthEnabled?: boolean;
  users: AdminUser[];
  events: AdminEvent[];
  domains: DomainBinding[];
};

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/overview");
      const json = (await res.json()) as Overview & { error?: string };
      if (!res.ok) {
        setError(json.error || "Failed to load");
        return;
      }
      setData(json);
    } catch {
      setError("Failed to load admin data");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return data.events;
    return data.events.filter(
      (e) =>
        e.title.toLowerCase().includes(needle) ||
        e.slug.toLowerCase().includes(needle) ||
        (e.ownerEmail ?? "").toLowerCase().includes(needle) ||
        (e.hostName ?? "").toLowerCase().includes(needle) ||
        (e.customDomain ?? "").toLowerCase().includes(needle),
    );
  }, [data, q]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return data.users;
    return data.users.filter(
      (u) =>
        u.email.toLowerCase().includes(needle) ||
        u.name.toLowerCase().includes(needle),
    );
  }, [data, q]);

  async function togglePublished(event: AdminEvent) {
    setBusy(event.slug);
    try {
      const res = await fetch(`/api/admin/events/${event.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !event.published }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setError(j.error || "Update failed");
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function ensureAllSsl() {
    setBusy("__ssl__");
    setError(null);
    try {
      const res = await fetch("/api/domains/ensure-platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const j = (await res.json()) as { error?: string; events?: unknown[] };
      if (!res.ok) {
        setError(j.error || "SSL provision failed");
        return;
      }
      setError(null);
      alert(`Provisioned SSL hosts for ${j.events?.length ?? 0} events.`);
    } finally {
      setBusy(null);
    }
  }

  async function setTier(event: AdminEvent, tier: "free" | "pro" | "studio") {
    setBusy(event.slug);
    try {
      const res = await fetch(`/api/admin/events/${event.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setError(j.error || "Tier update failed");
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function removeEvent(event: AdminEvent) {
    if (
      !window.confirm(
        `Delete "${event.title}" (${event.slug}) permanently? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusy(event.slug);
    try {
      const res = await fetch(`/api/admin/events/${event.slug}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setError(j.error || "Delete failed");
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (!data && !error) {
    return <p className="text-[var(--mist)]">Loading admin data…</p>;
  }

  if (error && !data) {
    return (
      <p className="text-[var(--coral)]" role="alert">
        {error}
      </p>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-12">
      <div className="grid gap-3 sm:grid-cols-5">
        {(
          [
            ["Users", data.stats.users],
            ["Events", data.stats.events],
            ["Published", data.stats.published],
            ["RSVPs", data.stats.rsvps],
            ["Domains", data.stats.domains],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--mist)]">
              {label}
            </p>
            <p className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl text-[var(--champagne)]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div
        className={`rounded-md border px-4 py-3 text-sm ${
          data.googleAuthEnabled
            ? "border-[var(--champagne)]/35 bg-[var(--champagne)]/10 text-[var(--champagne)]"
            : "border-white/15 bg-white/[0.03] text-[var(--mist)]"
        }`}
      >
        <p className="font-medium text-[var(--ivory)]">
          Google sign-in:{" "}
          {data.googleAuthEnabled ? "Enabled" : "Not configured"}
        </p>
        {!data.googleAuthEnabled ? (
          <p className="mt-1">
            Set <code className="text-[var(--champagne)]">AUTH_GOOGLE_ID</code>{" "}
            and{" "}
            <code className="text-[var(--champagne)]">AUTH_GOOGLE_SECRET</code>{" "}
            in Vercel, then redeploy. Setup guide:{" "}
            <code className="text-[var(--champagne)]">docs/GOOGLE_AUTH.md</code>
          </p>
        ) : (
          <p className="mt-1">
            Login and register show Continue with Google.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block flex-1 text-sm text-[var(--mist)]">
          Search users & events
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="email, slug, title, domain…"
            className="mt-1.5 w-full max-w-xl rounded-md border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-[var(--champagne)]"
          />
        </label>
        <button
          type="button"
          disabled={busy === "__ssl__"}
          onClick={() => void ensureAllSsl()}
          className="rounded-md border border-[var(--champagne)]/40 px-3 py-2 text-sm text-[var(--champagne)] hover:bg-[var(--champagne)]/10 disabled:opacity-50"
        >
          {busy === "__ssl__" ? "Provisioning…" : "Fix subdomain SSL"}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-[var(--coral)]">{error}</p>
      ) : null}

      <section>
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
          Registered users
        </h2>
        <p className="mt-1 text-sm text-[var(--mist)]">
          Accounts that can create and manage invitations.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-[var(--mist)]">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Events</th>
                <th className="py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const count = data.events.filter(
                  (e) => e.ownerId === u.id,
                ).length;
                return (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-2.5 pr-3">{u.name}</td>
                    <td className="py-2.5 pr-3 text-[var(--mist)]">{u.email}</td>
                    <td className="py-2.5 pr-3">{count}</td>
                    <td className="py-2.5 text-[var(--mist)]">
                      {u.createdAt.slice(0, 10)}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-[var(--mist)]">
                    No users match.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
          All events
        </h2>
        <p className="mt-1 text-sm text-[var(--mist)]">
          Open host studio to assist a customer — you can edit any event as
          admin.
        </p>
        <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
          {filteredEvents.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-3 py-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-cormorant)] text-xl">
                  {event.title}
                </p>
                <p className="mt-1 text-sm text-[var(--mist)]">
                  /{event.slug}
                  {event.customDomain ? ` · ${event.customDomain}` : ""}
                  {" · "}
                  {event.dateISO}
                  {" · "}
                  {event.rsvpCount} RSVPs ({event.attendingCount} yes)
                  {" · "}
                  {event.published ? "published" : "draft"}
                  {" · "}
                  tier: {event.tier ?? "free"}
                  {" · "}
                  {event.ownerEmail ?? "no owner (demo)"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/host/${event.slug}`}
                  className="rounded-md bg-[var(--champagne)] px-3 py-1.5 font-semibold text-[var(--ink)]"
                >
                  Assist in studio
                </Link>
                <Link
                  href={`/e/${event.slug}`}
                  className="rounded-md border border-white/15 px-3 py-1.5"
                >
                  View invite
                </Link>
                <select
                  value={event.tier ?? "free"}
                  disabled={busy === event.slug}
                  onChange={(e) =>
                    void setTier(
                      event,
                      e.target.value as "free" | "pro" | "studio",
                    )
                  }
                  className="rounded-md border border-white/15 bg-[var(--ink)] px-2 py-1.5"
                >
                  <option value="free">tier: free</option>
                  <option value="pro">tier: pro</option>
                  <option value="studio">tier: studio</option>
                </select>
                <button
                  type="button"
                  disabled={busy === event.slug}
                  onClick={() => void togglePublished(event)}
                  className="rounded-md border border-white/15 px-3 py-1.5 disabled:opacity-50"
                >
                  {event.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  disabled={busy === event.slug}
                  onClick={() => void removeEvent(event)}
                  className="rounded-md border border-red-400/40 px-3 py-1.5 text-red-200 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {filteredEvents.length === 0 ? (
            <li className="py-8 text-[var(--mist)]">No events match.</li>
          ) : null}
        </ul>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
          Domain bindings
        </h2>
        <ul className="mt-4 divide-y divide-white/10 border-t border-white/10 text-sm">
          {(data.domains ?? []).map((d) => (
            <li
              key={d.domain}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <span>
                {d.domain} → /e/{d.slug}
              </span>
              <span className="text-[var(--mist)]">{d.status ?? "bound"}</span>
            </li>
          ))}
          {(data.domains ?? []).length === 0 ? (
            <li className="py-6 text-[var(--mist)]">No custom domains yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
