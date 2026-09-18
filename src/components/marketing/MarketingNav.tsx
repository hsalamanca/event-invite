"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type MarketingNavProps = {
  locale: Locale;
  path?: string;
  extra?: ReactNode;
};

export default function MarketingNav({
  locale,
  path = "/",
  extra,
}: MarketingNavProps) {
  const nav = getDictionary(locale).nav;
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const panelId = useId();
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const header = navRef.current?.closest("header");
    if (!header) return;
    const sync = () => setPanelTop(header.getBoundingClientRect().bottom);
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: localePath(locale, "/marketplace"), label: nav.templates },
    { href: localePath(locale, "/domains"), label: nav.domains },
    { href: localePath(locale, "/pricing"), label: nav.pricing },
  ];
  const phoneLinks = [...links, { href: "/login", label: nav.signIn }];

  const linkClass =
    "transition hover:text-[var(--landing-rose-deep)]";

  return (
    <>
      <nav
        ref={navRef}
        className="flex items-center justify-end gap-2.5 text-sm sm:gap-5"
        style={{ color: "var(--landing-ink)" }}
        aria-label={locale === "es" ? "Principal" : "Primary"}
      >
        <LanguageSwitcher locale={locale} path={path} variant="paper" />
        {extra ? <span className="hidden sm:inline">{extra}</span> : null}
        <div className="hidden items-center gap-5 sm:flex">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </div>
        <Link href="/login" className={`hidden sm:inline ${linkClass}`}>
          {nav.signIn}
        </Link>
        <Link
          href="/register"
          className="rounded-full px-3.5 py-2 font-medium text-white transition hover:opacity-95"
          style={{ background: "var(--landing-cta)" }}
        >
          {nav.signUp}
        </Link>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full sm:hidden"
          style={{
            border: "1px solid var(--landing-champagne, #E8D5B5)",
            background: "var(--landing-surface, #FFFCFA)",
            color: "var(--landing-ink)",
          }}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={
            open
              ? locale === "es"
                ? "Cerrar menú"
                : "Close menu"
              : locale === "es"
                ? "Abrir menú"
                : "Open menu"
          }
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">
            {open
              ? locale === "es"
                ? "Cerrar"
                : "Close"
              : locale === "es"
                ? "Menú"
                : "Menu"}
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            {open ? (
              <path
                d="M4 4l10 10M14 4L4 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 5h12M3 9h12M3 13h12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>
      {open ? (
        <div
          id={panelId}
          className="fixed inset-x-0 z-[80] border-b px-5 py-3 sm:hidden"
          style={{
            top: panelTop,
            background: "rgba(255,252,250,0.98)",
            borderColor: "var(--landing-line)",
            boxShadow: "0 12px 24px rgba(58,42,48,0.08)",
          }}
        >
          <ul className="flex flex-col">
            {extra ? (
              <li className="border-b py-1" style={{ borderColor: "var(--landing-line)" }}>
                <div className="flex min-h-11 items-center">{extra}</div>
              </li>
            ) : null}
            {phoneLinks.map((item) => (
              <li
                key={item.href}
                className="border-b last:border-b-0"
                style={{ borderColor: "var(--landing-line)" }}
              >
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center text-sm font-medium"
                  style={{ color: "var(--landing-ink)" }}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
