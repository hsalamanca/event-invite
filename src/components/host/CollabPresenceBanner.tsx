"use client";

import { useCallback, useEffect, useState } from "react";

type Presence = {
  userId: string;
  name: string;
  at: string;
};

export function CollabPresenceBanner({ slug }: { slug: string }) {
  const [others, setOthers] = useState<Presence[]>([]);
  const [lastEdited, setLastEdited] = useState<{
    by: string | null;
    at: string | null;
  }>({ by: null, at: null });

  const sync = useCallback(async () => {
    try {
      const [beatRes, metaRes] = await Promise.all([
        fetch(`/api/events/${encodeURIComponent(slug)}/presence`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editing: false }),
        }),
        fetch(`/api/events/${encodeURIComponent(slug)}/presence`, {
          credentials: "include",
        }),
      ]);
      const beat = await beatRes.json().catch(() => ({}));
      const meta = await metaRes.json().catch(() => ({}));
      if (beatRes.ok) {
        setOthers((beat.presence as Presence[]) || []);
      }
      if (metaRes.ok) {
        setLastEdited({
          by: meta.lastEditedBy ?? null,
          at: meta.lastEditedAt ?? null,
        });
      }
    } catch {
      /* ignore transient presence errors */
    }
  }, [slug]);

  useEffect(() => {
    void sync();
    const id = window.setInterval(() => void sync(), 15000);
    return () => window.clearInterval(id);
  }, [sync]);

  const editedLabel =
    lastEdited.at &&
    `Last edited${lastEdited.by ? ` by ${lastEdited.by}` : ""} · ${new Date(
      lastEdited.at
    ).toLocaleString()}`;

  if (others.length === 0 && !editedLabel) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[var(--slate)]/70 px-3 py-2 text-xs text-[var(--mist)]">
      {others.length > 0 && (
        <span className="font-medium text-[var(--champagne)]">
          {others.map((o) => o.name || "Collaborator").join(", ")} viewing studio
        </span>
      )}
      {editedLabel && <span>{editedLabel}</span>}
    </div>
  );
}
