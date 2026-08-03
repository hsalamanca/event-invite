"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
  /** Kept for call-site compatibility; URLs no longer change with language. */
  path?: string;
  /** Stronger contrast for invite pages over photography. */
  variant?: "default" | "invite" | "marketing" | "paper";
};

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export default function LanguageSwitcher({
  locale,
  variant = "default",
}: LanguageSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale || busy || pending) return;
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

  const shellClass =
    variant === "marketing" || variant === "paper"
      ? "inline-flex items-center gap-1 text-sm tracking-wide"
      : variant === "invite"
        ? "inline-flex items-center rounded-full border border-black/10 bg-white/95 p-1 shadow-md backdrop-blur-sm"
        : "inline-flex items-center rounded-full border border-white/25 bg-black/35 p-0.5 shadow-sm backdrop-blur-sm";

  const activeClass =
    variant === "paper"
      ? "text-[var(--landing-ink,#1A1714)] underline decoration-[var(--landing-cedar,#6B5338)] underline-offset-[5px]"
      : variant === "marketing"
        ? "text-white underline decoration-white/80 underline-offset-[5px]"
        : variant === "invite"
          ? "bg-[var(--ink)] text-white shadow-sm"
          : "bg-[var(--champagne)] text-[var(--ink)] shadow-sm";

  const idleClass =
    variant === "paper"
      ? "text-[var(--landing-muted,#5C564E)] hover:text-[var(--landing-ink,#1A1714)]"
      : variant === "marketing"
        ? "text-white/55 hover:text-white/85"
        : variant === "invite"
          ? "text-black/55 hover:text-black/80"
          : "text-white/70 hover:text-white";

  const dividerClass =
    variant === "paper" ? "text-[var(--landing-line,#D9D0C4)]" : "text-white/35";

  return (
    <div
      className={shellClass}
      role="group"
      aria-label={locale === "en" ? "Language" : "Idioma"}
    >
      {LOCALES.map(({ code, label }, i) => {
        const active = locale === code;
        return (
          <span key={code} className="inline-flex items-center">
            {(variant === "marketing" || variant === "paper") && i > 0 ? (
              <span className={`mx-1.5 ${dividerClass}`} aria-hidden>
                /
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void switchLocale(code)}
              disabled={busy || pending}
              aria-pressed={active}
              aria-label={code === "en" ? "English" : "Español"}
              className={
                variant === "marketing" || variant === "paper"
                  ? `bg-transparent p-0 font-medium transition disabled:opacity-60 ${
                      active ? activeClass : idleClass
                    }`
                  : `min-w-[2.75rem] rounded-full px-3 py-1.5 text-sm font-semibold tracking-wide transition disabled:opacity-60 ${
                      active ? activeClass : idleClass
                    }`
              }
            >
              {label}
            </button>
          </span>
        );
      })}
    </div>
  );
}
