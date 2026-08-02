"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not reset password");
        return;
      }
      router.push("/login?reset=1");
    } catch {
      setError("Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-[var(--coral)]">
        Missing reset token.{" "}
        <Link href="/forgot-password" className="underline">
          Request a new link
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-[var(--mist)]">New password (8+ characters)</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-[var(--ivory)] outline-none focus:border-[var(--champagne)]"
        />
      </label>
      {error ? (
        <p className="text-sm text-[var(--coral)]" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[var(--champagne)] px-4 py-3 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
      >
        {loading ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
