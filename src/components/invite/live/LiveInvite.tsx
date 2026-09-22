"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import QuinceRsvp from "@/components/invite/quinceweb/QuinceRsvp";
import type { Locale } from "@/lib/i18n/config";
import {
  resolveLocalizedFaqs,
  resolveLocalizedPadrinos,
  resolveLocalizedSchedule,
} from "@/lib/i18n/event-content";
import {
  countdownTo,
  eventInstant,
  localizeStock,
  type LiveVariant,
} from "@/lib/live-invites";
import {
  filledPartyRoles,
  mapsSearchUrl,
  venueBlockHasContent,
  whatsappHref,
} from "@/lib/quince-fields";
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
    quince: { kicker: "Mis XV años", and: "and", story: "The celebration" },
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
    padres: "Parents",
    padrinos: "Sponsors",
    corte: "Court of honor",
    misa: "Mass",
    reception: "Reception",
    print: "The card",
    whatsapp: "WhatsApp",
  },
  es: {
    wedding: { kicker: "La boda de", and: "y", story: "Nuestra historia" },
    party: { kicker: "Una fiesta de cumpleaños", and: "y", story: "La fiesta" },
    baby: { kicker: "Un baby shower", and: "y", story: "Antes de que llegue" },
    quince: { kicker: "Mis XV años", and: "y", story: "La celebración" },
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
    padres: "Padres",
    padrinos: "Padrinos",
    corte: "Corte de honor",
    misa: "Misa",
    reception: "Recepción",
    print: "La tarjeta",
    whatsapp: "WhatsApp",
  },
} as const;

const QUINCE_GOWN = "/templates/quince-tiara/gown-back-pink.webp";
const QUINCE_TIARA = "/templates/quince-tiara/tiara-pink-glitter.webp";
const QUINCE_FLORAL_TL = "/templates/quince-tiara/floral-corner-tl.webp";
const QUINCE_FLORAL_BR = "/templates/quince-tiara/floral-corner-br.webp";
const QUINCE_PETALS = "/templates/quince-princesa/petals-drift.png";
const QUINCE_SEAL = "/templates/quince-princesa/seal-monogram-kxz.svg";

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
  if (layout === "quinceweb" || layout === "quinceframe") return "quince";
  return "wedding";
}

function quinceLook(templateId: string): "princesa" | "tiara" {
  return resolveInviteLayout(templateId) === "quinceweb" ? "princesa" : "tiara";
}

/** Uploaded portraits only. Stock petals and placeholder art stay off the photo slot. */
function quincePortrait(event: EventRecord): string | undefined {
  const portrait = safeInviteImageUrl(event.honoreePhotoUrl);
  if (portrait) return portrait;
  const hero = safeInviteImageUrl(event.heroImage);
  if (!hero) return undefined;
  if (/quince-(princesa|tiara)-hero/i.test(hero)) return undefined;
  if (/petals?-/i.test(hero)) return undefined;
  return hero;
}

