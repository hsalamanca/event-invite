"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuestMessage } from "@/lib/types";

export function GuestbookModeration({ slug }: { slug: string }) {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/messages?slug=${encodeURIComponent(slug)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { messages?: GuestMessage[] };
      setMessages(data.messages ?? []);
    } catch {
      /* ignore */
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(
        `/api/messages?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Could not delete");
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="scroll-mt-24 border-t border-white/10 pt-8">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
          Guestbook
        </h2>
        <p className="mt-1 text-sm text-[var(--mist)]">
          Moderate notes guests left on the invite.
        </p>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {messages.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--mist)]">No guestbook notes yet.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate">{m.name}</strong>
                  <p className="mt-1 text-sm text-[var(--mist)]">{m.body}</p>
                  <time className="mt-2 block text-xs text-[var(--mist)]/70">
                    {new Date(m.createdAt).toLocaleString()}
                  </time>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded border border-white/15 px-2.5 py-1 text-xs text-[var(--mist)] hover:border-red-400/40 hover:text-red-200"
                  disabled={busyId === m.id}
                  onClick={() => void remove(m.id)}
                >
                  {busyId === m.id ? "…" : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
