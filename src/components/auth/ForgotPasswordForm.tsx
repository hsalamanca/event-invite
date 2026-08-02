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
      <div className="space-y-4 text-sm text-[var(--mist)]">
        <p>
          If an account exists for that email, we sent a reset link. Check your
          inbox (and spam).
        </p>
        <Link href="/login" className="text-[var(--champagne)] underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-[var(--mist)]">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-[var(--ivory)] outline-none focus:border-[var(--champagne)]"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[var(--champagne)] px-4 py-3 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-[var(--mist)]">
        <Link href="/login" className="text-[var(--champagne)] underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
