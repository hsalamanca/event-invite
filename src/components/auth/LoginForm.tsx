"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginForm({
  googleEnabled = false,
}: {
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/dashboard";
  const resetOk = search.get("reset") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {resetOk ? (
        <p className="rounded-md border border-[var(--champagne)]/30 bg-[var(--champagne)]/10 px-3 py-2 text-sm text-[var(--champagne)]">
          Password updated. Sign in with your new password.
        </p>
      ) : null}

      {googleEnabled ? (
        <button
          type="button"
          onClick={() => void signIn("google", { callbackUrl })}
          className="w-full rounded-md border border-white/20 px-4 py-3 text-sm font-medium text-[var(--ivory)] transition hover:border-[var(--champagne)]/50"
        >
          Continue with Google
        </button>
      ) : null}

      {googleEnabled ? (
        <p className="text-center text-xs uppercase tracking-[0.18em] text-[var(--mist)]">
          or email
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="text-[var(--mist)]">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-[var(--ivory)] outline-none focus:border-[var(--champagne)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--mist)]">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-[var(--ivory)] outline-none focus:border-[var(--champagne)]"
          />
        </label>
        <div className="text-right text-sm">
          <Link
            href="/forgot-password"
            className="text-[var(--mist)] underline-offset-2 hover:text-[var(--champagne)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {error ? (
          <p className="text-sm text-[var(--coral)]" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--champagne)] px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-sm text-[var(--mist)]">
          New here?{" "}
          <Link href="/register" className="text-[var(--champagne)] underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
