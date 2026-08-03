"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4 text-sm text-[var(--landing-muted)]">
        <p>
          If an account exists for that email, we sent a reset link. Check your
          inbox (and spam).
        </p>
        <Link href="/login" className="text-[var(--landing-cedar)] underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-[var(--landing-muted)]">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 text-[var(--landing-ink)] outline-none focus:border-[var(--landing-cedar)]"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[var(--landing-cedar)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-[var(--landing-muted)]">
        <Link href="/login" className="text-[var(--landing-cedar)] underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