function isDaughterLine(tagline: string) {
  const text = tagline.replace(/<[^>]+>/g, "").trim().toLowerCase();
  return text === "of their daughter" || text === "de su hija";
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
  const look = variant === "quince" ? quinceLook(event.templateId) : null;
  const ui = COPY[locale];
  const voice = ui[variant];
  const { headline, tagline, about } = resolveLocalizedInviteCopy(event, locale);
  const schedule = resolveLocalizedSchedule(event.schedule, locale);
  const faqs = resolveLocalizedFaqs(event.faqs, locale);
  const photo =
    variant === "quince" ? quincePortrait(event) : safeInviteImageUrl(event.heroImage);
  const daughterLine = variant === "quince" && isDaughterLine(tagline);
  const parents =
    variant === "quince" ? (event.parentsLine || event.hostName || "").trim() : "";
  const padrinos =
    variant === "quince"
      ? filledPartyRoles(resolveLocalizedPadrinos(event.padrinos, locale))
      : [];
  const corte =
    variant === "quince"
      ? filledPartyRoles(resolveLocalizedPadrinos(event.corte, locale))
      : [];
  const photos = (event.gallery ?? [])
    .map((src) => safeInviteImageUrl(src))
    .filter((src): src is string => Boolean(src));
  const whatsapp =
    variant === "quince"
      ? whatsappHref(event.whatsappPhone || event.contactPhone || "")
      : null;
  const quincePlaces =
    variant === "quince"
      ? (
          [
            { key: "misa", label: ui.misa, block: event.misa },
            { key: "reception", label: ui.reception, block: event.recepcion },
          ] as const
        )
          .filter((row) => venueBlockHasContent(row.block))
          .map((row) => {
            const line = [row.block?.place, row.block?.address]
              .filter(Boolean)
              .join(", ");
            return {
              key: row.key,
              label: row.label,
              time: row.block?.time || "",
              line,
              href: line ? safeHttpsUrl(mapsSearchUrl(line)) : undefined,
            };
          })
      : [];
  const printHref =
    variant !== "quince"
      ? null
      : event.slug.startsWith("quince-princesa")
        ? "/preview/quince-princesa/print"
        : event.slug.startsWith("quince-tiara")
          ? "/preview/quince-tiara/print"
          : `/e/${event.slug}/print/postcard`;
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
  const onAccent =
    variant === "wedding"
      ? "#1A1410"
      : variant === "quince" && look === "tiara"
        ? "#3A2A30"
        : "#FFFCFA";
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
    <article
      className="lv"
      data-variant={variant}
      data-look={look ?? undefined}
      style={style}
    >
      <div
        className="lv-progress"
        style={{ width: `${progress * 100}%` }}
        aria-hidden
      />
      <header className="lv-hero">
        {variant === "quince" ? (
          <>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="lv-hero-photo" src={photo} alt="" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="lv-gown" src={QUINCE_GOWN} alt="" />
            )}
            {look === "princesa" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="lv-petals" src={QUINCE_PETALS} alt="" />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="lv-floral lv-floral-tl" src={QUINCE_FLORAL_TL} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="lv-floral lv-floral-br" src={QUINCE_FLORAL_BR} alt="" />
              </>
            )}
            <div className="lv-hero-shade" aria-hidden />
          </>
        ) : variant === "baby" ? (
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
          {look === "princesa" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="lv-seal" src={QUINCE_SEAL} alt="" />
          ) : look === "tiara" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="lv-tiara-mark" src={QUINCE_TIARA} alt="" />
          ) : null}
          <p>
            <span className="lv-kicker">{voice.kicker}</span>
            <span className="lv-live">
              <span className="lv-dot" aria-hidden />
              {ui.live}
            </span>
          </p>
          {variant === "party" && age ? <p className="lv-age">{age}</p> : null}
          {daughterLine ? <p className="lv-relation">{tagline}</p> : null}
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
          {tagline && !daughterLine ? (
            <div
              className="lv-tagline"
              dangerouslySetInnerHTML={{ __html: sanitizeAboutHtml(tagline) }}
            />
          ) : null}
          <p className="lv-when">
            {[
              formatWhen(event.dateISO, locale),
              event.timeLabel,
              variant === "quince" ? event.misa?.place || event.venue : event.venue,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {event.hostName && variant !== "quince" ? (
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

      {parents ? (
        <section className="lv-section">
          <h2>{ui.padres}</h2>
          <p className="lv-note">{parents}</p>
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

      {quincePlaces.length ? (
        <section className="lv-section">
          <h2>{ui.place}</h2>
          {quincePlaces.map((place) => (
            <article key={place.key} className="lv-place">
              <h3>
                {place.label}
                {place.time ? <span>{place.time}</span> : null}
              </h3>
              {place.line ? <p className="lv-note">{place.line}</p> : null}
              {place.href ? (
                <a className="lv-text-link" href={place.href} target="_blank" rel="noreferrer">
                  {ui.map}
                </a>
              ) : null}
            </article>
          ))}
        </section>
      ) : event.venue || event.address ? (
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

      {padrinos.length || corte.length ? (
        <section className="lv-section lv-court">
          {padrinos.length ? (
            <div>
              <h2>{ui.padrinos}</h2>
              <ul className="lv-roles">
                {padrinos.map((row) => (
                  <li key={row.id || row.name}>
                    {row.role ? <span>{row.role}</span> : null}
                    <strong>{row.name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {corte.length ? (
            <div>
              <h2>{ui.corte}</h2>
              <ul className="lv-roles">
                {corte.map((row) => (
                  <li key={row.id || row.name}>
                    {row.role ? <span>{row.role}</span> : null}
                    <strong>{row.name}</strong>
                  </li>
                ))}
              </ul>
            </div>
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

      {whatsapp ? (
        <section className="lv-section">
          <h2>{ui.whatsapp}</h2>
          <a className="lv-text-link" href={whatsapp} target="_blank" rel="noreferrer">
            {ui.whatsapp}
          </a>
        </section>
      ) : null}

      {variant === "quince" && photos.length ? (
        <section className="lv-section">
          <div className="lv-gallery">
            {photos.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" />
            ))}
          </div>
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
        {printHref ? (
          <a className="lv-text-link" href={printHref}>
            {ui.print}
          </a>
        ) : null}
      </section>

      <div className="lv-dock">
        <p>
          {formatWhen(event.dateISO, locale)}
          <span>
            {[event.timeLabel, event.misa?.place || event.venue]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </p>
        {event.rsvpEnabled !== false ? <a href="#rsvp">{ui.rsvp}</a> : null}
      </div>
    </article>
  );
}
