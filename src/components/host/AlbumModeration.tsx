"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuestPhoto } from "@/lib/types";

export function AlbumModeration({
  slug,
  enabled,
}: {
  slug: string;
  enabled: boolean;
}) {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/album?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { photos?: GuestPhoto[] };
      setPhotos(data.photos ?? []);
    } catch {
      /* ignore */
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: GuestPhoto["status"]) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/album", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, id, status }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Could not update");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(
        `/api/album?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Could not delete");
      }
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusyId(null);
    }
  }

  if (!enabled) {
    return (
      <section className="scroll-mt-24 border-t border-white/10 pt-8">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
          Guest photo album
        </h2>
        <p className="mt-1 text-sm text-[var(--mist)]">
          Enable the guest album in Event details to let guests upload photos
          for your approval.
        </p>
      </section>
    );
  }

  const pending = photos.filter((p) => p.status === "pending");
  const approved = photos.filter((p) => p.status === "approved");

  return (
    <section className="scroll-mt-24 border-t border-white/10 pt-8">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
          Guest photo album
        </h2>
        <p className="mt-1 text-sm text-[var(--mist)]">
          Approve guest uploads before they appear on the invite.
          {pending.length ? ` · ${pending.length} pending` : ""}
          {approved.length ? ` · ${approved.length} live` : ""}
        </p>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {photos.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--mist)]">No guest photos yet.</p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <li
              key={p.id}
              className="overflow-hidden rounded-md border border-white/10 bg-white/[0.03]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.caption || `Photo by ${p.name}`}
                className="aspect-square w-full object-cover"
              />
              <div className="space-y-2 p-3 text-sm">
                <div className="font-medium">{p.name}</div>
                {p.caption ? (
                  <p className="text-[var(--mist)]">{p.caption}</p>
                ) : null}
                <p className="text-xs uppercase tracking-wider text-[var(--mist)]/70">
                  {p.status}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.status !== "approved" ? (
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => void setStatus(p.id, "approved")}
                      className="rounded border border-[var(--champagne)]/40 px-2.5 py-1 text-xs text-[var(--champagne)] disabled:opacity-60"
                    >
                      Approve
                    </button>
                  ) : null}
                  {p.status !== "rejected" ? (
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => void setStatus(p.id, "rejected")}
                      className="rounded border border-white/15 px-2.5 py-1 text-xs text-[var(--mist)] disabled:opacity-60"
                    >
                      Reject
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => void remove(p.id)}
                    className="rounded border border-red-400/30 px-2.5 py-1 text-xs text-red-200 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
