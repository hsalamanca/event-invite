"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import QuinceRsvp from "@/components/invite/quinceweb/QuinceRsvp";
import type { Locale } from "@/lib/i18n/config";
import {
  resolveLocalizedFaqs,
  resolveLocalizedSchedule,
} from "@/lib/i18n/event-content";
import {
  countdownTo,
  eventInstant,
  localizeStock,
  type LiveVariant,
} from "@/lib/live-invites";
import { safeHttpsUrl } from "@/lib/safe-https-url";
import { safeInviteImageUrl } from "@/lib/safe-image-url";
import { sanitizeAboutHtml } from "@/lib/sanitize-about";
import { resolveInviteLayout, resolveLocalizedInviteCopy } from "@/lib/templates";
import type { EventRecord, RsvpAnswers } from "@/lib/types";
import "./live.css";

const COPY = {
  en: {
    wedding: { kicker: "The wedding of", and: "and", story: "Our story" },
    party: { kicker: "A birthday party", and: "and", story: "The party" },
    baby: { kicker: "A baby shower", and: "and", story: "Before they arrive" },
    live: "Live",
    rsvp: "RSVP",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    today: "It's today",
    past: "This celebration already happened",
    until: "Counting down",
    schedule: "The plan",
    upNext: "Up next",
    place: "The place",
    map: "Open the map",
    dress: "What to wear",
    bring: "What to bring",
    stay: "Where to stay",
    park: "Parking",
    gifts: "Gifts",
    questions: "Good to know",
    seats: "{open} seats still open",
    hosted: "Hosted by {name}",
  },
  es: {
    wedding: { kicker: "La boda de", and: "y", story: "Nuestra historia" },
    party: { kicker: "Una fiesta de cumpleaños", and: "y", story: "La fiesta" },
    baby: { kicker: "Un baby shower", and: "y", story: "Antes de que llegue" },
    live: "En vivo",
    rsvp: "Confirmar",
    days: "Días",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    today: "Hoy es el día",
    past: "Esta fiesta ya pasó",
    until: "Falta",
    schedule: "El plan",
    upNext: "Sigue",
    place: "El lugar",
    map: "Abrir el mapa",
    dress: "Qué ponerse",
    bring: "Qué llevar",
    stay: "Dónde quedarse",
    park: "Estacionamiento",
    gifts: "Regalos",
    questions: "Para saber",
    seats: "{open} lugares disponibles",
    hosted: "Anfitrión: {name}",
  },
} as const;

function fontStack(name: string, fallback: string) {
  const map: Record<string, string> = {
    "Playfair Display": "var(--font-playfair)",
    "Great Vibes": "var(--font-great-vibes)",
    Fraunces: "var(--font-fraunces)",
    Outfit: "var(--font-outfit)",
    Fredoka: "var(--font-fredoka)",
    "Cormorant Garamond": "var(--font-cormorant)",
    "Source Sans 3": "var(--font-source-sans)",
    "DM Sans": "var(--font-dm-sans)",
    Lora: "var(--font-lora)",
  };
  return map[name] ? `${map[name]}, ${name}, ${fallback}` : fallback;
}

function variantFrom(templateId: string): LiveVariant {
  const layout = resolveInviteLayout(templateId);
  if (layout === "liveparty") return "party";
  if (layout === "livebaby") return "baby";
  return "wedding";
}

function coupleParts(headline: string): [string, string] | null {
  const parts = headline.split(/\s+(?:&|y)\s+/i).map((part) => part.trim());
  if (parts.length === 2 && parts[0] && parts[1]) return [parts[0], parts[1]];
  return null;
}

