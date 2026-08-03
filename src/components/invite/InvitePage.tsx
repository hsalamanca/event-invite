"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import InviteCover from "@/components/invite/InviteCover";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanitizeAboutHtml } from "@/lib/sanitize-about";
import {
  resolveInviteLayout,
  resolveLocalizedInviteCopy,
  resolveLocalizedRsvpFields,
} from "@/lib/templates";
import type { CustomQuestion, EventRecord, RsvpAnswers } from "@/lib/types";
import type { WeatherSnapshot } from "@/lib/weather";

type InvitePageProps = {
  event: EventRecord;
  locale?: Locale;
  seatsTaken?: number;
  atCapacity?: boolean;
  isPast?: boolean;
  weather?: WeatherSnapshot | null;
  /** Set false in host live preview to avoid polluting open stats */
  trackViews?: boolean;
  onRsvpSubmit?: (payload: {
    eventId: string;
    name: string;
    email: string;
    attendance: string;
    guestCount: number;
    dietary: string;
    note: string;
    answers?: RsvpAnswers;
    mealChoice?: string;
  }) => Promise<void> | void;
};

function spotifyEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const type = parts[0];
    const id = parts[1];
    if (!type || !id) return null;
    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch {
    return null;
  }
}

function daysUntil(deadline: string): number | null {
  if (!deadline) return null;
  const end = new Date(`${deadline}T23:59:59`);
  if (Number.isNaN(end.getTime())) return null;
  const ms = end.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

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
  Bangers: "var(--font-bangers), Impact, system-ui, sans-serif",
  Fredoka: "var(--font-fredoka), system-ui, sans-serif",
  "Baloo 2": "var(--font-baloo-2), system-ui, sans-serif",
  "Space Grotesk": "var(--font-space-grotesk), system-ui, sans-serif",
  "Press Start 2P":
    "var(--font-press-start), 'Courier New', monospace",
};

function fontStack(name: string, fallback: string): string {
  return FONT_STACK[name] ?? `"${name}", ${fallback}`;
}

