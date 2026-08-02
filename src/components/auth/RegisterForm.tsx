"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function RegisterForm({
  googleEnabled = false,
}: {
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not create account.");
        return;
      }
      const login = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (login?.error) {
        router.push("/login");
        return;
      }
      // Soft verification: account works; verify link was emailed
      router.push("/events/new?verify=1");
      router.refresh();
    } catch {
      setError("Could not create account. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {googleEnabled ? (
        <button
          type="button"
          onClick={() => void signIn("google", { callbackUrl: "/events/new" })}
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
        <span className="text-[var(--mist)]">Your name</span>
        <input
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-[var(--ivory)] outline-none focus:border-[var(--champagne)]"
        />
      </label>
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
        <span className="text-[var(--mist)]">Password (8+ characters)</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
        className="w-full rounded-md bg-[var(--champagne)] px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create account"}
      </button>
      <p className="text-center text-sm text-[var(--mist)]">
        We’ll email a verification link. You can start creating right away.
      </p>
      <p className="text-center text-sm text-[var(--mist)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--champagne)] underline">
          Sign in
        </Link>
      </p>
    </form>
    </div>
  );
}
