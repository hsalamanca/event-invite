"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
  /** Kept for call-site compatibility; URLs no longer change with language. */
  path?: string;
};

export default function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const nextLocale: Locale = locale === "en" ? "es" : "en";
  const label = locale === "en" ? "ES" : "EN";

  async function switchLocale() {
    setBusy(true);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void switchLocale()}
      disabled={busy || pending}
      className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium tracking-wide text-[var(--mist)] transition hover:border-[var(--champagne)]/40 hover:text-[var(--ivory)] disabled:opacity-60"
      aria-label={locale === "en" ? "Cambiar a español" : "Switch to English"}
    >
      {label}
    </button>
  );
}
