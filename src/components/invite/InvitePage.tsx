"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { EventRecord } from "@/lib/types";

type InvitePageProps = {
  event: EventRecord;
  locale?: Locale;
  onRsvpSubmit?: (payload: {
    eventId: string;
    name: string;
    email: string;
    attendance: string;
    guestCount: number;
    dietary: string;
    note: string;
  }) => Promise<void> | void;
};

function formatDateLabel(dateISO: string, locale: Locale): string {
  const d = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateISO;
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

const FONT_STACK: Record<string, string> = {
  "Cormorant Garamond": "var(--font-cormorant), Georgia, serif",
  Fraunces: "var(--font-fraunces), Georgia, serif",
  "Source Sans 3": "var(--font-source-sans), system-ui, sans-serif",
  "DM Sans": "var(--font-dm-sans), system-ui, sans-serif",
  "Playfair Display": "var(--font-playfair), Georgia, serif",
  Outfit: "var(--font-outfit), system-ui, sans-serif",
  Lora: "var(--font-lora), Georgia, serif",
  "Great Vibes": "var(--font-great-vibes), cursive",
};

function fontStack(name: string, fallback: string): string {
  return FONT_STACK[name] ?? `"${name}", ${fallback}`;
}

export default function InvitePage({
  event,
  locale = "en",
  onRsvpSubmit,
}: InvitePageProps) {
  const { theme, rsvpFields } = event;
  const ui = getDictionary(locale).invite;
  const attendanceOptions = rsvpFields.attendance.options;
  const defaultAttendance = attendanceOptions[0] ?? "Joyfully attending";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState(defaultAttendance);
  const [guestCount, setGuestCount] = useState(1);
  const [dietary, setDietary] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parallaxY, setParallaxY] = useState(0);
  const [copied, setCopied] = useState(false);
  const [gbName, setGbName] = useState("");
  const [gbBody, setGbBody] = useState("");
  const [gbDone, setGbDone] = useState(false);
  const [gbError, setGbError] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id: string; name: string; body: string; createdAt: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/messages?slug=${encodeURIComponent(event.slug)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages?: { id: string; name: string; body: string; createdAt: string }[];
        };
        if (!cancelled && data.messages) setMessages(data.messages);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [event.slug]);

  async function copyInviteLink() {
    try {
      const url = `${window.location.origin}/e/${event.slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function submitGuestbook(e: FormEvent) {
    e.preventDefault();
    setGbError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: event.slug,
          name: gbName.trim(),
          body: gbBody.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: { id: string; name: string; body: string; createdAt: string };
      };
      if (!res.ok || !data.message) {
        setGbError(data.error || "Could not post");
        return;
      }
      setMessages((m) => [data.message!, ...m]);
      setGbBody("");
      setGbDone(true);
    } catch {
      setGbError("Could not post");
    }
  }

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const onScroll = () => {
      const y = Math.min(window.scrollY * 0.3, 80);
      setParallaxY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      eventId: event.id,
      name: name.trim(),
      email: email.trim(),
      attendance,
      guestCount: rsvpFields.plusOnes.enabled ? guestCount : 1,
      dietary: rsvpFields.dietary.enabled ? dietary.trim() : "",
      note: note.trim(),
    };

    try {
      if (onRsvpSubmit) {
        await onRsvpSubmit(payload);
      } else {
        const res = await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "Unable to submit RSVP");
        }
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const cssVars = {
    "--invite-bg": theme.colors.background,
    "--invite-surface": theme.colors.surface,
    "--invite-accent": theme.colors.accentPrimary,
    "--invite-accent-2": theme.colors.accentSecondary,
    "--invite-text": theme.colors.textPrimary,
    "--invite-muted": theme.colors.textMuted,
    "--font-display": fontStack(theme.fonts.display, "Georgia, serif"),
    "--font-body": fontStack(theme.fonts.body, "system-ui, sans-serif"),
  } as CSSProperties;

  return (
    <div className="invite-root" style={cssVars}>
      <section className="invite-hero" aria-label="Invitation hero">
        <div
          className="invite-hero-media"
          style={{ transform: `translateY(${parallaxY}px)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.heroImage}
            alt=""
            className="invite-hero-img"
            fetchPriority="high"
          />
          <div className="invite-hero-overlay" aria-hidden />
        </div>

        <div className="invite-hero-content">
          <p className="invite-brand fade-up fade-up-1">{event.title}</p>
          <h1 className="invite-headline fade-up fade-up-2">{event.headline}</h1>
          <p className="invite-tagline fade-up fade-up-3">{event.tagline}</p>
          <div className="invite-cta fade-up fade-up-4">
            <a className="btn-primary" href="#rsvp">
              {ui.rsvp}
            </a>
            <a className="btn-ghost" href="#details">
              {ui.details}
            </a>
          </div>
          <div className="invite-share fade-up fade-up-4">
            <a className="btn-ghost" href={`/api/events/${event.slug}/ics`}>
              {ui.addToCalendar}
            </a>
            <button type="button" className="btn-ghost" onClick={() => void copyInviteLink()}>
              {copied ? ui.copied : ui.copyLink}
            </button>
          </div>
        </div>
      </section>

      <section id="details" className="invite-section">
        <h2 className="invite-section-title">{ui.details}</h2>
        <dl className="invite-meta">
          <div>
            <dt>{ui.date}</dt>
            <dd>{formatDateLabel(event.dateISO, locale)}</dd>
          </div>
          <div>
            <dt>{ui.time}</dt>
            <dd>{event.timeLabel}</dd>
          </div>
          <div>
            <dt>{ui.venue}</dt>
            <dd>{event.venue}</dd>
          </div>
          <div>
            <dt>{ui.address}</dt>
            <dd>
              <a
                href={mapsUrl(event.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="invite-address"
              >
                {event.address}
              </a>
            </dd>
          </div>
        </dl>
        <div className="invite-about">
          <h3 className="invite-section-title invite-section-title--sm">
            {ui.about}
          </h3>
          <p>{event.about}</p>
        </div>
        {event.registryUrl ? (
          <p className="invite-registry">
            <a
              href={event.registryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              {ui.registryCta}
            </a>
          </p>
        ) : null}
      </section>

      <section id="rsvp" className="invite-section invite-section--surface">
        <h2 className="invite-section-title">{ui.rsvp}</h2>
        <p className="invite-prompt">{rsvpFields.prompt}</p>

        {success ? (
          <div className="rsvp-success" role="status">
            <span className="rsvp-check" aria-hidden>
              ✓
            </span>
            <p className="rsvp-success-text">{ui.successTitle}</p>
            <p className="rsvp-success-sub">{ui.successBody}</p>
          </div>
        ) : (
          <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
            <label className="rsvp-field">
              <span>{ui.name}</span>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="rsvp-field">
              <span>{ui.email}</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {rsvpFields.attendance.enabled && (
              <label className="rsvp-field">
                <span>{ui.attendance}</span>
                <select
                  name="attendance"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                >
                  {attendanceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {rsvpFields.plusOnes.enabled && (
              <label className="rsvp-field">
                <span>{rsvpFields.plusOnes.label}</span>
                <input
                  type="number"
                  name="guestCount"
                  min={1}
                  max={rsvpFields.plusOnes.max}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                />
              </label>
            )}

            {rsvpFields.dietary.enabled && (
              <label className="rsvp-field">
                <span>{rsvpFields.dietary.label}</span>
                <input
                  type="text"
                  name="dietary"
                  placeholder={rsvpFields.dietary.placeholder}
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                />
              </label>
            )}

            <label className="rsvp-field">
              <span>{ui.note}</span>
              <textarea
                name="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={ui.note}
              />
            </label>

            {error && (
              <p className="rsvp-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary btn-submit"
              disabled={submitting}
            >
              {submitting ? ui.submitting : ui.submit}
            </button>
          </form>
        )}
      </section>

      <section id="guestbook" className="invite-section">
        <h2 className="invite-section-title">{ui.guestbook}</h2>
        <p className="invite-prompt">{ui.guestbookPrompt}</p>
        {gbDone ? (
          <p className="rsvp-success-sub">{ui.guestbookThanks}</p>
        ) : (
          <form className="rsvp-form" onSubmit={submitGuestbook}>
            <label className="rsvp-field">
              <span>{ui.guestbookName}</span>
              <input
                required
                value={gbName}
                onChange={(e) => setGbName(e.target.value)}
              />
            </label>
            <label className="rsvp-field">
              <span>{ui.guestbookMessage}</span>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={gbBody}
                onChange={(e) => setGbBody(e.target.value)}
              />
            </label>
            {gbError ? (
              <p className="rsvp-error" role="alert">
                {gbError}
              </p>
            ) : null}
            <button type="submit" className="btn-primary btn-submit">
              {ui.guestbookSubmit}
            </button>
          </form>
        )}
        {messages.length > 0 ? (
          <ul className="guestbook-list">
            {messages.slice(0, 12).map((m) => (
              <li key={m.id}>
                <strong>{m.name}</strong>
                <p>{m.body}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <footer className="invite-footer">
        <p>Hosted by {event.hostName}</p>
        <p className="invite-footer-attr">Ownvite</p>
      </footer>

      <style jsx>{`
        .invite-root {
          min-height: 100vh;
          background: var(--invite-bg);
          color: var(--invite-text);
          font-family: var(--font-body);
          scroll-behavior: smooth;
        }

        .invite-hero {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }

        .invite-hero-media {
          position: absolute;
          inset: -8% 0 0 0;
          z-index: 0;
          will-change: transform;
        }

        .invite-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          animation: heroScale 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .invite-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(15, 26, 46, 0.55) 0%,
            rgba(15, 26, 46, 0.85) 100%
          );
        }

        .invite-hero-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 40rem;
          padding: clamp(2rem, 6vw, 4rem);
          padding-bottom: calc(clamp(2.5rem, 8vw, 5rem) + env(safe-area-inset-bottom, 0px));
          padding-left: calc(clamp(1.5rem, 5vw, 3rem) + env(safe-area-inset-left, 0px));
          padding-right: calc(clamp(1.5rem, 5vw, 3rem) + env(safe-area-inset-right, 0px));
        }

        .invite-brand {
          margin: 0 0 1rem;
          font-family: var(--font-display);
          font-size: 0.8125rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--invite-accent);
        }

        .invite-headline {
          margin: 0 0 0.75rem;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: clamp(1.75rem, 6vw, 3.25rem);
          line-height: 1.15;
          color: var(--invite-text);
        }

        .invite-tagline {
          margin: 0 0 1.75rem;
          font-size: clamp(1.125rem, 2.5vw, 1.25rem);
          line-height: 1.5;
          color: var(--invite-muted);
          max-width: 28rem;
        }

        .invite-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          align-items: center;
        }

        .invite-share {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1rem;
          align-items: center;
          margin-top: 0.85rem;
        }

        .invite-registry {
          margin-top: 1.5rem;
        }

        .guestbook-list {
          list-style: none;
          margin: 2rem 0 0;
          padding: 0;
          display: grid;
          gap: 1rem;
        }

        .guestbook-list li {
          border-top: 1px solid color-mix(in srgb, var(--invite-muted) 35%, transparent);
          padding-top: 1rem;
        }

        .guestbook-list strong {
          font-family: var(--font-display);
          font-size: 1.1rem;
        }

        .guestbook-list p {
          margin: 0.35rem 0 0;
          color: var(--invite-muted);
          line-height: 1.5;
        }

        .btn-primary,
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0.75rem 1.5rem;
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-decoration: none;
          border-radius: 2px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .btn-primary {
          background: var(--invite-accent);
          color: var(--invite-bg);
        }

        .btn-primary:hover {
          background: var(--invite-accent-2);
          color: var(--invite-text);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .btn-ghost {
          background: transparent;
          color: var(--invite-text);
          border-color: color-mix(in srgb, var(--invite-text) 35%, transparent);
        }

        .btn-ghost:hover {
          border-color: var(--invite-accent);
          color: var(--invite-accent);
        }

        .invite-section {
          max-width: 36rem;
          margin: 0 auto;
          padding: clamp(3rem, 8vw, 5rem) clamp(1.5rem, 5vw, 2rem);
        }

        .invite-section--surface {
          background: var(--invite-surface);
          max-width: none;
          padding-left: max(clamp(1.5rem, 5vw, 2rem), calc(50% - 18rem));
          padding-right: max(clamp(1.5rem, 5vw, 2rem), calc(50% - 18rem));
        }

        .invite-section-title {
          margin: 0 0 1.5rem;
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 3vw, 1.75rem);
          font-weight: 600;
          color: var(--invite-text);
        }

        .invite-section-title--sm {
          font-size: 1.25rem;
          margin-bottom: 0.75rem;
        }

        .invite-meta {
          margin: 0;
          display: grid;
          gap: 1.25rem;
        }

        .invite-meta dt {
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--invite-muted);
          margin-bottom: 0.25rem;
        }

        .invite-meta dd {
          margin: 0;
          font-size: 1.0625rem;
          line-height: 1.5;
        }

        .invite-address {
          color: var(--invite-text);
          text-decoration: underline;
          text-decoration-color: color-mix(in srgb, var(--invite-accent) 60%, transparent);
          text-underline-offset: 3px;
        }

        .invite-address:hover {
          color: var(--invite-accent);
        }

        .invite-about {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid color-mix(in srgb, var(--invite-accent) 35%, transparent);
        }

        .invite-about p {
          margin: 0;
          font-size: 1rem;
          line-height: 1.65;
          color: color-mix(in srgb, var(--invite-text) 90%, var(--invite-muted));
        }

        .invite-prompt {
          margin: -0.5rem 0 1.75rem;
          color: var(--invite-muted);
          font-size: 1rem;
          line-height: 1.5;
        }

        .rsvp-form {
          display: grid;
          gap: 1.25rem;
          max-width: 36rem;
        }

        .rsvp-field {
          display: grid;
          gap: 0.4rem;
        }

        .rsvp-field span {
          font-size: 0.8125rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--invite-muted);
        }

        .rsvp-field input,
        .rsvp-field select,
        .rsvp-field textarea {
          min-height: 48px;
          padding: 0.75rem 0.9rem;
          background: var(--invite-bg);
          border: 1px solid color-mix(in srgb, var(--invite-muted) 35%, transparent);
          border-radius: 2px;
          color: var(--invite-text);
          font-family: var(--font-body);
          font-size: 1rem;
        }

        .rsvp-field textarea {
          min-height: 96px;
          resize: vertical;
        }

        .rsvp-field input::placeholder,
        .rsvp-field textarea::placeholder {
          color: color-mix(in srgb, var(--invite-muted) 75%, transparent);
        }

        .rsvp-field input:focus,
        .rsvp-field select:focus,
        .rsvp-field textarea:focus {
          outline: none;
          border-color: var(--invite-accent);
        }

        .btn-submit {
          width: 100%;
          margin-top: 0.5rem;
        }

        .rsvp-error {
          margin: 0;
          color: var(--invite-accent-2);
          font-size: 0.9375rem;
        }

        .rsvp-success {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0 1rem;
        }

        .rsvp-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          background: var(--invite-accent-2);
          color: var(--invite-text);
          font-size: 0.875rem;
          animation: checkPulse 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .rsvp-success-text {
          margin: 0;
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--invite-accent-2);
          position: relative;
          display: inline-block;
        }

        .rsvp-success-sub {
          margin: 0.5rem 0 0;
          color: var(--invite-muted);
          font-size: 0.95rem;
        }

        .rsvp-success-text::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          height: 1px;
          width: 100%;
          background: var(--invite-accent);
          transform-origin: left;
          animation: underlineDraw 0.3s ease forwards;
        }

        .invite-footer {
          padding: 2.5rem 1.5rem 3rem;
          text-align: center;
          color: var(--invite-muted);
          font-size: 0.875rem;
        }

        .invite-footer p {
          margin: 0 0 0.35rem;
        }

        .invite-footer-attr {
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 0.6875rem;
          color: color-mix(in srgb, var(--invite-muted) 70%, transparent);
        }

        .fade-up {
          opacity: 0;
          transform: translateY(16px);
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .fade-up-1 {
          animation-delay: 0.05s;
        }
        .fade-up-2 {
          animation-delay: 0.15s;
        }
        .fade-up-3 {
          animation-delay: 0.28s;
        }
        .fade-up-4 {
          animation-delay: 0.4s;
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroScale {
          from {
            transform: scale(1.04);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes underlineDraw {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes checkPulse {
          from {
            transform: scale(0.9);
          }
          to {
            transform: scale(1);
          }
        }

        @media (max-width: 480px) {
          .invite-cta {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-primary {
            width: 100%;
          }

          .btn-ghost {
            width: 100%;
            border: none;
            text-decoration: underline;
            text-underline-offset: 4px;
            min-height: 44px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-up,
          .invite-hero-img,
          .rsvp-check,
          .rsvp-success-text::after {
            animation: none !important;
          }

          .fade-up {
            opacity: 1;
            transform: none;
          }

          .invite-hero-img {
            transform: none;
          }

          .invite-root {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </div>
  );
}
