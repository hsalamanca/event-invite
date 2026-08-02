"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function VerifyEmailClient({ token }: { token: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("err");
      setMessage("Missing verification token.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json()) as { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setStatus("err");
          setMessage(data.error || "Verification failed");
          return;
        }
        setStatus("ok");
      } catch {
        if (!cancelled) {
          setStatus("err");
          setMessage("Verification failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-4 text-sm">
      {status === "loading" ? (
        <p className="text-[var(--mist)]">Verifying your email…</p>
      ) : null}
      {status === "ok" ? (
        <>
          <p className="text-[var(--ivory)]">Email verified. You’re all set.</p>
          <Link href="/login" className="text-[var(--champagne)] underline">
            Sign in
          </Link>
        </>
      ) : null}
      {status === "err" ? (
        <>
          <p className="text-[var(--coral)]">{message}</p>
          <Link href="/login" className="text-[var(--champagne)] underline">
            Back to sign in
          </Link>
        </>
      ) : null}
    </div>
  );
}
