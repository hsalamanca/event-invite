"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

type Listing = {
  id: string;
  authorName: string;
  templateId: string;
  title: string;
  description: string;
  priceCents: number;
  previewImage: string;
  status: string;
  createdAt: string;
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    templateId: TEMPLATES[0]?.id || "evening",
    title: "",
    description: "",
    priceCents: 900,
  });

  const templateOptions = useMemo(
    () => TEMPLATES.map((t) => ({ id: t.id, name: t.name })),
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/marketplace");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load marketplace");
      setListings(data.listings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit listing");
      setShowForm(false);
      setForm({
        templateId: TEMPLATES[0]?.id || "evening",
        title: "",
        description: "",
        priceCents: 900,
      });
      void load();
      if (data.listing?.status === "pending") {
        setError(null);
        alert("Submitted for review. It will appear once published.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Ownvite
          </p>
          <h1 className="mt-1 font-display text-3xl text-[var(--ink)]">
            Template marketplace
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Browse community invite templates from Studio and Agency designers.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-semibold"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-full bg-[var(--brand)] px-3 py-1.5 text-sm font-semibold text-white"
          >
            {showForm ? "Cancel" : "Submit a template"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-[var(--ink)]">New listing</h2>
          <p className="text-xs text-[var(--muted)]">
            Studio or Agency subscription required. Listings are reviewed before publish.
          </p>
          <select
            value={form.templateId}
            onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          >
            {templateOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Listing title"
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
          <label className="block text-sm text-[var(--muted)]">
            Price (cents)
            <input
              type="number"
              min={0}
              max={9900}
              value={form.priceCents}
              onChange={(e) =>
                setForm((f) => ({ ...f, priceCents: Number(e.target.value) || 0 }))
              }
              className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Submitting…" : "Submit listing"}
          </button>
        </form>
      )}

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      {loading ? (
        <p className="mt-8 text-sm text-[var(--muted)]">Loading listings…</p>
      ) : listings.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">
          No published marketplace templates yet.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.previewImage}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {listing.authorName}
                </p>
                <h2 className="mt-1 font-display text-xl text-[var(--ink)]">
                  {listing.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{listing.description}</p>
                <p className="mt-3 text-sm font-semibold text-[var(--ink)]">
                  ${(listing.priceCents / 100).toFixed(2)}
                </p>
                <Link
                  href={`/events/new?template=${encodeURIComponent(listing.templateId)}`}
                  className="mt-3 inline-block text-sm font-semibold text-[var(--brand)] hover:underline"
                >
                  Use this look
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