function formatWhen(dateISO: string, locale: Locale) {
  const d = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateISO;
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function LiveInvite({
  event,
  locale,
  seatsTaken = 0,
  atCapacity = false,
  isPast = false,
  trackViews = true,
  onRsvpSubmit,
}: {
  event: EventRecord;
  locale: Locale;
  seatsTaken?: number;
  atCapacity?: boolean;
  isPast?: boolean;
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
}) {
  const variant = variantFrom(event.templateId);
  const ui = COPY[locale];
  const voice = ui[variant];
  const { headline, tagline, about } = resolveLocalizedInviteCopy(event, locale);
  const schedule = resolveLocalizedSchedule(event.schedule, locale);
  const faqs = resolveLocalizedFaqs(event.faqs, locale);
  const photo = safeInviteImageUrl(event.heroImage);
  const [now, setNow] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const countdown = useMemo(
    () => (now == null ? null : countdownTo(event.dateISO, event.timeLabel, now)),
    [event.dateISO, event.timeLabel, now],
  );
  const clockReady = eventInstant(event.dateISO, event.timeLabel) != null;

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(1, window.scrollY / height) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!trackViews) return;
    const trackedEmail = new URLSearchParams(window.location.search)
      .get("e")
      ?.trim()
      .toLowerCase();
    void fetch(`/api/events/${encodeURIComponent(event.slug)}/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trackedEmail || undefined }),
    }).catch(() => undefined);
  }, [event.slug, trackViews]);

  const mapQuery = [event.venue, event.address].filter(Boolean).join(", ");
  const mapHref = mapQuery
    ? safeHttpsUrl(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
      )
    : undefined;
  const registryHref = safeHttpsUrl(event.registryUrl);
  const couple = variant === "wedding" ? coupleParts(headline) : null;
  const age = (event.balloonDigits ?? "").replace(/\D/g, "").slice(0, 2);
  const dress = localizeStock(event.dressCode, locale);
  const bring = localizeStock(event.whatToBring, locale);
  const gifts = localizeStock(event.gifts, locale);
  const seatsOpen =
    event.capacity != null
      ? Math.max(0, event.capacity - seatsTaken)
      : null;
  const onAccent = variant === "wedding" ? "#1A1410" : "#FFFCFA";
  const style = {
    "--lv-bg": event.theme.colors.background,
    "--lv-surface": event.theme.colors.surface,
    "--lv-accent": event.theme.colors.accentPrimary,
    "--lv-accent-2": event.theme.colors.accentSecondary,
    "--lv-ink": event.theme.colors.textPrimary,
    "--lv-muted": event.theme.colors.textMuted,
    "--lv-on-accent": onAccent,
    "--lv-display": fontStack(event.theme.fonts.display, "Georgia, serif"),
    "--lv-body": fontStack(event.theme.fonts.body, "system-ui, sans-serif"),
  } as CSSProperties;

  const details: { title: string; body: string }[] = [];
  if (dress) details.push({ title: ui.dress, body: dress });
  if (bring) details.push({ title: ui.bring, body: bring });
  if (event.hotelInfo?.trim()) {
    details.push({ title: ui.stay, body: event.hotelInfo.trim() });
  }
  if (event.parking?.trim()) {
    details.push({ title: ui.park, body: event.parking.trim() });
  }

  return (
    <article className="lv" data-variant={variant} style={style}>
      <div
        className="lv-progress"
        style={{ width: `${progress * 100}%` }}
        aria-hidden
      />
      <header className="lv-hero">
        {variant === "baby" ? (
          <div className="lv-arch">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" />
            ) : null}
          </div>
        ) : (
          <>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="lv-hero-photo" src={photo} alt="" />
            ) : null}
            <div className="lv-hero-shade" aria-hidden />
            {variant === "party" ? (
              <div className="lv-confetti" aria-hidden>
                {Array.from({ length: 12 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
            ) : null}
          </>
        )}
        <div className="lv-hero-copy">
          <p>
            <span className="lv-kicker">{voice.kicker}</span>
            <span className="lv-live">
              <span className="lv-dot" aria-hidden />
              {ui.live}
            </span>
          </p>
          {variant === "party" && age ? <p className="lv-age">{age}</p> : null}
          <h1>
            {couple ? (
              <>
                {couple[0]}
                <span className="lv-and">{voice.and}</span>
                {couple[1]}
              </>
            ) : (
              headline
            )}
          </h1>
          {tagline ? (
            <div
              className="lv-tagline"
              dangerouslySetInnerHTML={{ __html: sanitizeAboutHtml(tagline) }}
            />
          ) : null}
          <p className="lv-when">
            {[formatWhen(event.dateISO, locale), event.timeLabel, event.venue]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {event.hostName ? (
            <p className="lv-host">{ui.hosted.replace("{name}", event.hostName)}</p>
          ) : null}
          {event.rsvpEnabled !== false ? (
            <a className="lv-cta" href="#rsvp">
              {ui.rsvp}
            </a>
          ) : null}
        </div>
      </header>

      {clockReady ? (
        <section aria-label={ui.until}>
          <div className="lv-count">
            {(
              [
                [countdown?.days, ui.days],
                [countdown?.hours, ui.hours],
                [countdown?.minutes, ui.minutes],
                [countdown?.seconds, ui.seconds],
              ] as const
            ).map(([value, label]) => (
              <div key={label}>
                <strong>{value == null ? "—" : String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="lv-status">
            {countdown == null
              ? ui.until
              : countdown.status === "past" || isPast
                ? ui.past
                : countdown.status === "today"
                  ? ui.today
                  : ui.until}
          </p>
          {seatsOpen != null ? (
            <p className="lv-spots">{ui.seats.replace("{open}", String(seatsOpen))}</p>
          ) : null}
        </section>
      ) : null}

      {about ? (
        <section className="lv-section">
          <h2>{voice.story}</h2>
          <div
            className="lv-prose"
            dangerouslySetInnerHTML={{ __html: sanitizeAboutHtml(about) }}
          />
        </section>
      ) : null}

      {schedule.length ? (
        <section className="lv-section">
          <h2>{ui.schedule}</h2>
          <ol className="lv-timeline">
            {schedule.map((item, index) => (
              <li key={item.id}>
                <time>{item.time || "—"}</time>
                <div>
                  <h3>
                    {item.title}
                    {index === 0 && countdown?.status !== "past" ? (
                      <span className="lv-next">{ui.upNext}</span>
                    ) : null}
                  </h3>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {event.venue || event.address ? (
        <section className="lv-section">
          <h2>{ui.place}</h2>
          <p className="lv-note">
            {[event.venue, event.address].filter(Boolean).join(" · ")}
          </p>
          {mapHref ? (
            <a className="lv-text-link" href={mapHref} target="_blank" rel="noreferrer">
              {ui.map}
            </a>
          ) : null}
        </section>
      ) : null}

      {details.length ? (
        <section className="lv-section lv-details">
          {details.map((item) => (
            <article key={item.title} className="lv-detail">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </section>
      ) : null}

      {gifts || registryHref ? (
        <section className="lv-section">
          <h2>{ui.gifts}</h2>
          {gifts ? <p className="lv-note">{gifts}</p> : null}
          {registryHref ? (
            <a className="lv-text-link" href={registryHref} target="_blank" rel="noreferrer">
              {event.registryLabel?.trim() || ui.gifts}
            </a>
          ) : null}
        </section>
      ) : null}

      {faqs.length ? (
        <section className="lv-section">
          <h2>{ui.questions}</h2>
          {faqs.map((item) => (
            <details key={item.id} className="lv-faq" open>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      ) : null}

      <section className="lv-section lv-rsvp" id="rsvp">
        <h2>{ui.rsvp}</h2>
        <QuinceRsvp
          event={event}
          locale={locale}
          seatsTaken={seatsTaken}
          atCapacity={atCapacity}
          isPast={isPast}
          onRsvpSubmit={onRsvpSubmit}
        />
      </section>

      <div className="lv-dock">
        <p>
          {formatWhen(event.dateISO, locale)}
          <span>{[event.timeLabel, event.venue].filter(Boolean).join(" · ")}</span>
        </p>
        {event.rsvpEnabled !== false ? <a href="#rsvp">{ui.rsvp}</a> : null}
      </div>
    </article>
  );
}
