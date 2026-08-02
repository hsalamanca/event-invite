"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function InviteUnlock({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Incorrect password");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not unlock");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F1A2E] px-6 text-[#F4F0E8]">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border border-white/10 bg-white/[0.04] p-8"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-[#C9A962]">
          Private invite
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl">
          {title}
        </h1>
        <p className="text-sm text-[#9BA8BC]">
          Enter the password from your host to open this invitation.
        </p>
        <label className="block space-y-1.5 text-sm">
          <span className="text-[#9BA8BC]">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-[#1A2744] px-3 py-2.5 outline-none focus:border-[#C9A962]"
          />
        </label>
        {error ? <p className="text-sm text-[#e07a5f]">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-[#C9A962] px-4 py-2.5 text-sm font-semibold text-[#0F1A2E] disabled:opacity-60"
        >
          {busy ? "Opening…" : "Open invite"}
        </button>
      </form>
    </main>
  );
}