export default function InvitePage({
  event,
  locale = "en",
  seatsTaken = 0,
  atCapacity = false,
  isPast = false,
  weather = null,
  trackViews = true,
  onRsvpSubmit,
}: InvitePageProps) {
  const { theme } = event;
  const ui = getDictionary(locale).invite;
  const rsvpFields = resolveLocalizedRsvpFields(event.rsvpFields, locale);
  const attendanceOptions = rsvpFields.attendance.options;
  const defaultAttendance = attendanceOptions[0] ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState(defaultAttendance);
  const attendanceKey = attendanceOptions.join("\0");
  useEffect(() => {
    setAttendance((prev) => {
      if (attendanceOptions.includes(prev)) return prev;
      return attendanceOptions[0] ?? "";
    });
    // attendanceOptions identity changes each render; key tracks content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, attendanceKey]);
  const [guestCount, setGuestCount] = useState<number | "">(1);
  const [dietary, setDietary] = useState("");
  const [note, setNote] = useState("");
  const [answers, setAnswers] = useState<RsvpAnswers>({});
  const [mealChoice, setMealChoice] = useState("");
  const [editToken, setEditToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const customQuestions = rsvpFields.customQuestions ?? [];
  const deadlineDays = daysUntil(rsvpFields.deadline);
  const deadlinePassed = deadlineDays != null && deadlineDays < 0;
  const embed = event.spotifyUrl ? spotifyEmbed(event.spotifyUrl) : null;
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

  useEffect(() => {
    if (!trackViews) return;
    void fetch(`/api/events/${encodeURIComponent(event.slug)}/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => undefined);
  }, [event.slug, trackViews]);

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
      guestCount: rsvpFields.plusOnes.enabled
        ? Math.max(1, Number(guestCount) || 1)
        : 1,
      dietary: rsvpFields.dietary.enabled ? dietary.trim() : "",
      note: note.trim(),
      answers,
      mealChoice: mealChoice || undefined,
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
        const body = (await res.json().catch(() => null)) as {
          error?: string;
          rsvp?: { editToken?: string };
        } | null;
        if (!res.ok) {
          throw new Error(body?.error ?? ui.submitError);
        }
        if (body?.rsvp?.editToken) setEditToken(body.rsvp.editToken);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.somethingWrong);
    } finally {
      setSubmitting(false);
    }
  }

  const layout = resolveInviteLayout(event.templateId);
  const { headline, tagline, about } = resolveLocalizedInviteCopy(
    event,
    locale,
  );
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
    <div className="invite-root" data-layout={layout} style={cssVars}>
      <InviteCover
        layout={layout}
        hostName={event.hostName}
        title={event.title}
        headline={headline}
        tagline={tagline}
        dateLabel={formatDateLabel(event.dateISO, locale)}
        timeLabel={event.timeLabel}
        venue={event.venue}
        address={event.address}
        heroImage={event.heroImage}
        invitesYou={ui.invitesYou}
        comicPresents={ui.comicPresents}
        festiveParty={ui.festiveParty}
        toyPartyInvite={ui.toyPartyInvite}
        modernCelebrate={ui.modernCelebrate}
        arcadePlayer={ui.arcadePlayer}
        quinceInvite={ui.quinceInvite}
        fiftyCelebrate={ui.fiftyCelebrate}
        rsvpLabel={ui.rsvp}
        detailsLabel={ui.details}
        leaveNoteLabel={ui.leaveNote}
        calendarLabel={ui.addToCalendar}
        calendarHref={`/api/events/${event.slug}/ics`}
        copyLabel={copied ? ui.copied : ui.copyLink}
        isPast={isPast}
        onCopyLink={() => void copyInviteLink()}
        parallaxY={parallaxY}
      />

      <section id="details" className="invite-section invite-section--paper">
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
          <div
            className="invite-about-body"
            dangerouslySetInnerHTML={{
              __html: sanitizeAboutHtml(about),
            }}
          />
        </div>
        {weather ? (
          <p className="invite-extra-line">
            <strong>{ui.weather}</strong>
            {weather.summary}
            {weather.tempC != null ? ` · ~${Math.round(weather.tempC)}°C` : ""}
            {weather.precipChance != null
              ? ` · ${weather.precipChance}% ${ui.rainChance}`
              : ""}
          </p>
        ) : null}
      </section>

      {isPast ? (
        <section id="after" className="invite-section invite-section--surface">
          <h2 className="invite-section-title">{ui.thankYou}</h2>
          <p className="invite-prompt">
            {event.thankYouMessage?.trim() || ui.thankYouDefault}
          </p>
        </section>
      ) : null}

      {event.registryUrl ? (
        <section id="registry" className="invite-section">
          <h2 className="invite-section-title">
            {event.registryLabel || ui.registry}
          </h2>
          <p className="invite-prompt">{ui.registryPrompt}</p>
          <p className="invite-registry">
            <a
              href={event.registryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {event.registryLabel || ui.registryCta}
            </a>
          </p>
        </section>
      ) : null}

      {(event.schedule?.length ||
        event.dressCode ||
        event.parking ||
        event.whatToBring ||
        event.hotelInfo ||
        event.travelInfo ||
        event.contactEmail ||
        event.contactPhone) && (
        <section id="info" className="invite-section">
          <h2 className="invite-section-title">{ui.guestInfo}</h2>
          {event.schedule && event.schedule.length > 0 ? (
            <div className="invite-extra-block">
              <h3 className="invite-section-title invite-section-title--sm">
                {ui.schedule}
              </h3>
              <ul className="invite-schedule">
                {event.schedule.map((item) => (
                  <li key={item.id}>
                    <strong>{item.time}</strong>
                    <span>{item.title}</span>
                    {item.description ? <em>{item.description}</em> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {event.dressCode ? (
            <p className="invite-extra-line">
              <strong>{ui.dressCode}</strong> {event.dressCode}
            </p>
          ) : null}
          {event.parking ? (
            <p className="invite-extra-line">
              <strong>{ui.parking}</strong> {event.parking}
            </p>
          ) : null}
          {event.whatToBring ? (
            <p className="invite-extra-line">
              <strong>{ui.whatToBring}</strong> {event.whatToBring}
            </p>
          ) : null}
          {event.hotelInfo ? (
            <p className="invite-extra-line">
              <strong>{ui.stay}</strong> {event.hotelInfo}
            </p>
          ) : null}
          {event.travelInfo ? (
            <p className="invite-extra-line">
              <strong>{ui.travel}</strong> {event.travelInfo}
            </p>
          ) : null}
          {(event.contactEmail || event.contactPhone) && (
            <div className="invite-contact-cta">
              <strong>{ui.contactHost}</strong>
              <div className="invite-cta" style={{ marginTop: "0.75rem" }}>
                {event.contactEmail ? (
                  <a
                    className="btn-primary"
                    href={`mailto:${event.contactEmail}?subject=${encodeURIComponent(`About ${event.title}`)}`}
                  >
                    {ui.emailHost.replace("{name}", event.hostName)}
                  </a>
                ) : null}
                {event.contactPhone ? (
                  <a className="btn-ghost" href={`tel:${event.contactPhone}`}>
                    {ui.callText}
                  </a>
                ) : null}
              </div>
            </div>
          )}
        </section>
      )}

      {event.faqs && event.faqs.length > 0 ? (
        <section id="faq" className="invite-section invite-section--surface">
          <h2 className="invite-section-title">{ui.faq}</h2>
          <dl className="invite-faq">
            {event.faqs.map((f) => (
              <div key={f.id}>
                <dt>{f.question}</dt>
                <dd>{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {event.gallery && event.gallery.length > 0 ? (
        <section id="gallery" className="invite-section">
          <h2 className="invite-section-title">{ui.gallery}</h2>
          <div className="invite-gallery">
            {event.gallery.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" />
            ))}
          </div>
        </section>
      ) : null}

      {embed ? (
        <section id="playlist" className="invite-section invite-section--surface">
          <h2 className="invite-section-title">{ui.playlist}</h2>
          <iframe
            title={ui.playlist}
            src={embed}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 0, borderRadius: 8 }}
          />
        </section>
      ) : null}

      <section id="rsvp" className="invite-section invite-section--surface">
        <h2 className="invite-section-title">{ui.rsvp}</h2>
        {isPast ? (
          <p className="invite-prompt">{ui.pastEventPrompt}</p>
        ) : (
          <>
        <p className="invite-prompt">{rsvpFields.prompt}</p>
        {rsvpFields.deadline ? (
          <p className="invite-deadline">
            {deadlinePassed
              ? ui.deadlinePassed
              : deadlineDays === 0
                ? ui.deadlineToday
                : ui.deadlineInDays
                    .replace(
                      "{days}",
                      String(deadlineDays ?? 0),
                    )
                    .replace("{date}", rsvpFields.deadline)}
          </p>
        ) : null}
        {event.capacity ? (
          <p className="invite-deadline">
            {atCapacity
              ? ui.atCapacity
              : ui.seatsOpen
                  .replace(
                    "{open}",
                    String(Math.max(0, event.capacity - seatsTaken)),
                  )
                  .replace("{capacity}", String(event.capacity))}
          </p>
        ) : null}

        {success ? (
          <div className="rsvp-success" role="status">
            <span className="rsvp-check" aria-hidden>
              ✓
            </span>
            <p className="rsvp-success-text">{ui.successTitle}</p>
            <p className="rsvp-success-sub">
              {event.thankYouMessage?.trim() || ui.successBody}
            </p>
            {editToken ? (
              <p className="rsvp-success-sub">
                <a href={`/rsvp/${editToken}`} className="invite-address">
                  {ui.updateRsvp}
                </a>
              </p>
            ) : null}
          </div>
        ) : deadlinePassed || atCapacity ? (
          <p className="invite-prompt">
            {atCapacity ? ui.eventFull : ui.rsvpClosed}
          </p>
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
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next === "") {
                      setGuestCount("");
                      return;
                    }
                    const n = Number(next);
                    if (!Number.isFinite(n)) return;
                    setGuestCount(
                      Math.min(rsvpFields.plusOnes.max, Math.max(0, n)),
                    );
                  }}
                  onBlur={() => {
                    if (guestCount === "" || guestCount < 1) {
                      setGuestCount(1);
                    }
                  }}
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

            {customQuestions.map((q: CustomQuestion) => {
              if (q.type === "meal" || q.type === "multiple") {
                const value =
                  q.type === "meal"
                    ? mealChoice || String(answers[q.id] ?? "")
                    : String(answers[q.id] ?? "");
                return (
                  <label key={q.id} className="rsvp-field">
                    <span>
                      {q.label}
                      {q.required ? " *" : ""}
                    </span>
                    <select
                      required={q.required}
                      value={value}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (q.type === "meal") {
                          setMealChoice(v);
                          setAnswers((a) => ({ ...a, [q.id]: v }));
                        } else {
                          setAnswers((a) => ({ ...a, [q.id]: v }));
                        }
                      }}
                    >
                      <option value="">{ui.selectOption}</option>
                      {(q.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              if (q.type === "checkbox") {
                const selected = Array.isArray(answers[q.id])
                  ? (answers[q.id] as string[])
                  : [];
                return (
                  <fieldset key={q.id} className="rsvp-field">
                    <legend>
                      {q.label}
                      {q.required ? " *" : ""}
                    </legend>
                    {(q.options ?? []).map((opt) => {
                      const checked = selected.includes(opt);
                      return (
                        <label key={opt} className="rsvp-check">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? selected.filter((x) => x !== opt)
                                : [...selected, opt];
                              setAnswers((a) => ({ ...a, [q.id]: next }));
                            }}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </fieldset>
                );
              }
              return (
                <label key={q.id} className="rsvp-field">
                  <span>
                    {q.label}
                    {q.required ? " *" : ""}
                  </span>
                  <input
                    type="text"
                    required={q.required}
                    value={String(answers[q.id] ?? "")}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                    }
                  />
                </label>
              );
            })}

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
          </>
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
        <p>{ui.hostedBy.replace("{name}", event.hostName)}</p>
        {event.showOwnviteFooter !== false ? (
          <p className="invite-footer-attr">Ownvite</p>
        ) : null}
      </footer>

      <style jsx>{`
        .invite-root {
          min-height: 100vh;
          background: var(--invite-bg);
          color: var(--invite-text);
          font-family: var(--font-body);
          scroll-behavior: smooth;
        }

        :global(.invite-cover) {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: clamp(1.25rem, 4vw, 3rem);
          padding-top: calc(clamp(1.25rem, 4vw, 3rem) + env(safe-area-inset-top, 0px));
          padding-bottom: calc(clamp(1.5rem, 5vw, 3.5rem) + env(safe-area-inset-bottom, 0px));
        }

        :global(.invite-cover-atmosphere) {
          position: absolute;
          inset: -6% 0 0 0;
          z-index: 0;
          will-change: transform;
        }

        :global(.invite-cover-atmosphere-img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          filter: saturate(1.05);
          animation: heroScale 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        :global(.invite-cover-atmosphere-veil) {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              ellipse 70% 60% at 50% 40%,
              color-mix(in srgb, var(--invite-bg) 20%, transparent),
              transparent 70%
            ),
            linear-gradient(
              to bottom,
              color-mix(in srgb, var(--invite-bg) 35%, transparent) 0%,
              color-mix(in srgb, var(--invite-bg) 72%, transparent) 55%,
              var(--invite-bg) 100%
            );
        }

        :global(.invite-cover-stage) {
          position: relative;
          z-index: 1;
          width: min(100%, 42rem);
        }

        :global(.invite-card) {
          background: color-mix(in srgb, var(--invite-surface) 92%, white);
          color: var(--invite-text);
          border: 1px solid color-mix(in srgb, var(--invite-accent) 35%, transparent);
          box-shadow:
            0 1px 0 color-mix(in srgb, white 55%, transparent) inset,
            0 24px 60px color-mix(in srgb, var(--invite-text) 14%, transparent);
          overflow: hidden;
          backdrop-filter: blur(6px);
        }

        :global(.invite-card-body) {
          padding: clamp(1.6rem, 5vw, 2.75rem) clamp(1.35rem, 4vw, 2.4rem);
          text-align: center;
        }

        :global(.invite-card-photo) {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 10;
        }

        :global(.invite-card-photo img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        :global(.invite-card-photo--inset) {
          aspect-ratio: 16 / 9;
          margin: 1.25rem auto 0;
          max-width: 92%;
          border: 1px solid color-mix(in srgb, var(--invite-accent) 28%, transparent);
        }

        :global(.invite-ornament) {
          display: block;
          width: min(9rem, 55%);
          margin: 0 auto 1rem;
          color: var(--invite-accent);
        }

        :global(.invite-ornament--line) {
          height: 1px;
          width: min(6rem, 40%);
          background: color-mix(in srgb, var(--invite-accent) 70%, transparent);
          margin-bottom: 1.1rem;
        }

        :global(.invite-ornament--dots) {
          display: flex;
          justify-content: center;
          gap: 0.45rem;
          width: auto;
          margin-bottom: 1rem;
        }

        :global(.invite-ornament--dots span) {
          width: 0.4rem;
          height: 0.4rem;
          border-radius: 999px;
          background: var(--invite-accent);
          animation: inviteTwinkle 2.8s ease-in-out infinite;
        }

        :global(.invite-ornament--dots span:nth-child(2)) {
          background: var(--invite-accent-2);
          animation-delay: 0.35s;
        }
        :global(.invite-ornament--dots span:nth-child(3)) {
          animation-delay: 0.7s;
        }
        :global(.invite-ornament--dots span:nth-child(4)) {
          background: var(--invite-accent-2);
          animation-delay: 1s;
        }
        :global(.invite-ornament--dots span:nth-child(5)) {
          animation-delay: 1.3s;
        }

        :global(.invite-card-host) {
          margin: 0 0 0.35rem;
          font-family: var(--font-display);
          font-size: 0.78rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--invite-accent);
        }

        :global(.invite-card-invite-line) {
          margin: 0 0 0.85rem;
          font-size: 0.95rem;
          font-style: italic;
          color: var(--invite-muted);
        }

        :global(.invite-card-headline) {
          margin: 0 0 1rem;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: clamp(2rem, 7vw, 3.15rem);
          line-height: 1.08;
          color: var(--invite-text);
        }

        :global(.invite-card-when) {
          margin: 0.25rem 0 0;
          display: grid;
          gap: 0.2rem;
        }

        :global(.invite-card-date) {
          margin: 0;
          font-family: var(--font-display);
          font-size: 1.15rem;
          color: var(--invite-text);
        }

        :global(.invite-card-time),
        :global(.invite-card-venue) {
          margin: 0;
          font-size: 1rem;
          color: color-mix(in srgb, var(--invite-text) 88%, var(--invite-muted));
        }

        :global(.invite-card-address) {
          margin: 0.15rem 0 0;
          font-size: 0.92rem;
          color: var(--invite-muted);
          line-height: 1.4;
        }

        :global(.invite-card-tagline) {
          margin: 1.15rem 0 0;
          font-size: 1.02rem;
          line-height: 1.5;
          color: var(--invite-muted);
        }

        :global(.invite-card-actions) {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          justify-content: center;
          margin-top: 1.5rem;
        }

        :global(.invite-card-share) {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem 1.2rem;
          justify-content: center;
          margin-top: 1rem;
        }

        :global(.invite-text-link) {
          background: none;
          border: 0;
          padding: 0;
          font: inherit;
          font-size: 0.88rem;
          color: var(--invite-accent);
          text-decoration: underline;
          text-underline-offset: 0.18em;
          cursor: pointer;
        }

        /* Layout variants */
        :global(.invite-cover[data-layout="foil"] .invite-card),
        :global(.invite-cover[data-layout="glam"] .invite-card) {
          border-width: 2px;
          border-color: color-mix(in srgb, var(--invite-accent) 65%, white);
          box-shadow:
            0 0 0 6px color-mix(in srgb, var(--invite-surface) 90%, white),
            0 0 0 7px color-mix(in srgb, var(--invite-accent) 45%, transparent),
            0 28px 70px color-mix(in srgb, var(--invite-text) 16%, transparent);
        }

        :global(.invite-cover[data-layout="script"] .invite-card-headline) {
          font-weight: 400;
          font-size: clamp(2.4rem, 9vw, 3.8rem);
          line-height: 1.12;
        }

        :global(.invite-cover[data-layout="arch"] .invite-card-photo) {
          aspect-ratio: 1 / 1.05;
          margin: 1.1rem 1.1rem 0;
          border-radius: 999px 999px 1.25rem 1.25rem;
        }

        :global(.invite-cover[data-layout="arch"] .invite-card) {
          border-radius: 1.5rem;
        }

        :global(.invite-cover[data-layout="party"] .invite-card) {
          border: 0;
          border-radius: 1.35rem;
          background:
            radial-gradient(
              circle at 12% 18%,
              color-mix(in srgb, var(--invite-accent-2) 22%, transparent),
              transparent 42%
            ),
            radial-gradient(
              circle at 88% 12%,
              color-mix(in srgb, var(--invite-accent) 20%, transparent),
              transparent 40%
            ),
            color-mix(in srgb, var(--invite-surface) 94%, white);
        }

        :global(.invite-cover[data-layout="fiesta"] .invite-card) {
          border: 3px solid var(--invite-accent);
          background:
            linear-gradient(
              135deg,
              color-mix(in srgb, var(--invite-accent-2) 12%, var(--invite-surface)),
              var(--invite-surface) 40%,
              color-mix(in srgb, var(--invite-accent) 10%, var(--invite-surface))
            );
        }

        :global(.invite-cover[data-layout="fiesta"] .invite-card-host) {
          letter-spacing: 0.28em;
        }

        :global(.invite-cover[data-layout="botanical"] .invite-card),
        :global(.invite-cover[data-layout="coastal"] .invite-card) {
          border-style: solid;
          border-color: color-mix(in srgb, var(--invite-accent) 40%, transparent);
        }

        :global(.invite-cover[data-layout="kraft"] .invite-card) {
          background:
            repeating-linear-gradient(
              -12deg,
              transparent,
              transparent 11px,
              color-mix(in srgb, var(--invite-text) 3%, transparent) 11px,
              color-mix(in srgb, var(--invite-text) 3%, transparent) 12px
            ),
            var(--invite-surface);
          border: 1px dashed color-mix(in srgb, var(--invite-accent) 45%, transparent);
        }

        :global(.invite-cover[data-layout="minimal"] .invite-card) {
          border: 0;
          box-shadow: 0 18px 50px color-mix(in srgb, var(--invite-text) 10%, transparent);
          background: var(--invite-bg);
        }

        :global(.invite-cover[data-layout="minimal"] .invite-card-body) {
          border: 1px solid color-mix(in srgb, var(--invite-text) 12%, transparent);
          margin: 0.85rem;
          padding: clamp(1.5rem, 4vw, 2.4rem);
        }

        :global(.invite-cover[data-layout="comic"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(
              circle at 20% 20%,
              color-mix(in srgb, var(--invite-accent) 35%, transparent),
              transparent 45%
            ),
            radial-gradient(
              circle at 80% 30%,
              color-mix(in srgb, var(--invite-accent-2) 40%, transparent),
              transparent 42%
            ),
            linear-gradient(
              160deg,
              color-mix(in srgb, var(--invite-bg) 55%, transparent) 0%,
              color-mix(in srgb, var(--invite-bg) 88%, transparent) 70%,
              var(--invite-bg) 100%
            );
        }

        :global(.invite-cover[data-layout="comic"] .comic-halftone) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.18;
          background-image: radial-gradient(#111 18%, transparent 19%);
          background-size: 14px 14px;
          mix-blend-mode: multiply;
        }

        :global(.invite-cover[data-layout="comic"] .invite-card) {
          position: relative;
          border: 4px solid #111;
          border-radius: 1.1rem;
          background:
            radial-gradient(
              circle at 12% 10%,
              color-mix(in srgb, var(--invite-accent-2) 28%, transparent),
              transparent 40%
            ),
            radial-gradient(
              circle at 90% 0%,
              color-mix(in srgb, var(--invite-accent) 18%, transparent),
              transparent 38%
            ),
            var(--invite-surface);
          box-shadow:
            8px 8px 0 #111,
            0 28px 50px color-mix(in srgb, #111 22%, transparent);
          transform: rotate(-1.2deg);
        }

        :global(.invite-cover[data-layout="comic"] .invite-card-photo) {
          margin: 0.9rem 0.9rem 0;
          border: 3px solid #111;
          border-radius: 0.75rem;
          box-shadow: 4px 4px 0 var(--invite-accent);
          aspect-ratio: 16 / 10;
        }

        :global(.invite-cover[data-layout="comic"] .invite-card-host) {
          font-family: var(--font-display);
          font-size: 1.05rem;
          letter-spacing: 0.08em;
          color: var(--invite-accent);
          text-shadow: 2px 2px 0 #111;
        }

        :global(.invite-cover[data-layout="comic"] .invite-card-invite-line) {
          font-style: normal;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 0.82rem;
          color: var(--invite-text);
        }

        :global(.invite-cover[data-layout="comic"] .invite-card-headline) {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: clamp(2.6rem, 10vw, 4rem);
          line-height: 0.95;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--invite-accent);
          -webkit-text-stroke: 1.5px #111;
          paint-order: stroke fill;
          text-shadow: 4px 4px 0 var(--invite-bg), 6px 6px 0 #111;
          transform: rotate(-2deg);
        }

        :global(.invite-cover[data-layout="comic"] .invite-card-when) {
          margin-top: 0.85rem;
          padding: 0.85rem 1rem;
          background: var(--invite-bg);
          border: 3px solid #111;
          border-radius: 0.65rem;
          box-shadow: 3px 3px 0 var(--invite-accent-2);
        }

        :global(.invite-cover[data-layout="comic"] .invite-card-date) {
          font-family: var(--font-display);
          font-size: 1.35rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        :global(.invite-cover[data-layout="comic"] .invite-ornament--comic) {
          width: auto;
          margin-bottom: 0.85rem;
        }

        :global(.invite-cover[data-layout="comic"] .comic-burst) {
          display: inline-block;
          padding: 0.35rem 0.7rem;
          background: var(--invite-accent);
          color: var(--invite-bg);
          border: 3px solid #111;
          border-radius: 999px;
          font-family: var(--font-display);
          font-size: 1.1rem;
          letter-spacing: 0.04em;
          transform: rotate(-8deg);
          box-shadow: 3px 3px 0 #111;
          animation: comicPop 2.4s ease-in-out infinite;
        }

        :global(.invite-cover[data-layout="comic"] .comic-sticker) {
          position: absolute;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 3.4rem;
          min-height: 3.4rem;
          padding: 0.35rem;
          background: var(--invite-accent-2);
          color: #111;
          border: 3px solid #111;
          border-radius: 999px;
          font-family: var(--font-display);
          font-size: 0.95rem;
          letter-spacing: 0.04em;
          box-shadow: 3px 3px 0 #111;
        }

        :global(.invite-cover[data-layout="comic"] .comic-sticker--tl) {
          top: 0.65rem;
          left: 0.55rem;
          transform: rotate(-14deg);
          background: var(--invite-accent);
          color: var(--invite-bg);
        }

        :global(.invite-cover[data-layout="comic"] .comic-sticker--tr) {
          top: 1.1rem;
          right: 0.55rem;
          transform: rotate(12deg);
        }

        :global(.invite-cover[data-layout="comic"] .btn-primary) {
          border: 3px solid #111;
          border-radius: 0.55rem;
          box-shadow: 3px 3px 0 #111;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        :global(.invite-cover[data-layout="comic"] .btn-ghost) {
          border: 3px solid #111;
          border-radius: 0.55rem;
          background: var(--invite-bg);
          box-shadow: 3px 3px 0 var(--invite-accent-2);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 700;
        }

        @keyframes comicPop {
          0%,
          100% {
            transform: rotate(-8deg) scale(1);
          }
          50% {
            transform: rotate(-4deg) scale(1.08);
          }
        }

        :global(.invite-cover[data-layout="festive"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(
              circle at 15% 18%,
              color-mix(in srgb, #ff4d8d 34%, transparent),
              transparent 42%
            ),
            radial-gradient(
              circle at 82% 22%,
              color-mix(in srgb, #4d96ff 30%, transparent),
              transparent 40%
            ),
            radial-gradient(
              circle at 55% 8%,
              color-mix(in srgb, #ffd23f 36%, transparent),
              transparent 38%
            ),
            linear-gradient(
              165deg,
              color-mix(in srgb, var(--invite-bg) 45%, transparent) 0%,
              color-mix(in srgb, var(--invite-bg) 86%, transparent) 68%,
              var(--invite-bg) 100%
            );
        }

        :global(.invite-cover[data-layout="festive"] .festive-confetti) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.55;
          background-image:
            radial-gradient(circle at 12% 22%, #ff4d8d 0 3px, transparent 4px),
            radial-gradient(circle at 28% 68%, #ffd23f 0 2.5px, transparent 3.5px),
            radial-gradient(circle at 46% 18%, #4d96ff 0 3px, transparent 4px),
            radial-gradient(circle at 62% 74%, #c77dff 0 2.5px, transparent 3.5px),
            radial-gradient(circle at 78% 30%, #7cffb2 0 3px, transparent 4px),
            radial-gradient(circle at 88% 62%, #ff8a3d 0 2.5px, transparent 3.5px),
            radial-gradient(circle at 18% 88%, #ff6b9d 0 2px, transparent 3px),
            radial-gradient(circle at 70% 48%, #4d96ff 0 2px, transparent 3px);
          animation: festiveDrift 9s ease-in-out infinite alternate;
        }

        :global(.invite-cover[data-layout="festive"] .invite-card) {
          position: relative;
          overflow: visible;
          border: 0;
          border-radius: 1.6rem;
          background:
            linear-gradient(var(--invite-surface), var(--invite-surface))
              padding-box,
            linear-gradient(
              135deg,
              #ff4d8d,
              #ffd23f,
              #7cffb2,
              #4d96ff,
              #c77dff,
              #ff4d8d
            )
              border-box;
          border: 3px solid transparent;
          box-shadow:
            0 1px 0 color-mix(in srgb, white 70%, transparent) inset,
            0 22px 50px color-mix(in srgb, #2a1848 14%, transparent);
        }

        :global(.invite-cover[data-layout="festive"] .festive-garland-wrap) {
          position: relative;
          z-index: 2;
          margin: -0.35rem 0.35rem -0.6rem;
          padding: 0.15rem 0.4rem 0;
        }

        :global(.invite-cover[data-layout="festive"] .festive-garland) {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
        }

        :global(.invite-cover[data-layout="festive"] .festive-balloon) {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: festiveBob 3.2s ease-in-out infinite;
        }

        :global(.invite-cover[data-layout="festive"] .festive-balloon--1),
        :global(.invite-cover[data-layout="festive"] .festive-balloon--4) {
          animation-delay: 0.35s;
        }

        :global(.invite-cover[data-layout="festive"] .festive-balloon--2),
        :global(.invite-cover[data-layout="festive"] .festive-balloon--5) {
          animation-delay: 0.7s;
        }

        :global(.invite-cover[data-layout="festive"] .festive-balloon--3),
        :global(.invite-cover[data-layout="festive"] .festive-balloon--6) {
          animation-delay: 1.05s;
        }

        :global(.invite-cover[data-layout="festive"] .invite-card-photo) {
          margin: 0.35rem 1rem 0;
          border-radius: 1.15rem;
          aspect-ratio: 16 / 10;
          box-shadow:
            0 0 0 3px #fff,
            0 0 0 6px color-mix(in srgb, var(--invite-accent) 55%, #ffd23f),
            0 10px 24px color-mix(in srgb, #2a1848 12%, transparent);
        }

        :global(.invite-cover[data-layout="festive"] .invite-card-body) {
          padding-top: 1.1rem;
        }

        :global(.invite-cover[data-layout="festive"] .invite-ornament--festive) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          width: auto;
          margin-bottom: 0.85rem;
        }

        :global(.invite-cover[data-layout="festive"] .festive-dot) {
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 999px;
          box-shadow: 0 1px 0 color-mix(in srgb, #2a1848 12%, transparent);
        }

        :global(.invite-cover[data-layout="festive"] .invite-card-host) {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.05rem;
          letter-spacing: 0.04em;
          text-transform: none;
          color: var(--invite-accent);
        }

        :global(.invite-cover[data-layout="festive"] .invite-card-invite-line) {
          font-style: normal;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--invite-muted);
        }

        :global(.invite-cover[data-layout="festive"] .invite-card-headline) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(2.4rem, 9vw, 3.6rem);
          line-height: 1.02;
          letter-spacing: -0.01em;
          background: linear-gradient(
            105deg,
            #ff4d8d 0%,
            #ff8a3d 28%,
            #ffd23f 52%,
            #4d96ff 78%,
            #c77dff 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        :global(.invite-cover[data-layout="festive"] .invite-card-when) {
          margin-top: 0.9rem;
          padding: 0.95rem 1.05rem;
          border-radius: 1rem;
          background:
            radial-gradient(
              circle at 12% 20%,
              color-mix(in srgb, #ffd23f 28%, transparent),
              transparent 48%
            ),
            radial-gradient(
              circle at 90% 80%,
              color-mix(in srgb, #4d96ff 18%, transparent),
              transparent 50%
            ),
            color-mix(in srgb, var(--invite-bg) 88%, white);
          border: 1.5px dashed color-mix(in srgb, var(--invite-accent) 45%, transparent);
        }

        :global(.invite-cover[data-layout="festive"] .invite-card-date) {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--invite-text);
        }

        :global(.invite-cover[data-layout="festive"] .btn-primary) {
          border-radius: 999px;
          background: linear-gradient(120deg, #ff4d8d, #ff8a3d 55%, #ffd23f);
          color: #2a1848;
          font-weight: 700;
          box-shadow: 0 8px 18px color-mix(in srgb, #ff4d8d 28%, transparent);
        }

        :global(.invite-cover[data-layout="festive"] .btn-ghost) {
          border-radius: 999px;
          border: 2px solid color-mix(in srgb, var(--invite-accent) 45%, transparent);
          background: white;
          font-weight: 600;
        }

        @keyframes festiveBob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2.5px);
          }
        }

        @keyframes festiveDrift {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(0, 10px, 0);
          }
        }

        :global(.invite-cover[data-layout="toybox"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(
              circle at 18% 20%,
              color-mix(in srgb, #ffd400 42%, transparent),
              transparent 42%
            ),
            radial-gradient(
              circle at 82% 18%,
              color-mix(in srgb, #2f6fe0 38%, transparent),
              transparent 44%
            ),
            linear-gradient(
              165deg,
              color-mix(in srgb, var(--invite-bg) 40%, transparent) 0%,
              color-mix(in srgb, var(--invite-bg) 88%, transparent) 70%,
              var(--invite-bg) 100%
            );
        }

        :global(.invite-cover[data-layout="toybox"] .toybox-dots) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.45;
          background-image:
            radial-gradient(#2f6fe0 0 2.5px, transparent 3px),
            radial-gradient(#ffd400 0 2px, transparent 2.5px);
          background-size: 28px 28px, 36px 36px;
          background-position: 0 0, 14px 10px;
          animation: toyboxFloat 8s ease-in-out infinite alternate;
        }

        :global(.invite-cover[data-layout="toybox"] .invite-card) {
          position: relative;
          overflow: visible;
          border: 4px solid var(--invite-accent);
          border-radius: 1.75rem;
          background:
            radial-gradient(
              circle at 10% 12%,
              color-mix(in srgb, var(--invite-accent-2) 26%, transparent),
              transparent 38%
            ),
            radial-gradient(
              circle at 92% 8%,
              color-mix(in srgb, var(--invite-accent) 14%, transparent),
              transparent 36%
            ),
            var(--invite-surface);
          box-shadow:
            0 0 0 6px color-mix(in srgb, var(--invite-accent-2) 75%, white),
            0 22px 48px color-mix(in srgb, #1c3a6e 16%, transparent);
        }

        :global(.invite-cover[data-layout="toybox"] .toy-sticker) {
          position: absolute;
          z-index: 3;
          width: 3.1rem;
          height: 3.1rem;
          filter: drop-shadow(0 4px 0 color-mix(in srgb, #1c3a6e 18%, transparent));
          animation: toyWiggle 3.6s ease-in-out infinite;
        }

        :global(.invite-cover[data-layout="toybox"] .toy-sticker--block) {
          top: -0.85rem;
          left: 0.7rem;
          --toy-rot: -10deg;
        }

        :global(.invite-cover[data-layout="toybox"] .toy-sticker--star) {
          top: -0.55rem;
          right: 0.85rem;
          width: 2.7rem;
          height: 2.7rem;
          animation-delay: 0.45s;
          --toy-rot: 12deg;
        }

        :global(.invite-cover[data-layout="toybox"] .toy-sticker--ball) {
          bottom: 5.5rem;
          right: -0.65rem;
          width: 2.85rem;
          height: 2.85rem;
          animation-delay: 0.9s;
          --toy-rot: 8deg;
        }

        :global(.invite-cover[data-layout="toybox"] .invite-card-photo) {
          margin: 1.35rem 1.1rem 0;
          border-radius: 1.25rem;
          border: 3px solid var(--invite-accent);
          aspect-ratio: 4 / 3;
          box-shadow: 0 8px 0 color-mix(in srgb, var(--invite-accent-2) 85%, white);
        }

        :global(.invite-cover[data-layout="toybox"] .invite-ornament--toybox) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          width: auto;
          margin-bottom: 0.75rem;
        }

        :global(.invite-cover[data-layout="toybox"] .toy-pip) {
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 999px;
          border: 1.5px solid #1c3a6e;
        }

        :global(.invite-cover[data-layout="toybox"] .toy-pip--square) {
          border-radius: 0.2rem;
          transform: rotate(12deg);
        }

        :global(.invite-cover[data-layout="toybox"] .invite-card-host) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.15rem;
          letter-spacing: 0.02em;
          text-transform: none;
          color: var(--invite-accent);
        }

        :global(.invite-cover[data-layout="toybox"] .invite-card-invite-line) {
          font-style: normal;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: var(--invite-muted);
        }

        :global(.invite-cover[data-layout="toybox"] .invite-card-headline) {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(2.5rem, 9vw, 3.7rem);
          line-height: 0.98;
          letter-spacing: -0.01em;
          color: var(--invite-accent);
          text-shadow: 3px 3px 0 var(--invite-accent-2);
        }

        :global(.invite-cover[data-layout="toybox"] .invite-card-when) {
          margin-top: 0.9rem;
          padding: 1rem 1.1rem;
          border-radius: 1.15rem;
          background: color-mix(in srgb, var(--invite-accent-2) 28%, white);
          border: 2.5px dashed var(--invite-accent);
        }

        :global(.invite-cover[data-layout="toybox"] .invite-card-date) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.3rem;
          color: var(--invite-text);
        }

        :global(.invite-cover[data-layout="toybox"] .btn-primary) {
          border-radius: 999px;
          background: var(--invite-accent);
          color: #fffdf7;
          font-weight: 700;
          border: 2.5px solid #1c3a6e;
          box-shadow: 0 5px 0 var(--invite-accent-2);
        }

        :global(.invite-cover[data-layout="toybox"] .btn-ghost) {
          border-radius: 999px;
          border: 2.5px solid var(--invite-accent);
          background: white;
          color: var(--invite-accent);
          font-weight: 700;
          box-shadow: 0 4px 0 color-mix(in srgb, var(--invite-accent-2) 70%, white);
        }

        @keyframes toyWiggle {
          0%,
          100% {
            transform: rotate(var(--toy-rot, -8deg)) translateY(0);
          }
          50% {
            transform: rotate(calc(var(--toy-rot, -8deg) + 6deg)) translateY(-3px);
          }
        }

        @keyframes toyboxFloat {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(0, 8px, 0);
          }
        }

        :global(.invite-cover[data-layout="azure"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(
              circle at 20% 15%,
              color-mix(in srgb, #2b6fff 55%, transparent),
              transparent 42%
            ),
            radial-gradient(
              circle at 80% 25%,
              color-mix(in srgb, #7ec8ff 40%, transparent),
              transparent 45%
            ),
            linear-gradient(
              165deg,
              color-mix(in srgb, #0b1f3a 55%, transparent) 0%,
              color-mix(in srgb, #0b1f3a 88%, transparent) 70%,
              #0b1f3a 100%
            );
        }

        :global(.invite-cover[data-layout="azure"] .azure-glow) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(
              circle at 50% 0%,
              color-mix(in srgb, #7ec8ff 28%, transparent),
              transparent 55%
            );
          animation: azurePulse 7s ease-in-out infinite alternate;
        }

        :global(.invite-cover[data-layout="azure"] .invite-card) {
          position: relative;
          overflow: hidden;
          border: 0;
          border-radius: 1.5rem;
          background:
            linear-gradient(
              160deg,
              color-mix(in srgb, #7ec8ff 14%, var(--invite-surface)) 0%,
              var(--invite-surface) 38%,
              #ffffff 100%
            );
          box-shadow:
            0 1px 0 color-mix(in srgb, white 70%, transparent) inset,
            0 28px 60px color-mix(in srgb, #041226 45%, transparent);
        }

        :global(.invite-cover[data-layout="azure"] .azure-ring) {
          position: absolute;
          z-index: 1;
          border-radius: 999px;
          border: 2px solid color-mix(in srgb, var(--invite-accent) 45%, transparent);
          pointer-events: none;
        }

        :global(.invite-cover[data-layout="azure"] .azure-ring--tl) {
          width: 7.5rem;
          height: 7.5rem;
          top: -2.8rem;
          left: -2.6rem;
          border-color: color-mix(in srgb, var(--invite-accent-2) 70%, transparent);
          animation: azureSpin 18s linear infinite;
        }

        :global(.invite-cover[data-layout="azure"] .azure-ring--br) {
          width: 9rem;
          height: 9rem;
          right: -3.2rem;
          bottom: -3.4rem;
          border-style: dashed;
          border-color: color-mix(in srgb, var(--invite-accent) 40%, transparent);
          animation: azureSpin 24s linear infinite reverse;
        }

        :global(.invite-cover[data-layout="azure"] .invite-card-photo) {
          margin: 1.35rem auto 0;
          width: min(72%, 16rem);
          aspect-ratio: 1;
          border-radius: 999px;
          border: 3px solid var(--invite-accent);
          box-shadow:
            0 0 0 6px color-mix(in srgb, var(--invite-accent-2) 35%, white),
            0 16px 32px color-mix(in srgb, #0b1f3a 18%, transparent);
        }

        :global(.invite-cover[data-layout="azure"] .invite-ornament--azure) {
          width: 8.5rem;
          margin-bottom: 0.85rem;
          color: var(--invite-accent);
        }

        :global(.invite-cover[data-layout="azure"] .invite-card-host) {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--invite-accent);
        }

        :global(.invite-cover[data-layout="azure"] .invite-card-invite-line) {
          font-style: normal;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-size: 0.78rem;
          color: var(--invite-muted);
        }

        :global(.invite-cover[data-layout="azure"] .invite-card-headline) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(2.2rem, 8vw, 3.25rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--invite-text);
        }

        :global(.invite-cover[data-layout="azure"] .invite-card-when) {
          margin-top: 1rem;
          padding: 1rem 1.15rem;
          border-radius: 1rem;
          background: color-mix(in srgb, var(--invite-accent) 8%, white);
          border-left: 4px solid var(--invite-accent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--invite-accent) 12%, transparent);
        }

        :global(.invite-cover[data-layout="azure"] .invite-card-date) {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.15rem;
          letter-spacing: -0.01em;
        }

        :global(.invite-cover[data-layout="azure"] .btn-primary) {
          border-radius: 999px;
          background: linear-gradient(120deg, #2b6fff, #1a4fd6);
          color: #f4f8ff;
          font-weight: 600;
          letter-spacing: 0.04em;
          box-shadow: 0 10px 24px color-mix(in srgb, #2b6fff 35%, transparent);
        }

        :global(.invite-cover[data-layout="azure"] .btn-ghost) {
          border-radius: 999px;
          border: 1.5px solid color-mix(in srgb, var(--invite-accent) 45%, transparent);
          background: transparent;
          color: var(--invite-accent);
          font-weight: 600;
        }

        @keyframes azurePulse {
          from {
            opacity: 0.55;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes azureSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        :global(.invite-cover[data-layout="quince"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(
              circle at 18% 16%,
              color-mix(in srgb, #2b6fff 50%, transparent),
              transparent 42%
            ),
            radial-gradient(
              circle at 82% 22%,
              color-mix(in srgb, #d4af37 38%, transparent),
              transparent 44%
            ),
            linear-gradient(
              165deg,
              color-mix(in srgb, #0b1f3a 50%, transparent) 0%,
              color-mix(in srgb, #0b1f3a 88%, transparent) 70%,
              #0b1f3a 100%
            );
        }

        :global(.invite-cover[data-layout="quince"] .invite-card) {
          position: relative;
          overflow: hidden;
          border: 0;
          border-radius: 1.5rem;
          background:
            linear-gradient(
              160deg,
              color-mix(in srgb, #d4af37 12%, var(--invite-surface)) 0%,
              var(--invite-surface) 36%,
              #ffffff 100%
            );
          box-shadow:
            0 1px 0 color-mix(in srgb, white 70%, transparent) inset,
            0 0 0 1px color-mix(in srgb, #d4af37 35%, transparent),
            0 28px 60px color-mix(in srgb, #041226 45%, transparent);
        }

        :global(.invite-cover[data-layout="quince"] .quince-ring) {
          position: absolute;
          z-index: 1;
          border-radius: 999px;
          pointer-events: none;
        }

        :global(.invite-cover[data-layout="quince"] .quince-ring--tl) {
          width: 7.5rem;
          height: 7.5rem;
          top: -2.8rem;
          left: -2.6rem;
          border: 2px solid color-mix(in srgb, #d4af37 65%, transparent);
          animation: azureSpin 20s linear infinite;
        }

        :global(.invite-cover[data-layout="quince"] .quince-ring--br) {
          width: 9rem;
          height: 9rem;
          right: -3.2rem;
          bottom: -3.4rem;
          border: 2px dashed color-mix(in srgb, #2b6fff 45%, transparent);
          animation: azureSpin 26s linear infinite reverse;
        }

        :global(.invite-cover[data-layout="quince"] .quince-xv) {
          position: absolute;
          z-index: 3;
          top: 0.85rem;
          right: 0.95rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3.1rem;
          height: 3.1rem;
          border-radius: 999px;
          background: linear-gradient(145deg, #2b6fff, #1a4fd6);
          color: #f7faff;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: 0.04em;
          border: 2px solid #d4af37;
          box-shadow:
            0 0 0 3px color-mix(in srgb, #d4af37 30%, white),
            0 8px 18px color-mix(in srgb, #0b1f3a 22%, transparent);
        }

        :global(.invite-cover[data-layout="quince"] .invite-card-photo) {
          margin: 1.5rem auto 0;
          width: min(72%, 16rem);
          aspect-ratio: 1;
          border-radius: 999px;
          border: 3px solid var(--invite-accent);
          box-shadow:
            0 0 0 5px color-mix(in srgb, #d4af37 45%, white),
            0 16px 32px color-mix(in srgb, #0b1f3a 18%, transparent);
        }

        :global(.invite-cover[data-layout="quince"] .invite-ornament--quince) {
          width: 8.5rem;
          margin-bottom: 0.85rem;
        }

        :global(.invite-cover[data-layout="quince"] .invite-card-host) {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--invite-accent);
        }

        :global(.invite-cover[data-layout="quince"] .invite-card-invite-line) {
          font-family: var(--font-great-vibes), cursive;
          font-style: normal;
          font-weight: 400;
          font-size: 1.35rem;
          letter-spacing: 0.01em;
          text-transform: none;
          color: color-mix(in srgb, var(--invite-text) 80%, #d4af37);
        }

        :global(.invite-cover[data-layout="quince"] .invite-card-headline) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(2.4rem, 8.5vw, 3.5rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          background: linear-gradient(105deg, #0b1f3a 0%, #2b6fff 55%, #d4af37 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        :global(.invite-cover[data-layout="quince"] .invite-card-when) {
          margin-top: 1rem;
          padding: 1rem 1.15rem;
          border-radius: 1rem;
          background:
            linear-gradient(
              135deg,
              color-mix(in srgb, #2b6fff 8%, white),
              color-mix(in srgb, #d4af37 10%, white)
            );
          border-left: 4px solid #d4af37;
          box-shadow: inset 0 0 0 1px color-mix(in srgb, #2b6fff 12%, transparent);
        }

        :global(.invite-cover[data-layout="quince"] .invite-card-date) {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.2rem;
          letter-spacing: -0.01em;
        }

        :global(.invite-cover[data-layout="quince"] .btn-primary) {
          border-radius: 999px;
          background: linear-gradient(120deg, #2b6fff, #1a4fd6 60%, #d4af37);
          color: #f7faff;
          font-weight: 600;
          letter-spacing: 0.04em;
          box-shadow: 0 10px 24px color-mix(in srgb, #2b6fff 32%, transparent);
        }

        :global(.invite-cover[data-layout="quince"] .btn-ghost) {
          border-radius: 999px;
          border: 1.5px solid color-mix(in srgb, #d4af37 55%, var(--invite-accent));
          background: transparent;
          color: var(--invite-accent);
          font-weight: 600;
        }

        :global(.invite-cover[data-layout="fifty"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(
              circle at 18% 16%,
              color-mix(in srgb, #ff7a59 38%, transparent),
              transparent 42%
            ),
            radial-gradient(
              circle at 82% 20%,
              color-mix(in srgb, #e8a317 42%, transparent),
              transparent 44%
            ),
            radial-gradient(
              circle at 50% 8%,
              color-mix(in srgb, #ffe08a 36%, transparent),
              transparent 40%
            ),
            linear-gradient(
              165deg,
              color-mix(in srgb, var(--invite-bg) 45%, transparent) 0%,
              color-mix(in srgb, var(--invite-bg) 88%, transparent) 70%,
              var(--invite-bg) 100%
            );
        }

        :global(.invite-cover[data-layout="fifty"] .fifty-sparkle) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.7;
          background-image:
            radial-gradient(circle at 14% 24%, #e8a317 0 2.5px, transparent 3.5px),
            radial-gradient(circle at 72% 18%, #ff7a59 0 2px, transparent 3px),
            radial-gradient(circle at 38% 70%, #ffb4a2 0 2.2px, transparent 3.2px),
            radial-gradient(circle at 86% 62%, #ffe08a 0 2px, transparent 3px),
            radial-gradient(circle at 52% 40%, #e8a317 0 1.6px, transparent 2.6px),
            radial-gradient(circle at 24% 82%, #ff7a59 0 1.8px, transparent 2.8px);
          animation: fiftyTwinkle 5.5s ease-in-out infinite alternate;
        }

        :global(.invite-cover[data-layout="fifty"] .invite-card) {
          position: relative;
          overflow: hidden;
          border: 2px solid color-mix(in srgb, #e8a317 55%, transparent);
          border-radius: 1.35rem;
          background:
            radial-gradient(
              circle at 12% 10%,
              color-mix(in srgb, #ffe08a 35%, transparent),
              transparent 42%
            ),
            radial-gradient(
              circle at 90% 8%,
              color-mix(in srgb, #ff7a59 18%, transparent),
              transparent 40%
            ),
            var(--invite-surface);
          color: var(--invite-text);
          box-shadow:
            0 1px 0 color-mix(in srgb, white 70%, transparent) inset,
            0 22px 50px color-mix(in srgb, #3a2a14 12%, transparent);
        }

        :global(.invite-cover[data-layout="fifty"] .fifty-corner) {
          position: absolute;
          z-index: 2;
          width: 1.85rem;
          height: 1.85rem;
          border-color: #e8a317;
          border-style: solid;
          pointer-events: none;
        }

        :global(.invite-cover[data-layout="fifty"] .fifty-corner--tl) {
          top: 0.65rem;
          left: 0.65rem;
          border-width: 2.5px 0 0 2.5px;
        }

        :global(.invite-cover[data-layout="fifty"] .fifty-corner--tr) {
          top: 0.65rem;
          right: 0.65rem;
          border-width: 2.5px 2.5px 0 0;
          border-color: #ff7a59;
        }

        :global(.invite-cover[data-layout="fifty"] .fifty-corner--bl) {
          bottom: 0.65rem;
          left: 0.65rem;
          border-width: 0 0 2.5px 2.5px;
          border-color: #ff7a59;
        }

        :global(.invite-cover[data-layout="fifty"] .fifty-corner--br) {
          bottom: 0.65rem;
          right: 0.65rem;
          border-width: 0 2.5px 2.5px 0;
        }

        :global(.invite-cover[data-layout="fifty"] .fifty-badge) {
          position: absolute;
          z-index: 3;
          top: 0.75rem;
          right: 0.85rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 3.5rem;
          height: 3.5rem;
          padding: 0 0.45rem;
          border-radius: 999px;
          background: linear-gradient(145deg, #ffe08a, #e8a317 50%, #ff7a59);
          color: #3a2a14;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.35rem;
          letter-spacing: -0.02em;
          border: 2px solid #fff;
          box-shadow:
            0 0 0 3px color-mix(in srgb, #e8a317 35%, transparent),
            0 10px 22px color-mix(in srgb, #e8a317 28%, transparent);
          animation: fiftyGlow 3.2s ease-in-out infinite alternate;
        }

        :global(.invite-cover[data-layout="fifty"] .invite-card-photo) {
          margin: 1.6rem auto 0;
          width: min(78%, 18rem);
          aspect-ratio: 4 / 3;
          border-radius: 1.1rem;
          border: 3px solid #e8a317;
          box-shadow:
            0 0 0 5px color-mix(in srgb, #ff7a59 22%, white),
            0 14px 28px color-mix(in srgb, #3a2a14 12%, transparent);
        }

        :global(.invite-cover[data-layout="fifty"] .invite-card-body) {
          color: var(--invite-text);
        }

        :global(.invite-cover[data-layout="fifty"] .invite-ornament--fifty) {
          width: 10rem;
          margin-bottom: 0.9rem;
          color: #e8a317;
        }

        :global(.invite-cover[data-layout="fifty"] .invite-card-host) {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #e8a317;
        }

        :global(.invite-cover[data-layout="fifty"] .invite-card-invite-line) {
          font-family: var(--font-great-vibes), cursive;
          font-style: normal;
          font-weight: 400;
          font-size: 1.5rem;
          letter-spacing: 0.01em;
          text-transform: none;
          color: #ff7a59;
        }

        :global(.invite-cover[data-layout="fifty"] .invite-card-headline) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(2.3rem, 8vw, 3.4rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          background: linear-gradient(105deg, #e8a317 0%, #ff7a59 55%, #f0b429 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        :global(.invite-cover[data-layout="fifty"] .invite-card-when) {
          margin-top: 1rem;
          padding: 1rem 1.15rem;
          border-radius: 1rem;
          background:
            linear-gradient(
              135deg,
              color-mix(in srgb, #ffe08a 45%, white),
              color-mix(in srgb, #ffb4a2 28%, white)
            );
          border: 1.5px dashed color-mix(in srgb, #e8a317 55%, transparent);
        }

        :global(.invite-cover[data-layout="fifty"] .invite-card-date) {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.2rem;
          color: var(--invite-text);
        }

        :global(.invite-cover[data-layout="fifty"] .invite-card-time),
        :global(.invite-cover[data-layout="fifty"] .invite-card-venue),
        :global(.invite-cover[data-layout="fifty"] .invite-card-address),
        :global(.invite-cover[data-layout="fifty"] .invite-card-tagline) {
          color: var(--invite-muted);
        }

        :global(.invite-cover[data-layout="fifty"] .btn-primary) {
          border-radius: 999px;
          background: linear-gradient(120deg, #e8a317, #ff7a59);
          color: #fffef9;
          font-weight: 700;
          letter-spacing: 0.04em;
          box-shadow: 0 10px 24px color-mix(in srgb, #ff7a59 28%, transparent);
        }

        :global(.invite-cover[data-layout="fifty"] .btn-ghost) {
          border-radius: 999px;
          border: 2px solid color-mix(in srgb, #e8a317 55%, transparent);
          background: white;
          color: #c4891a;
          font-weight: 600;
        }

        :global(.invite-cover[data-layout="fifty"] .invite-text-link) {
          color: #c4891a;
        }

        @keyframes fiftyTwinkle {
          from {
            opacity: 0.45;
          }
          to {
            opacity: 0.85;
          }
        }

        @keyframes fiftyGlow {
          from {
            transform: scale(1);
            box-shadow:
              0 0 0 3px color-mix(in srgb, #e8a317 28%, transparent),
              0 10px 22px color-mix(in srgb, #e8a317 22%, transparent);
          }
          to {
            transform: scale(1.05);
            box-shadow:
              0 0 0 5px color-mix(in srgb, #ff7a59 30%, transparent),
              0 12px 28px color-mix(in srgb, #ff7a59 22%, transparent);
          }
        }

        :global(.invite-cover[data-layout="arcade"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(
              circle at 18% 20%,
              color-mix(in srgb, #ff3d9a 45%, transparent),
              transparent 42%
            ),
            radial-gradient(
              circle at 82% 18%,
              color-mix(in srgb, #39ff14 35%, transparent),
              transparent 40%
            ),
            radial-gradient(
              circle at 50% 70%,
              color-mix(in srgb, #00e5ff 30%, transparent),
              transparent 45%
            ),
            linear-gradient(
              165deg,
              color-mix(in srgb, #1a0a3c 50%, transparent) 0%,
              color-mix(in srgb, #1a0a3c 88%, transparent) 72%,
              #1a0a3c 100%
            );
        }

        :global(.invite-cover[data-layout="arcade"] .arcade-scanlines) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.18;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0 3px,
            color-mix(in srgb, #39ff14 35%, transparent) 3px 4px
          );
          animation: arcadeFlicker 4.5s steps(2) infinite;
        }

        :global(.invite-cover[data-layout="arcade"] .invite-card) {
          position: relative;
          overflow: visible;
          border: 4px solid #1a0a3c;
          border-radius: 0.85rem;
          background:
            linear-gradient(
              135deg,
              color-mix(in srgb, #ff3d9a 12%, var(--invite-surface)),
              var(--invite-surface) 40%,
              color-mix(in srgb, #00e5ff 10%, var(--invite-surface))
            );
          box-shadow:
            0 0 0 4px var(--invite-accent-2),
            0 0 0 8px #00e5ff,
            0 0 0 12px var(--invite-accent),
            0 22px 48px color-mix(in srgb, #1a0a3c 40%, transparent);
        }

        :global(.invite-cover[data-layout="arcade"] .arcade-badge) {
          position: absolute;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.4rem 0.55rem;
          border: 3px solid #1a0a3c;
          border-radius: 0.35rem;
          font-family: var(--font-display);
          font-size: 0.55rem;
          letter-spacing: 0.04em;
          line-height: 1;
          box-shadow: 3px 3px 0 #1a0a3c;
          animation: arcadeBounce 2.8s ease-in-out infinite;
        }

        :global(.invite-cover[data-layout="arcade"] .arcade-badge--1up) {
          top: -0.65rem;
          left: 0.7rem;
          background: var(--invite-accent-2);
          color: #1a0a3c;
          --arcade-rot: -8deg;
        }

        :global(.invite-cover[data-layout="arcade"] .arcade-badge--start) {
          top: 0.85rem;
          right: -0.35rem;
          background: #00e5ff;
          color: #1a0a3c;
          animation-delay: 0.4s;
          --arcade-rot: 10deg;
        }

        :global(.invite-cover[data-layout="arcade"] .arcade-sticker--pad) {
          position: absolute;
          z-index: 3;
          width: 3.6rem;
          height: auto;
          bottom: 6.2rem;
          left: -0.7rem;
          filter: drop-shadow(3px 3px 0 #1a0a3c);
          animation: arcadeBounce 3.2s ease-in-out infinite;
          animation-delay: 0.7s;
          --arcade-rot: -12deg;
        }

        :global(.invite-cover[data-layout="arcade"] .invite-card-photo) {
          margin: 1.35rem 1rem 0;
          border: 4px solid #1a0a3c;
          border-radius: 0.65rem;
          aspect-ratio: 16 / 10;
          box-shadow: 5px 5px 0 var(--invite-accent);
          image-rendering: auto;
        }

        :global(.invite-cover[data-layout="arcade"] .invite-ornament--arcade) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          width: auto;
          margin-bottom: 0.85rem;
        }

        :global(.invite-cover[data-layout="arcade"] .arcade-pixel) {
          width: 0.55rem;
          height: 0.55rem;
          border: 1.5px solid #1a0a3c;
        }

        :global(.invite-cover[data-layout="arcade"] .invite-card-host) {
          font-family: var(--font-display);
          font-size: 0.62rem;
          letter-spacing: 0.04em;
          line-height: 1.5;
          color: var(--invite-accent);
          text-shadow: 2px 2px 0 var(--invite-accent-2);
        }

        :global(.invite-cover[data-layout="arcade"] .invite-card-invite-line) {
          font-style: normal;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.72rem;
          color: var(--invite-muted);
        }

        :global(.invite-cover[data-layout="arcade"] .invite-card-headline) {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: clamp(1.35rem, 5.5vw, 2rem);
          line-height: 1.35;
          letter-spacing: 0.02em;
          color: var(--invite-accent);
          text-shadow:
            3px 3px 0 #1a0a3c,
            5px 5px 0 var(--invite-accent-2);
        }

        :global(.invite-cover[data-layout="arcade"] .invite-card-when) {
          margin-top: 0.95rem;
          padding: 0.95rem 1rem;
          border-radius: 0.55rem;
          background: #1a0a3c;
          color: #fff8ff;
          border: 3px solid var(--invite-accent-2);
          box-shadow: 4px 4px 0 var(--invite-accent);
        }

        :global(.invite-cover[data-layout="arcade"] .invite-card-date) {
          font-family: var(--font-display);
          font-size: 0.72rem;
          line-height: 1.55;
          letter-spacing: 0.02em;
          color: var(--invite-accent-2);
        }

        :global(.invite-cover[data-layout="arcade"] .invite-card-time),
        :global(.invite-cover[data-layout="arcade"] .invite-card-venue),
        :global(.invite-cover[data-layout="arcade"] .invite-card-address) {
          color: color-mix(in srgb, #fff8ff 88%, transparent);
        }

        :global(.invite-cover[data-layout="arcade"] .btn-primary) {
          border-radius: 0.45rem;
          border: 3px solid #1a0a3c;
          background: var(--invite-accent);
          color: #fff8ff;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          box-shadow: 4px 4px 0 var(--invite-accent-2);
        }

        :global(.invite-cover[data-layout="arcade"] .btn-ghost) {
          border-radius: 0.45rem;
          border: 3px solid #1a0a3c;
          background: #00e5ff;
          color: #1a0a3c;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          box-shadow: 4px 4px 0 #1a0a3c;
        }

        @keyframes arcadeBounce {
          0%,
          100% {
            transform: rotate(var(--arcade-rot, -6deg)) translateY(0);
          }
          50% {
            transform: rotate(calc(var(--arcade-rot, -6deg) + 5deg))
              translateY(-3px);
          }
        }

        @keyframes arcadeFlicker {
          0%,
          100% {
            opacity: 0.14;
          }
          50% {
            opacity: 0.22;
          }
        }

        .invite-section--paper {
          background:
            linear-gradient(
              180deg,
              color-mix(in srgb, var(--invite-surface) 55%, var(--invite-bg)),
              var(--invite-bg)
            );
        }

        .invite-registry {
          margin-top: 1.5rem;
        }

        .invite-extra-block {
          margin-bottom: 1.5rem;
        }

        .invite-schedule {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.85rem;
        }

        .invite-schedule li {
          display: grid;
          gap: 0.15rem;
        }

        .invite-schedule strong {
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--invite-accent);
        }

        .invite-schedule em {
          font-style: normal;
          color: var(--invite-muted);
          font-size: 0.95rem;
        }

        .invite-extra-line {
          margin: 0.65rem 0 0;
          line-height: 1.55;
          color: color-mix(in srgb, var(--invite-text) 92%, var(--invite-muted));
        }

        .invite-extra-line strong {
          display: block;
          margin-bottom: 0.15rem;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--invite-accent);
        }

        .invite-faq {
          display: grid;
          gap: 1.1rem;
          margin: 0;
        }

        .invite-faq dt {
          font-family: var(--font-display);
          font-size: 1.15rem;
          margin-bottom: 0.25rem;
        }

        .invite-faq dd {
          margin: 0;
          color: var(--invite-muted);
          line-height: 1.55;
        }

        .invite-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.65rem;
        }

        .invite-gallery img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
        }

        .invite-deadline {
          margin: -0.75rem 0 1.25rem;
          font-size: 0.95rem;
          color: var(--invite-accent);
        }

        .rsvp-check {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 0.55rem;
          margin-top: 0.35rem;
          text-transform: none !important;
          letter-spacing: normal !important;
          font-size: 0.95rem !important;
          color: var(--invite-text) !important;
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

        :global(.btn-primary),
        :global(.btn-ghost),
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

        :global(.btn-primary),
        .btn-primary {
          background: var(--invite-accent);
          color: var(--invite-bg);
        }

        :global(.btn-primary:hover),
        .btn-primary:hover {
          background: var(--invite-accent-2);
          color: var(--invite-text);
        }

        :global(.btn-primary:disabled),
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        :global(.btn-ghost),
        .btn-ghost {
          background: transparent;
          color: var(--invite-text);
          border-color: color-mix(in srgb, var(--invite-text) 35%, transparent);
        }

        :global(.btn-ghost:hover),
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

        .invite-about-body {
          margin: 0;
          font-size: 1rem;
          line-height: 1.65;
          color: color-mix(in srgb, var(--invite-text) 90%, var(--invite-muted));
        }

        .invite-about-body :global(h1),
        .invite-about-body :global(h2),
        .invite-about-body :global(h3),
        .invite-about-body :global(h4),
        .invite-about-body :global(h5),
        .invite-about-body :global(h6) {
          margin: 1.1rem 0 0.4rem;
          font-family: var(--font-display);
          font-weight: 600;
          color: var(--invite-text);
          line-height: 1.25;
        }

        .invite-about-body :global(h1) { font-size: 1.75rem; }
        .invite-about-body :global(h2) { font-size: 1.45rem; }
        .invite-about-body :global(h3) { font-size: 1.25rem; }
        .invite-about-body :global(h4),
        .invite-about-body :global(h5),
        .invite-about-body :global(h6) { font-size: 1.1rem; }

        .invite-about-body :global(p) {
          margin: 0.55rem 0 0;
        }

        .invite-about-body :global(b),
        .invite-about-body :global(strong) {
          font-weight: 700;
          color: var(--invite-text);
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

        :global(.fade-up),
        .fade-up {
          opacity: 0;
          transform: translateY(16px);
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        :global(.fade-up-1),
        .fade-up-1 {
          animation-delay: 0.05s;
        }
        :global(.fade-up-2),
        .fade-up-2 {
          animation-delay: 0.15s;
        }
        :global(.fade-up-3),
        .fade-up-3 {
          animation-delay: 0.28s;
        }
        :global(.fade-up-4),
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

        @keyframes inviteTwinkle {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
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
          :global(.fade-up),
          .fade-up,
          :global(.invite-cover-atmosphere-img),
          :global(.comic-burst),
          :global(.festive-confetti),
          :global(.festive-balloon),
          :global(.toybox-dots),
          :global(.toy-sticker),
          :global(.azure-glow),
          :global(.azure-ring),
          :global(.quince-ring),
          :global(.fifty-sparkle),
          :global(.fifty-badge),
          :global(.arcade-scanlines),
          :global(.arcade-badge),
          :global(.arcade-sticker--pad),
          .rsvp-check,
          .rsvp-success-text::after {
            animation: none !important;
          }

          :global(.fade-up),
          .fade-up {
            opacity: 1;
            transform: none;
          }

          :global(.invite-cover-atmosphere-img) {
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
