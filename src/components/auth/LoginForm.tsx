"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const OAUTH_ERRORS: Record<string, string> = {
  OAuthSignin: "Could not start Google sign-in. Try again.",
  OAuthCallback: "Google sign-in was interrupted. Try again.",
  OAuthCreateAccount: "Could not create your Ownvite account from Google.",
  OAuthAccountNotLinked:
    "This email is already registered. Sign in with email, or use the same Google account.",
  Callback: "Sign-in callback failed. Try again.",
  AccessDenied: "Google sign-in was denied.",
  Configuration: "Google sign-in is misconfigured. Contact support.",
  Default: "Could not sign in with Google. Try again.",
};

export default function LoginForm({
  googleEnabled = false,
}: {
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/dashboard";
  const resetOk = search.get("reset") === "1";
  const oauthError = search.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    oauthError
      ? OAUTH_ERRORS[oauthError] || OAUTH_ERRORS.Default || null
      : null,
  );
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
        <p className="rounded-md border border-[var(--landing-cedar)]/30 bg-[var(--landing-cedar)]/10 px-3 py-2 text-sm text-[var(--landing-cedar)]">
          Password updated. Sign in with your new password.
        </p>
      ) : null}

      {googleEnabled ? (
        <>
          <GoogleSignInButton callbackUrl={callbackUrl} />
          <p className="text-center text-xs uppercase tracking-[0.18em] text-[var(--landing-muted)]">
            or email
          </p>
        </>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="text-[var(--landing-muted)]">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 text-[var(--landing-ink)] outline-none focus:border-[var(--landing-cedar)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--landing-muted)]">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 text-[var(--landing-ink)] outline-none focus:border-[var(--landing-cedar)]"
          />
        </label>
        <div className="text-right text-sm">
          <Link
            href="/forgot-password"
            className="text-[var(--landing-muted)] underline-offset-2 hover:text-[var(--landing-cedar)] hover:underline"
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
          className="w-full rounded-md bg-[var(--landing-cedar)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-sm text-[var(--landing-muted)]">
          New here?{" "}
          <Link href="/register" className="text-[var(--landing-cedar)] underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
