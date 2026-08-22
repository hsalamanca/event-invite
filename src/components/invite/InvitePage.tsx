"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import InviteCover from "@/components/invite/InviteCover";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  downloadInviteCardPng,
  inviteDownloadFileBase,
} from "@/lib/download-invite-jpeg";
import { sanitizeAboutHtml } from "@/lib/sanitize-about";
import {
  resolveLocalizedAbout,
  resolveLocalizedFaqs,
  resolveLocalizedParking,
  resolveLocalizedSchedule,
} from "@/lib/i18n/event-content";
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
  /** Printable download: same web invite cover only */
  printCoverOnly?: boolean;
  inviteUrl?: string;
  qrUrl?: string;
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

const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

/** Display dates as 05SEP2026. */
function formatDateDdmmyyyy(dateISO: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO.trim());
  if (m) {
    const month = MONTH_ABBR[Number(m[2]) - 1];
    if (month) return `${m[3]}${month}${m[1]}`;
  }
  const d = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateISO;
  const dd = String(d.getDate()).padStart(2, "0");
  const mon = MONTH_ABBR[d.getMonth()] ?? "";
  return `${dd}${mon}${d.getFullYear()}`;
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

function formatWeekdayLabel(dateISO: string, locale: Locale): string {
  const d = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
  });
}

function formatDateShortLabel(dateISO: string, locale: Locale): string {
  const d = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateISO;
  if (locale === "es") {
    const day = d.getDate();
    const month = d
      .toLocaleDateString("es-ES", { month: "long" })
      .toUpperCase();
    return `${day} DE ${month}`;
  }
  return d
    .toLocaleDateString("en-US", { month: "long", day: "numeric" })
    .toUpperCase();
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
  Anton: "var(--font-anton), Impact, system-ui, sans-serif",
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
  printCoverOnly = false,
  inviteUrl,
  qrUrl,
  onRsvpSubmit,
}: InvitePageProps) {
  const { theme } = event;
  const ui = getDictionary(locale).invite;
  const rsvpFields = resolveLocalizedRsvpFields(event.rsvpFields, locale);
  const attendanceOptions = rsvpFields.attendance.options;
  const defaultAttendance = attendanceOptions[0] ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
  const [albumPhotos, setAlbumPhotos] = useState<
    { id: string; name: string; caption: string; url: string }[]
  >([]);
  const [albumName, setAlbumName] = useState("");
  const [albumCaption, setAlbumCaption] = useState("");
  const [albumBusy, setAlbumBusy] = useState(false);
  const [albumDone, setAlbumDone] = useState(false);
  const [albumError, setAlbumError] = useState<string | null>(null);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistGuests, setWaitlistGuests] = useState(1);
  const [waitlistNote, setWaitlistNote] = useState("");
  const [waitlistBusy, setWaitlistBusy] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [pngBusy, setPngBusy] = useState(false);
  const [pngError, setPngError] = useState<string | null>(null);
  const [rsvpConsent, setRsvpConsent] = useState(false);
  const [pledgeName, setPledgeName] = useState("");
  const [pledgeEmail, setPledgeEmail] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [pledgeNote, setPledgeNote] = useState("");
  const [pledgeBusy, setPledgeBusy] = useState(false);
  const [pledgeDone, setPledgeDone] = useState(false);
  const [pledgeError, setPledgeError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const e = new URLSearchParams(window.location.search).get("e")?.trim();
    if (e) {
      setEmail(e);
      setWaitlistEmail(e);
    }
  }, []);

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
    if (!event.albumEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/album?slug=${encodeURIComponent(event.slug)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          photos?: { id: string; name: string; caption: string; url: string }[];
        };
        if (!cancelled && data.photos) setAlbumPhotos(data.photos);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [event.slug, event.albumEnabled]);

  async function trackGiftClick(kind: "registry" | "cash") {
    void fetch(`/api/events/${encodeURIComponent(event.slug)}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    }).catch(() => undefined);
  }

  async function submitAlbumPhoto(file: File) {
    setAlbumBusy(true);
    setAlbumError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", event.slug);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      const upData = (await up.json()) as { error?: string; url?: string };
      if (!up.ok || !upData.url) {
        throw new Error(upData.error || "Upload failed");
      }
      const res = await fetch("/api/album", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: event.slug,
          name: albumName.trim() || name.trim() || "Guest",
          caption: albumCaption.trim(),
          url: upData.url,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not save photo");
      setAlbumDone(true);
      setAlbumCaption("");
    } catch (err) {
      setAlbumError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAlbumBusy(false);
    }
  }

  useEffect(() => {
    if (!trackViews) return;
    const trackedEmail =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("e")?.trim().toLowerCase()
        : null;
    void fetch(`/api/events/${encodeURIComponent(event.slug)}/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trackedEmail || undefined }),
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

  async function submitWaitlist(e: FormEvent) {
    e.preventDefault();
    setWaitlistBusy(true);
    setWaitlistError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: event.slug,
          name: waitlistName.trim(),
          email: waitlistEmail.trim(),
          guestCount: waitlistGuests,
          note: waitlistNote.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? ui.waitlistError);
      }
      setWaitlistDone(true);
    } catch (err) {
      setWaitlistError(
        err instanceof Error ? err.message : ui.waitlistError,
      );
    } finally {
      setWaitlistBusy(false);
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
    if (printCoverOnly) return;
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
  }, [printCoverOnly]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (event.rsvpConsentRequired && !rsvpConsent) {
      setError(
        "Please agree to receive event updates before submitting your RSVP.",
      );
      return;
    }
    setSubmitting(true);

    const payload = {
      eventId: event.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      attendance,
      guestCount: rsvpFields.plusOnes.enabled
        ? Math.max(1, Number(guestCount) || 1)
        : 1,
      dietary: rsvpFields.dietary.enabled ? dietary.trim() : "",
      note: note.trim(),
      answers,
      mealChoice: mealChoice || undefined,
      consent: event.rsvpConsentRequired ? true : undefined,
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
  const rsvpEnabled = event.rsvpEnabled !== false;
  const { headline, tagline, about: aboutFallback } = resolveLocalizedInviteCopy(
    event,
    locale,
  );
  const about = resolveLocalizedAbout(event.about, event.aboutEs, locale);
  const schedule = resolveLocalizedSchedule(event.schedule, locale);
  const faqs = resolveLocalizedFaqs(event.faqs, locale);
  const parking = resolveLocalizedParking(
    event.parking,
    event.parkingEs,
    locale,
  );
  // Prefer bilingual aboutEs / maps; fall back to stock about resolver
  const aboutHtml = about.trim() ? about : aboutFallback;
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
    <div
      className={`invite-root${printCoverOnly ? " invite-root--print" : ""}`}
      data-layout={layout}
      data-page={
        layout === "arcade" || layout === "azure" || layout === "quince"
          ? "ink"
          : undefined
      }
      style={cssVars}
    >
      {printCoverOnly ? (
        <div className="invite-print-toolbar print:hidden">
          <button
            type="button"
            className="btn-primary"
            disabled={pngBusy}
            onClick={() => {
              void (async () => {
                setPngError(null);
                setPngBusy(true);
                try {
                  const target =
                    document.getElementById("invite-print-target") ??
                    document.querySelector<HTMLElement>(".invite-card");
                  if (!target) {
                    throw new Error("Invite card not ready yet");
                  }
                  await downloadInviteCardPng(
                    target,
                    inviteDownloadFileBase(event.slug, event.title),
                  );
                } catch (err) {
                  const message =
                    err instanceof Error && err.message
                      ? err.message
                      : typeof err === "string" && err.trim()
                        ? err
                        : "Could not create PNG";
                  setPngError(message);
                } finally {
                  setPngBusy(false);
                }
              })();
            }}
          >
            {pngBusy ? "Preparing…" : `${ui.downloadPostcard} · PNG`}
          </button>
          {qrUrl ? (
            <a
              className="btn-ghost"
              href={qrUrl}
              download={`${inviteDownloadFileBase(event.slug, event.title)}-qr.png`}
            >
              QR PNG
            </a>
          ) : null}
          <a className="btn-ghost" href={`/e/${event.slug}`}>
            {ui.details}
          </a>
          <p className="invite-print-tip">
            Downloads a sharp PNG named after your subdomain — easy to text.
          </p>
          {pngError ? (
            <p className="invite-print-tip" style={{ color: "#b42318" }}>
              {pngError}
            </p>
          ) : null}
        </div>
      ) : null}

      <InviteCover
        layout={layout}
        templateId={event.templateId}
        hostName={event.hostName}
        title={event.title}
        headline={headline}
        tagline={tagline}
        dateLabel={formatDateLabel(event.dateISO, locale)}
        weekdayLabel={formatWeekdayLabel(event.dateISO, locale)}
        dateShortLabel={formatDateShortLabel(event.dateISO, locale)}
        timeLabel={event.timeLabel}
        venue={event.venue}
        address={event.address}
        heroImage={event.heroImage}
        heroVideoUrl={event.heroVideoUrl}
        motionKit={event.motionKit}
        invitesYou={ui.invitesYou}
        comicPresents={ui.comicPresents}
        superYouAreInvited={ui.superYouAreInvited}
        superIsTurning={ui.superIsTurning}
        superJoinUs={ui.superJoinUs}
        superBirthday={ui.superBirthday}
        spiderLetsCelebrate={ui.spiderLetsCelebrate}
        festiveParty={ui.festiveParty}
        toyPartyInvite={ui.toyPartyInvite}
        splashInvite={ui.splashInvite}
        collageInvite={ui.collageInvite}
        balloonDigits={event.balloonDigits}
        contactPhone={event.contactPhone}
        modernCelebrate={ui.modernCelebrate}
        arcadePlayer={ui.arcadePlayer}
        quinceInvite={ui.quinceInvite}
        fiftyCelebrate={ui.fiftyCelebrate}
        rsvpLabel={ui.rsvp}
        detailsLabel={ui.details}
        leaveNoteLabel={ui.leaveNote}
        rsvpEnabled={rsvpEnabled}
        calendarLabel={ui.addToCalendar}
        calendarHref={`/api/events/${event.slug}/ics`}
        copyLabel={copied ? ui.copied : ui.copyLink}
        postcardLabel={printCoverOnly ? undefined : ui.downloadPostcard}
        postcardHref={
          printCoverOnly ? undefined : `/e/${event.slug}/print/postcard`
        }
        printMode={printCoverOnly}
        inviteUrl={inviteUrl}
        qrUrl={qrUrl}
        isPast={isPast}
        onCopyLink={() => void copyInviteLink()}
        parallaxY={printCoverOnly ? 0 : parallaxY}
      />

      {!printCoverOnly ? (
        <>
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
              __html: sanitizeAboutHtml(aboutHtml),
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

      {event.registryUrl || event.cashFundUrl || event.cashFundGoal ? (
        <section id="registry" className="invite-section">
          <h2 className="invite-section-title">
            {event.registryLabel ||
              event.cashFundLabel ||
              ui.registry}
          </h2>
          <p className="invite-prompt">{ui.registryPrompt}</p>
          {event.cashFundGoal ? (
            <div style={{ marginBottom: "1rem", maxWidth: "28rem" }}>
              <p className="invite-prompt" style={{ marginBottom: "0.35rem" }}>
                Cash fund · $
                {Math.round(
                  (event.cashFundRaised ?? 0),
                ).toLocaleString()}{" "}
                of ${Math.round(event.cashFundGoal).toLocaleString()}
              </p>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: "color-mix(in srgb, var(--invite-muted) 25%, transparent)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(
                      100,
                      ((event.cashFundRaised ?? 0) / event.cashFundGoal) * 100,
                    )}%`,
                    background: "var(--invite-accent)",
                  }}
                />
              </div>
            </div>
          ) : null}
          <p className="invite-registry" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {event.registryUrl ? (
              <a
                href={event.registryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                onClick={() => void trackGiftClick("registry")}
              >
                {event.registryLabel || ui.registryCta}
              </a>
            ) : null}
            {event.cashFundUrl ? (
              <a
                href={event.cashFundUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                onClick={() => void trackGiftClick("cash")}
              >
                {event.cashFundLabel || "Cash fund"}
              </a>
            ) : null}
          </p>
          {event.cashFundUrl || event.cashFundGoal ? (
            <form
              className="rsvp-form"
              style={{ marginTop: "1.25rem" }}
              onSubmit={(e) => {
                e.preventDefault();
                void (async () => {
                  setPledgeBusy(true);
                  setPledgeError(null);
                  try {
                    const res = await fetch(
                      `/api/events/${encodeURIComponent(event.slug)}/gifts`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "pledge",
                          name: pledgeName || name,
                          email: pledgeEmail || email,
                          kind: "cash",
                          amount: Number(pledgeAmount) || undefined,
                          note: pledgeNote,
                        }),
                      },
                    );
                    const data = (await res.json()) as { error?: string };
                    if (!res.ok) throw new Error(data.error || "Could not save");
                    setPledgeDone(true);
                  } catch (err) {
                    setPledgeError(
                      err instanceof Error ? err.message : "Could not save",
                    );
                  } finally {
                    setPledgeBusy(false);
                  }
                })();
              }}
            >
              <p className="invite-prompt">Tell the hosts you contributed</p>
              {pledgeDone ? (
                <p className="rsvp-success-sub">Thank you — we noted your gift.</p>
              ) : (
                <>
                  <label className="rsvp-field">
                    <span>Name</span>
                    <input
                      required
                      value={pledgeName}
                      onChange={(e) => setPledgeName(e.target.value)}
                    />
                  </label>
                  <label className="rsvp-field">
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={pledgeEmail}
                      onChange={(e) => setPledgeEmail(e.target.value)}
                    />
                  </label>
                  <label className="rsvp-field">
                    <span>Amount (optional)</span>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(e.target.value)}
                    />
                  </label>
                  <label className="rsvp-field">
                    <span>Note</span>
                    <input
                      value={pledgeNote}
                      onChange={(e) => setPledgeNote(e.target.value)}
                    />
                  </label>
                  {pledgeError ? (
                    <p className="rsvp-error" role="alert">
                      {pledgeError}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    className="btn-ghost"
                    disabled={pledgeBusy}
                  >
                    {pledgeBusy ? "Saving…" : "Log my gift"}
                  </button>
                </>
              )}
            </form>
          ) : null}
        </section>
      ) : null}

      {success && event.printAffiliateEnabled !== false ? (
        <section className="invite-section invite-section--surface">
          <h2 className="invite-section-title">Match your stationery</h2>
          <p className="invite-prompt">
            Print save-the-dates or day-of cards that match this invite.
          </p>
          <p className="invite-registry" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <a
              className="btn-primary"
              href={`https://www.minted.com/search?phrase=${encodeURIComponent(event.title)}&utm_source=ownvite&utm_medium=affiliate`}
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              Browse Minted
            </a>
            <a
              className="btn-ghost"
              href={`/e/${event.slug}/print/postcard`}
              target="_blank"
              rel="noreferrer"
            >
              Download PNG postcard
            </a>
          </p>
        </section>
      ) : null}

      {event.guestSeatingEnabled ? (
        <section className="invite-section">
          <h2 className="invite-section-title">Find your table</h2>
          <p className="invite-prompt">
            Look up your seating assignment with the email you RSVP&apos;d with.
          </p>
          <a className="btn-primary" href={`/e/${event.slug}/table`}>
            Open seating lookup
          </a>
        </section>
      ) : null}

      {(schedule.length ||
        event.dressCode ||
        parking ||
        event.whatToBring ||
        event.hotelInfo ||
        event.travelInfo ||
        event.contactEmail ||
        event.contactPhone) && (
        <section id="info" className="invite-section">
          <h2 className="invite-section-title">{ui.guestInfo}</h2>
          {schedule.length > 0 ? (
            <div className="invite-extra-block">
              <h3 className="invite-section-title invite-section-title--sm">
                {ui.schedule}
              </h3>
              <ul className="invite-schedule">
                {schedule.map((item) => (
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
          {parking ? (
            <p className="invite-extra-line">
              <strong>{ui.parking}</strong> {parking}
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

      {faqs.length > 0 ? (
        <section id="faq" className="invite-section invite-section--surface">
          <h2 className="invite-section-title">{ui.faq}</h2>
          <dl className="invite-faq">
            {faqs.map((f) => (
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
          <div
            className={`invite-gallery invite-gallery--${event.galleryLayout ?? "square"}`}
          >
            {event.gallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                style={
                  (event.galleryLayout ?? "square") === "scatter"
                    ? {
                        transform: `rotate(${[-8, 5, -3, 7, -6, 4, -2, 6][i % 8]}deg)`,
                      }
                    : undefined
                }
              />
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

      {rsvpEnabled ? (
      <section
        id="rsvp"
        className="invite-section invite-section--surface invite-section--rsvp"
      >
        <div className="rsvp-panel">
          <div className="rsvp-ornament" aria-hidden="true" />
          <h2 className="invite-section-title rsvp-title">{ui.rsvp}</h2>
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
                    .replace("{date}", formatDateDdmmyyyy(rsvpFields.deadline))}
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
        ) : deadlinePassed ? (
          <p className="invite-prompt">{ui.rsvpClosed}</p>
        ) : atCapacity ? (
          <div className="rsvp-waitlist">
            <p className="invite-prompt">{ui.eventFull}</p>
            <p className="invite-prompt">{ui.waitlistPrompt}</p>
            {waitlistDone ? (
              <div className="rsvp-success" role="status">
                <span className="rsvp-check" aria-hidden>
                  ✓
                </span>
                <p className="rsvp-success-text">{ui.waitlistThanks}</p>
              </div>
            ) : (
              <form
                className="rsvp-form"
                onSubmit={submitWaitlist}
                noValidate
              >
                <label className="rsvp-field">
                  <span>{ui.name}</span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={waitlistName}
                    onChange={(e) => setWaitlistName(e.target.value)}
                  />
                </label>
                <label className="rsvp-field">
                  <span>{ui.email}</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                  />
                </label>
                <label className="rsvp-field">
                  <span>{ui.waitlistGuests}</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={waitlistGuests}
                    onChange={(e) =>
                      setWaitlistGuests(
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                  />
                </label>
                <label className="rsvp-field">
                  <span>{ui.note}</span>
                  <textarea
                    rows={2}
                    value={waitlistNote}
                    onChange={(e) => setWaitlistNote(e.target.value)}
                  />
                </label>
                {waitlistError ? (
                  <p className="rsvp-error" role="alert">
                    {waitlistError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={waitlistBusy}
                >
                  {waitlistBusy ? ui.submitting : ui.waitlistSubmit}
                </button>
              </form>
            )}
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

            <label className="rsvp-field">
              <span>Mobile (optional, for SMS reminders)</span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1…"
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

            {event.rsvpConsentRequired ? (
              <label className="rsvp-check" style={{ marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={rsvpConsent}
                  onChange={(e) => setRsvpConsent(e.target.checked)}
                  required
                />
                <span>
                  I agree to receive event updates by email/SMS and understand I
                  can reply STOP to opt out of texts.
                </span>
              </label>
            ) : null}

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
        </div>
      </section>
      ) : null}

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

      {event.albumEnabled ? (
        <section id="album" className="invite-section invite-section--surface">
          <h2 className="invite-section-title">Photo album</h2>
          <p className="invite-prompt">
            Share a moment from the celebration. Photos appear after the host
            approves them.
          </p>
          {albumDone ? (
            <p className="rsvp-success-sub">
              Thanks — your photo is waiting for approval.
            </p>
          ) : (
            <form
              className="rsvp-form"
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem(
                  "albumFile",
                ) as HTMLInputElement | null);
                const file = input?.files?.[0];
                if (!file) {
                  setAlbumError("Choose a photo first");
                  return;
                }
                void submitAlbumPhoto(file);
              }}
            >
              <label className="rsvp-field">
                <span>Your name</span>
                <input
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder={name || "Guest"}
                />
              </label>
              <label className="rsvp-field">
                <span>Caption (optional)</span>
                <input
                  value={albumCaption}
                  onChange={(e) => setAlbumCaption(e.target.value)}
                  maxLength={280}
                />
              </label>
              <label className="rsvp-field">
                <span>Photo</span>
                <input
                  name="albumFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  required
                />
              </label>
              {albumError ? (
                <p className="rsvp-error" role="alert">
                  {albumError}
                </p>
              ) : null}
              <button
                type="submit"
                className="btn-primary btn-submit"
                disabled={albumBusy}
              >
                {albumBusy ? "Uploading…" : "Submit photo"}
              </button>
            </form>
          )}
          {albumPhotos.length > 0 ? (
            <ul
              className="guestbook-list"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "0.75rem",
                listStyle: "none",
                padding: 0,
                marginTop: "1.5rem",
              }}
            >
              {albumPhotos.slice(0, 24).map((p) => (
                <li key={p.id} style={{ margin: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.caption || `Photo by ${p.name}`}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                  <strong style={{ display: "block", marginTop: "0.35rem" }}>
                    {p.name}
                  </strong>
                  {p.caption ? <p>{p.caption}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <footer className="invite-footer">
        <p>{ui.hostedBy.replace("{name}", event.hostName)}</p>
        {event.showOwnviteFooter !== false ? (
          <p className="invite-footer-attr">Ownvite</p>
        ) : null}
      </footer>
        </>
      ) : null}

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

        :global(.invite-card-tagline h1),
        :global(.invite-card-tagline h2),
        :global(.invite-card-tagline h3),
        :global(.invite-card-tagline h4),
        :global(.invite-card-tagline h5),
        :global(.invite-card-tagline h6) {
          margin: 0.55rem 0 0.2rem;
          font-family: var(--font-display);
          font-weight: 600;
          color: var(--invite-text);
          line-height: 1.25;
        }

        :global(.invite-card-tagline h1) { font-size: 1.35rem; }
        :global(.invite-card-tagline h2) { font-size: 1.2rem; }
        :global(.invite-card-tagline h3) { font-size: 1.1rem; }
        :global(.invite-card-tagline h4),
        :global(.invite-card-tagline h5),
        :global(.invite-card-tagline h6) { font-size: 1.05rem; }

        :global(.invite-card-tagline p) {
          margin: 0.35rem 0 0;
        }

        :global(.invite-card-tagline b),
        :global(.invite-card-tagline strong) {
          font-weight: 700;
          color: var(--invite-text);
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

        /* —— Super party (duo comic / age shield) —— */
        :global(.invite-cover[data-layout="superhero"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(circle at 50% 30%, rgba(255, 243, 176, 0.55), transparent 55%),
            linear-gradient(180deg, rgba(11, 18, 32, 0.35), rgba(255, 243, 176, 0.92) 70%);
        }

        :global(.invite-cover[data-layout="superhero"] .invite-card) {
          position: relative;
          overflow: hidden;
          border: 4px solid #111;
          border-radius: 1.15rem;
          background: #fff3b0;
          box-shadow: 8px 8px 0 #111;
          padding: 0;
        }

        :global(.invite-cover[data-layout="superhero"] .super-banner) {
          background: #0b1220;
          padding: 0.85rem 1rem;
          text-align: center;
        }

        :global(.invite-cover[data-layout="superhero"] .super-banner-title) {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 6vw, 2.4rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffe566;
          line-height: 1;
        }

        :global(.invite-cover[data-layout="superhero"] .super-invited) {
          margin: 0;
          background: #fff;
          border-bottom: 3px solid #111;
          padding: 0.45rem 1rem;
          text-align: center;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.78rem;
          color: #111;
        }

        :global(.invite-cover[data-layout="superhero"] .super-hero-stage) {
          position: relative;
          min-height: 280px;
        }

        :global(.invite-cover[data-layout="superhero"] .super-hero-art) {
          display: block;
          width: 100%;
          height: 320px;
          object-fit: cover;
          object-position: center 30%;
        }

        :global(.invite-cover[data-layout="superhero"] .super-center-copy) {
          position: absolute;
          inset: 8% 12% auto;
          text-align: center;
          z-index: 2;
        }

        :global(.invite-cover[data-layout="superhero"] .super-name) {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 10vw, 3.6rem);
          color: #e30613;
          text-shadow: 3px 3px 0 #111;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          line-height: 0.95;
        }

        :global(.invite-cover[data-layout="superhero"] .super-turning) {
          margin: 0.15rem 0 0.55rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-size: 0.78rem;
          color: #111;
        }

        :global(.invite-cover[data-layout="superhero"] .super-shield) {
          width: 88px;
          height: 100px;
          margin: 0 auto;
          display: grid;
          place-items: center;
          background: #ffe566;
          border: 5px solid #e30613;
          clip-path: polygon(50% 0%, 100% 22%, 100% 70%, 50% 100%, 0% 70%, 0% 22%);
          box-shadow: 0 0 0 3px #111;
        }

        :global(.invite-cover[data-layout="superhero"] .super-shield-age) {
          font-family: var(--font-display);
          font-size: 2.6rem;
          color: #e30613;
          text-shadow: 2px 2px 0 #111;
          line-height: 1;
        }

        :global(.invite-cover[data-layout="superhero"] .super-pow) {
          position: relative;
          margin: -2.4rem 0.75rem 0.85rem;
          background: #111;
          color: #fff;
          clip-path: polygon(
            4% 12%,
            18% 0%,
            38% 8%,
            55% 0%,
            78% 10%,
            96% 2%,
            100% 28%,
            94% 55%,
            100% 78%,
            82% 100%,
            55% 92%,
            32% 100%,
            10% 90%,
            0% 68%,
            6% 40%
          );
          padding: 1.6rem 1.4rem 2rem;
          z-index: 3;
        }

        :global(.invite-cover[data-layout="superhero"] .super-pow-inner) {
          text-align: center;
        }

        :global(.invite-cover[data-layout="superhero"] .super-pow-line) {
          margin: 0.2rem 0;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        :global(.invite-cover[data-layout="superhero"] .super-bam) {
          position: absolute;
          left: 50%;
          bottom: -0.35rem;
          transform: translateX(-50%);
          background: #e30613;
          color: #ffe566;
          border: 3px solid #111;
          padding: 0.2rem 0.55rem;
          font-family: var(--font-display);
          font-size: 1.1rem;
          letter-spacing: 0.06em;
          box-shadow: 3px 3px 0 #111;
        }

        :global(.invite-cover[data-layout="superhero"] .super-actions),
        :global(.invite-cover[data-layout="superburst"] .super-actions) {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          justify-content: center;
          padding: 0 1rem 1.15rem;
        }

        :global(.invite-cover[data-layout="superhero"] .btn-primary),
        :global(.invite-cover[data-layout="superburst"] .btn-primary) {
          border: 3px solid #111;
          border-radius: 0.55rem;
          box-shadow: 3px 3px 0 #111;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
        }

        :global(.invite-cover[data-layout="superhero"] .btn-ghost),
        :global(.invite-cover[data-layout="superburst"] .btn-ghost) {
          border: 3px solid #111;
          border-radius: 0.55rem;
          background: #fff;
          box-shadow: 3px 3px 0 var(--invite-accent-2);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 800;
        }

        /* —— Birthday super (hex photo / comic burst) —— */
        :global(.invite-cover[data-layout="superburst"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(circle at 50% 40%, rgba(255, 212, 0, 0.25), transparent 50%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.2), #fff 80%);
        }

        :global(.invite-cover[data-layout="superburst"] .invite-card) {
          position: relative;
          overflow: hidden;
          border: 4px solid #111;
          border-radius: 1.2rem;
          background: #fff;
          box-shadow: 8px 8px 0 #111;
          padding: 0;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-rays) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.22;
          background: repeating-conic-gradient(
            from 0deg at 50% 42%,
            #cfcfcf 0deg 6deg,
            transparent 6deg 12deg
          );
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-card) {
          position: relative;
          z-index: 1;
          padding: 1.1rem 0.85rem 0;
          text-align: center;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-join) {
          display: inline-block;
          margin: 0 auto;
          background: #ffd400;
          border: 2px solid #111;
          padding: 0.28rem 0.7rem;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-name) {
          margin: 0.55rem 0 0.35rem;
          font-family: var(--font-display);
          font-size: clamp(2.6rem, 11vw, 4rem);
          color: #e10600;
          letter-spacing: 0.02em;
          line-height: 0.92;
          text-shadow:
            -2px -2px 0 #fff,
            2px -2px 0 #fff,
            -2px 2px 0 #fff,
            2px 2px 0 #fff,
            3px 3px 0 #111;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-photo-wrap) {
          position: relative;
          width: min(100%, 280px);
          margin: 0.4rem auto 0;
          min-height: 230px;
          padding-bottom: 2.35rem;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-balloons) {
          position: absolute;
          inset: -8% -18% auto;
          width: 136%;
          left: -18%;
          pointer-events: none;
          z-index: 1;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-shield) {
          position: absolute;
          left: 50%;
          top: 18%;
          width: 78%;
          aspect-ratio: 1;
          transform: translateX(-50%) rotate(8deg);
          background: #e10600;
          clip-path: polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%);
          z-index: 0;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-hex) {
          position: relative;
          z-index: 2;
          width: 72%;
          margin: 1.4rem auto 0;
          aspect-ratio: 1;
          overflow: hidden;
          background: #ffd400;
          border: 4px solid #111;
          clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
          box-shadow: 0 0 0 3px #ffd400;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-hex img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-ribbon) {
          position: absolute;
          left: 50%;
          bottom: 0.15rem;
          z-index: 3;
          transform: translateX(-50%);
          margin: 0;
          background: #ffd400;
          border: 3px solid #111;
          padding: 0.28rem 1.4rem 0.35rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.85rem;
          clip-path: polygon(6% 0%, 94% 0%, 100% 50%, 94% 100%, 6% 100%, 0% 50%);
          box-shadow: 3px 3px 0 #111;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-title) {
          margin: 1.9rem 0.75rem 0.85rem;
          font-family: var(--font-display);
          font-size: clamp(1.45rem, 6.2vw, 2.15rem);
          color: #e10600;
          letter-spacing: 0.04em;
          line-height: 1.12;
          text-shadow: 2px 2px 0 #111;
          word-break: break-word;
          overflow-wrap: anywhere;
          max-width: 18ch;
          margin-left: auto;
          margin-right: auto;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-burst) {
          position: relative;
          z-index: 2;
          margin: 0.45rem 0.65rem 0;
          padding: 0.35rem;
          background: #ffd400;
          border: 3px solid #111;
          /* Mild jagged edge — keep left/right insets so copy isn't clipped */
          clip-path: polygon(
            1.5% 10%,
            7% 0%,
            18% 7%,
            30% 0%,
            44% 8%,
            58% 0%,
            72% 7%,
            86% 0%,
            98.5% 9%,
            100% 28%,
            97% 48%,
            100% 68%,
            97% 88%,
            86% 100%,
            70% 94%,
            52% 100%,
            34% 94%,
            18% 100%,
            6% 93%,
            0% 72%,
            2% 48%,
            0% 26%
          );
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-burst-inner) {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 0.75rem;
          align-items: center;
          padding: 1.15rem 1rem 1.25rem 1.2rem;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-burst-left) {
          min-width: 0;
          text-align: left;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-burst-right) {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-shrink: 0;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-date) {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(1.15rem, 4.5vw, 1.45rem);
          color: #e10600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          word-break: break-word;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-weekday) {
          margin: 0.15rem 0 0.4rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.85rem;
          color: #111;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-place),
        :global(.invite-cover[data-layout="superburst"] .superburst-rsvp) {
          margin: 0.18rem 0 0;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #111;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-place--address) {
          font-weight: 650;
          opacity: 0.92;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-time-pow) {
          display: grid;
          place-items: center;
          min-width: 4.4rem;
          min-height: 4.4rem;
          padding: 0.5rem 0.45rem;
          background: #e10600;
          color: #fff;
          border: 3px solid #111;
          clip-path: polygon(
            20% 0%,
            40% 12%,
            60% 0%,
            80% 18%,
            100% 30%,
            86% 52%,
            100% 75%,
            72% 100%,
            48% 88%,
            22% 100%,
            0% 72%,
            14% 48%,
            0% 22%
          );
          font-family: var(--font-display);
          font-size: 1rem;
          text-align: center;
          line-height: 1.05;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-bang) {
          font-family: var(--font-display);
          font-size: 2.75rem;
          color: #e10600;
          line-height: 1;
          text-shadow: 2px 2px 0 #111;
        }

        :global(.invite-cover[data-layout="superburst"] .superburst-skyline) {
          display: block;
          width: 100%;
          height: 48px;
          margin-top: -0.35rem;
        }

        /* —— Spider kids (web-slinger comic) —— */
        :global(.invite-cover[data-layout="spiderweb"] .invite-cover-atmosphere-veil) {
          background:
            linear-gradient(
              180deg,
              rgba(180, 0, 0, 0.35),
              rgba(120, 0, 0, 0.75) 70%,
              #7a0000 100%
            );
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-web-overlay) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.28;
          background:
            radial-gradient(circle at 50% 42%, transparent 0 18%, rgba(0, 0, 0, 0.18) 18.5% 19%, transparent 19.5%),
            repeating-conic-gradient(
              from 0deg at 50% 42%,
              rgba(0, 0, 0, 0.22) 0deg 1.2deg,
              transparent 1.2deg 18deg
            );
        }

        :global(.invite-cover[data-layout="spiderweb"] .invite-card) {
          position: relative;
          overflow: visible;
          border: 4px solid #111;
          border-radius: 1.15rem;
          background: #d40000;
          box-shadow: 8px 8px 0 #111;
          padding: 0;
          color: #fff;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-card) {
          position: relative;
          z-index: 1;
          overflow: visible;
          padding: 1rem 0.9rem 0.65rem;
          background:
            linear-gradient(180deg, #d40000 0%, #b00000 55%, #8a0000 100%);
          border-radius: inherit;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-top) {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-photo-stack) {
          position: relative;
          width: min(52%, 180px);
          flex-shrink: 0;
          display: grid;
          place-items: center;
          overflow: visible;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-photo-web) {
          position: absolute;
          width: 230%;
          height: 230%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-6deg);
          z-index: 0;
          pointer-events: none;
          filter: drop-shadow(1px 1px 0 rgba(255, 255, 255, 0.15));
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-photo-frame) {
          position: relative;
          z-index: 1;
          width: 88%;
          aspect-ratio: 1;
          border: 4px solid #111;
          background: #fff;
          box-shadow: 4px 4px 0 #111;
          overflow: hidden;
          transform: rotate(-3deg);
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-photo-frame img) {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-icon) {
          width: 78px;
          height: auto;
          flex-shrink: 0;
          filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.35));
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-celebrate) {
          display: inline-block;
          margin: 0.85rem auto 0.55rem;
          width: fit-content;
          max-width: 100%;
          background: #fff;
          color: #111;
          border: 3px solid #111;
          border-radius: 999px;
          padding: 0.45rem 1.1rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 0.85rem;
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 3px 3px 0 #111;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-name-burst) {
          margin: 0.35rem auto 0.9rem;
          width: min(100%, 320px);
          min-height: 210px;
          display: grid;
          place-content: center;
          gap: 0.15rem;
          text-align: center;
          background: #ffd400;
          border: 4px solid #111;
          clip-path: polygon(
            8% 6%,
            18% 0%,
            32% 8%,
            48% 0%,
            62% 9%,
            78% 0%,
            92% 10%,
            100% 28%,
            94% 46%,
            100% 64%,
            90% 82%,
            74% 100%,
            52% 92%,
            34% 100%,
            16% 88%,
            0% 70%,
            8% 48%,
            0% 28%
          );
          box-shadow: 0 0 0 2px #111;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-name) {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 12vw, 4.2rem);
          color: #fff;
          letter-spacing: 0.04em;
          line-height: 0.92;
          text-transform: uppercase;
          text-shadow:
            -3px -3px 0 #111,
            3px -3px 0 #111,
            -3px 3px 0 #111,
            3px 3px 0 #111,
            5px 5px 0 rgba(0, 0, 0, 0.35);
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-age) {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(3.2rem, 14vw, 4.8rem);
          color: #fff;
          line-height: 0.9;
          text-shadow:
            -3px -3px 0 #111,
            3px -3px 0 #111,
            -3px 3px 0 #111,
            3px 3px 0 #111;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-bottom) {
          margin: 0.25rem 0 0.75rem;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-address) {
          background: #fff;
          color: #111;
          border: 3px solid #111;
          border-radius: 0.35rem;
          padding: 0.7rem 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          font-size: 0.72rem;
          line-height: 1.35;
          box-shadow: 3px 3px 0 #111;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-footer-art) {
          position: relative;
          margin: 0 -0.9rem;
          min-height: 56px;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-footer-art .superburst-skyline) {
          display: block;
          width: 100%;
          height: 52px;
          opacity: 0.92;
          color: #5a0000;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-footer-art .superburst-skyline path) {
          fill: #5a0000;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-smoke) {
          position: absolute;
          right: 0.35rem;
          bottom: 0.1rem;
          width: 42%;
          height: auto;
          opacity: 0.95;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-card-bar) {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          flex-wrap: wrap;
          margin-top: 0.35rem;
          padding-top: 0.55rem;
          border-top: 3px solid rgba(0, 0, 0, 0.28);
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-date-footer) {
          flex: 1 1 140px;
          min-width: 0;
          background: #1e5bff;
          border: 3px solid #111;
          color: #fff;
          padding: 0.55rem 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-size: 0.7rem;
          line-height: 1.25;
          box-shadow: 3px 3px 0 #111;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-date-footer p) {
          margin: 0.08rem 0;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-card-bar .spider-actions) {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin: 0;
          flex: 1 1 auto;
          justify-content: flex-end;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-actions .btn-primary),
        :global(.invite-cover[data-layout="spiderweb"] .spider-actions .btn-ghost) {
          margin: 0;
          padding: 0.55rem 0.85rem;
          font-size: 0.78rem;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-actions .btn-primary) {
          background: #1e5bff;
          border: 3px solid #111;
          box-shadow: 3px 3px 0 #111;
        }

        :global(.invite-cover[data-layout="spiderweb"] .spider-actions .btn-ghost) {
          background: #fff;
          color: #111;
          border: 3px solid #111;
          box-shadow: 3px 3px 0 #ffd400;
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

        :global(.invite-cover[data-layout="splash"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(
              circle at 16% 18%,
              color-mix(in srgb, #e53935 42%, transparent),
              transparent 40%
            ),
            radial-gradient(
              circle at 84% 22%,
              color-mix(in srgb, #4fc3f7 48%, transparent),
              transparent 42%
            ),
            radial-gradient(
              circle at 50% 78%,
              color-mix(in srgb, #ffd54f 40%, transparent),
              transparent 46%
            ),
            linear-gradient(
              165deg,
              color-mix(in srgb, #fff6eb 35%, transparent) 0%,
              color-mix(in srgb, #fff6eb 82%, transparent) 70%,
              #fff6eb 100%
            );
        }

        :global(.invite-cover[data-layout="splash"] .splash-blobs) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.55;
          background-image:
            radial-gradient(circle at 12% 30%, #e53935 0 10px, transparent 11px),
            radial-gradient(circle at 88% 24%, #4fc3f7 0 12px, transparent 13px),
            radial-gradient(circle at 22% 78%, #ffd54f 0 9px, transparent 10px),
            radial-gradient(circle at 76% 70%, #e53935 0 7px, transparent 8px),
            radial-gradient(circle at 48% 16%, #4fc3f7 0 8px, transparent 9px);
          animation: splashFloat 7s ease-in-out infinite alternate;
        }

        :global(.invite-cover[data-layout="splash"] .invite-card) {
          position: relative;
          overflow: visible;
          border: 4px solid #1a2744;
          border-radius: 1.35rem;
          background:
            linear-gradient(
              165deg,
              color-mix(in srgb, #4fc3f7 10%, #ffffff) 0%,
              #ffffff 40%,
              color-mix(in srgb, #ffd54f 12%, #ffffff) 100%
            );
          box-shadow:
            0 0 0 5px #ffd54f,
            0 0 0 10px #4fc3f7,
            0 0 0 15px #e53935,
            0 22px 48px color-mix(in srgb, #1a2744 18%, transparent);
        }

        :global(.invite-cover[data-layout="splash"] .splash-sticker) {
          position: absolute;
          z-index: 3;
          width: 3.1rem;
          height: auto;
          filter: drop-shadow(2px 3px 0 #1a2744);
          animation: splashWiggle 2.8s ease-in-out infinite;
        }

        :global(.invite-cover[data-layout="splash"] .splash-sticker--balloon) {
          top: -1.1rem;
          left: 0.85rem;
          width: 2.6rem;
          --splash-rot: -12deg;
        }

        :global(.invite-cover[data-layout="splash"] .splash-sticker--star) {
          top: 1rem;
          right: -0.55rem;
          width: 2.8rem;
          animation-delay: 0.35s;
          --splash-rot: 14deg;
        }

        :global(.invite-cover[data-layout="splash"] .splash-sticker--dot) {
          bottom: 7.5rem;
          left: -0.7rem;
          width: 2.4rem;
          animation-delay: 0.7s;
          --splash-rot: -8deg;
        }

        :global(.invite-cover[data-layout="splash"] .invite-card-photo) {
          border-bottom: 4px solid #1a2744;
          border-radius: 1.1rem 1.1rem 0 0;
        }

        :global(.invite-cover[data-layout="splash"] .invite-ornament--splash) {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.4rem;
          width: auto;
          margin-bottom: 0.85rem;
        }

        :global(.invite-cover[data-layout="splash"] .splash-pip) {
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 999px;
          border: 1.5px solid #1a2744;
        }

        :global(.invite-cover[data-layout="splash"] .splash-pip--diamond) {
          border-radius: 0.12rem;
          transform: rotate(45deg);
        }

        :global(.invite-cover[data-layout="splash"] .invite-card-host) {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.05rem;
          color: #e53935;
          letter-spacing: 0.01em;
        }

        :global(.invite-cover[data-layout="splash"] .invite-card-invite-line) {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.7rem;
          font-weight: 600;
          color: #5a6b88;
        }

        :global(.invite-cover[data-layout="splash"] .invite-card-headline) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(2rem, 7vw, 2.75rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #1a2744;
          text-shadow: 3px 3px 0 #ffd54f;
        }

        :global(.invite-cover[data-layout="splash"] .invite-card-when) {
          margin-top: 1rem;
          padding: 1rem 1.1rem;
          border-radius: 1rem;
          background:
            linear-gradient(
              135deg,
              color-mix(in srgb, #4fc3f7 16%, #ffffff),
              color-mix(in srgb, #ffd54f 14%, #ffffff)
            );
          border: 3px solid #1a2744;
          box-shadow: 3px 3px 0 #e53935;
        }

        :global(.invite-cover[data-layout="splash"] .invite-card-date) {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.15rem;
          color: #e53935;
        }

        :global(.invite-cover[data-layout="splash"] .btn-primary) {
          border-radius: 999px;
          border: 3px solid #1a2744;
          background: #e53935;
          color: #ffffff;
          font-weight: 700;
          box-shadow: 3px 3px 0 #4fc3f7;
        }

        :global(.invite-cover[data-layout="splash"] .btn-ghost) {
          border-radius: 999px;
          border: 3px solid #1a2744;
          background: #ffd54f;
          color: #1a2744;
          font-weight: 700;
        }

        @keyframes splashWiggle {
          0%,
          100% {
            transform: rotate(var(--splash-rot, -8deg)) translateY(0);
          }
          50% {
            transform: rotate(calc(var(--splash-rot, -8deg) + 7deg))
              translateY(-4px);
          }
        }

        @keyframes splashFloat {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(0, 10px, 0);
          }
        }

        :global(.invite-cover[data-layout="collage"]) {
          min-height: min(100vh, 56rem);
          background: var(--invite-bg);
        }

        :global(.invite-cover[data-layout="collage"] .invite-cover-atmosphere-img) {
          opacity: 0.22;
          filter: grayscale(0.35) contrast(0.95) saturate(0.7);
          transform: scale(1.08);
        }

        :global(.invite-cover[data-layout="collage"] .invite-cover-atmosphere-veil) {
          background:
            radial-gradient(
              circle at 12% 18%,
              color-mix(in srgb, var(--invite-accent) 22%, transparent),
              transparent 38%
            ),
            radial-gradient(
              circle at 88% 12%,
              color-mix(in srgb, #fda4af 18%, transparent),
              transparent 36%
            ),
            linear-gradient(
              180deg,
              color-mix(in srgb, var(--invite-bg) 55%, transparent) 0%,
              color-mix(in srgb, var(--invite-bg) 92%, transparent) 55%,
              var(--invite-bg) 100%
            );
        }

        :global(.invite-cover[data-layout="collage"] .collage-grain) {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.22;
          background-image:
            radial-gradient(#1a1a1a 0.55px, transparent 0.65px),
            radial-gradient(#1a1a1a 0.4px, transparent 0.5px);
          background-size: 6px 6px, 10px 10px;
          background-position: 0 0, 3px 5px;
          mix-blend-mode: multiply;
        }

        :global(.invite-cover[data-layout="collage"] .invite-cover-stage) {
          padding: clamp(1.5rem, 4vw, 2.75rem) 1rem 2.5rem;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card) {
          position: relative;
          overflow: visible;
          width: min(100%, 30rem);
          margin-inline: auto;
          border: 0;
          border-radius: 0.2rem;
          background:
            linear-gradient(
              165deg,
              #fffefc 0%,
              color-mix(in srgb, var(--invite-surface) 88%, #f8f1ec) 100%
            );
          box-shadow:
            0 0 0 1px color-mix(in srgb, #111 6%, transparent),
            0 1px 0 color-mix(in srgb, #fff 90%, transparent) inset,
            0 28px 60px color-mix(in srgb, #111 14%, transparent);
        }

        :global(.invite-cover[data-layout="collage"] .invite-card::before) {
          content: "";
          position: absolute;
          inset: 0.55rem;
          border: 1px solid color-mix(in srgb, #111 8%, transparent);
          border-radius: 0.1rem;
          pointer-events: none;
          z-index: 1;
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker) {
          position: absolute;
          z-index: 4;
          pointer-events: none;
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--cake) {
          top: -0.1rem;
          right: 0.1rem;
          width: clamp(5rem, 20vw, 6.1rem);
          transform: rotate(8deg);
          animation: collageBob 3.6s ease-in-out infinite;
          filter: drop-shadow(0 3px 4px color-mix(in srgb, #111 12%, transparent));
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--banner) {
          top: 0.55rem;
          left: 0.2rem;
          width: clamp(8rem, 36vw, 10rem);
          transform: rotate(-11deg);
          filter: drop-shadow(0 2px 0 color-mix(in srgb, #111 8%, transparent));
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--lips) {
          top: 46%;
          left: 0.55rem;
          width: 2.6rem;
          transform: rotate(-18deg);
          filter: drop-shadow(0 2px 2px color-mix(in srgb, #111 12%, transparent));
        }

        :global(.invite-cover[data-layout="collage"] .collage-photo-stage) {
          position: relative;
          z-index: 3;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          justify-items: center;
          gap: 0;
          margin: 1.1rem -0.65rem 0.05rem;
          min-height: 10.5rem;
          overflow: visible;
        }

        :global(.invite-cover[data-layout="collage"] .collage-photo-stage .collage-sticker--disco) {
          position: relative;
          bottom: auto;
          left: auto;
          right: auto;
          top: auto;
          justify-self: end;
          width: clamp(5.4rem, 24vw, 6.8rem);
          margin-right: -1.35rem;
          margin-bottom: 0.2rem;
          transform: rotate(-14deg);
          animation: collageBob 4.8s ease-in-out infinite;
          filter: drop-shadow(0 8px 14px color-mix(in srgb, #111 20%, transparent));
          z-index: 1;
        }

        :global(.invite-cover[data-layout="collage"] .collage-photo-stage .collage-sticker--balloons) {
          position: relative;
          bottom: auto;
          left: auto;
          right: auto;
          top: auto;
          justify-self: start;
          width: clamp(6.8rem, 30vw, 8.6rem);
          margin-left: -1.5rem;
          margin-bottom: 0;
          transform: rotate(10deg);
          animation: collageBob 4.2s ease-in-out infinite;
          animation-delay: -1.2s;
          filter: drop-shadow(0 10px 16px color-mix(in srgb, #111 18%, transparent));
          z-index: 1;
        }

        :global(.invite-cover[data-layout="collage"] .collage-photo-stage .invite-card-photo--inset) {
          margin: 0;
          width: clamp(9.2rem, 40vw, 11.2rem);
          max-width: none;
          z-index: 2;
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--star-a) {
          top: 37%;
          right: 0.55rem;
          width: 2.1rem;
          transform: rotate(14deg);
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--star-b) {
          top: 20%;
          left: 0.85rem;
          width: 1.55rem;
          transform: rotate(-18deg);
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--star-c) {
          bottom: 28%;
          left: 1.6rem;
          width: 1.25rem;
          transform: rotate(8deg);
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--dot) {
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 999px;
          background: var(--invite-accent);
          box-shadow: 0 0 0 1px color-mix(in srgb, #111 20%, transparent);
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--dot-a) {
          top: 31%;
          left: 0.85rem;
          background: #60a5fa;
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--dot-b) {
          top: 48%;
          right: 1.15rem;
          background: #fbbf24;
          width: 0.4rem;
          height: 0.4rem;
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--dot-c) {
          bottom: 27%;
          right: 28%;
          background: #f472b6;
          width: 0.45rem;
          height: 0.45rem;
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--dot-d) {
          top: 17%;
          right: 32%;
          background: #111;
          width: 0.32rem;
          height: 0.32rem;
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--dot-e) {
          bottom: 42%;
          left: 12%;
          background: #a78bfa;
          width: 0.38rem;
          height: 0.38rem;
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--confetti) {
          width: 0.7rem;
          height: 0.28rem;
          border-radius: 0.08rem;
          background: var(--invite-accent);
          transform: rotate(35deg);
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--confetti-a) {
          top: 36%;
          left: 18%;
          background: #f472b6;
          transform: rotate(-28deg);
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--confetti-b) {
          top: 55%;
          right: 14%;
          background: #60a5fa;
          transform: rotate(42deg);
        }

        :global(.invite-cover[data-layout="collage"] .collage-sticker--confetti-c) {
          bottom: 36%;
          left: 8%;
          background: #fbbf24;
          transform: rotate(-12deg);
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-body) {
          position: relative;
          z-index: 2;
          padding: clamp(3.3rem, 8vw, 3.9rem) 1.15rem 1.7rem;
          text-align: center;
        }

        :global(.invite-cover[data-layout="collage"] .invite-ornament--collage) {
          display: none;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-host) {
          display: none;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-invite-line) {
          font-family: var(--font-great-vibes), cursive;
          font-size: clamp(1.7rem, 5vw, 2.2rem);
          letter-spacing: 0.01em;
          text-transform: none;
          font-weight: 400;
          color: color-mix(in srgb, var(--invite-text) 78%, var(--invite-muted));
          margin: 0 0 0.02rem;
          line-height: 1.05;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-headline) {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: clamp(3.9rem, 16vw, 5.8rem);
          line-height: 0.86;
          letter-spacing: -0.015em;
          text-transform: uppercase;
          color: var(--invite-text);
          margin: 0 0 0.95rem;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-when--collage) {
          margin: 0 auto;
          max-width: 20rem;
          padding: 0;
          border: 0 !important;
          background: transparent;
          display: grid;
          gap: 0.45rem;
          box-shadow: none;
        }

        :global(.invite-cover[data-layout="collage"] .collage-when-row) {
          display: grid;
          grid-template-columns: minmax(3.2rem, 1fr) auto minmax(3.2rem, 1fr);
          align-items: center;
          gap: 0.4rem;
        }

        :global(.invite-cover[data-layout="collage"] .collage-when-day),
        :global(.invite-cover[data-layout="collage"] .collage-when-time) {
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--invite-text);
          line-height: 1.15;
        }

        :global(.invite-cover[data-layout="collage"] .collage-when-day) {
          text-align: right;
          padding-right: 0.1rem;
        }

        :global(.invite-cover[data-layout="collage"] .collage-when-time) {
          text-align: left;
          padding-left: 0.1rem;
        }

        :global(.invite-cover[data-layout="collage"] .collage-when-date) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 9rem;
          padding: 0.58rem 0.75rem;
          border: 1.6px solid var(--invite-text);
          border-radius: 0;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.74rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--invite-text);
          background: #fff;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-when--collage .invite-card-venue),
        :global(.invite-cover[data-layout="collage"] .invite-card-when--collage .invite-card-address) {
          font-family: var(--font-body);
          font-size: 0.7rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--invite-text);
          margin: 0;
          line-height: 1.35;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-photo--inset) {
          position: relative;
          z-index: 3;
          margin: 1.55rem auto 0.15rem;
          width: clamp(7.8rem, 34vw, 9.4rem);
          max-width: 48%;
          aspect-ratio: 1;
          border-radius: 999px;
          border: 2.5px solid #111;
          box-shadow:
            9px 11px 0 color-mix(in srgb, var(--invite-accent) 88%, #fff),
            0 14px 26px color-mix(in srgb, #111 14%, transparent);
          overflow: hidden;
          transform: rotate(-5deg);
          background: #ddd;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-photo--inset img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-tagline) {
          font-family: var(--font-great-vibes), cursive;
          font-size: clamp(1.55rem, 4.2vw, 2rem);
          color: var(--invite-text);
          margin-top: 0.95rem;
          line-height: 1.1;
        }

        :global(.invite-cover[data-layout="collage"] .invite-card-actions) {
          margin-top: 1.15rem;
          gap: 0.65rem;
        }

        :global(.invite-cover[data-layout="collage"] .btn-primary) {
          border-radius: 999px;
          background: var(--invite-text);
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 0.78rem;
          padding: 0.7rem 1.25rem;
          box-shadow: 3px 3px 0 var(--invite-accent);
        }

        :global(.invite-cover[data-layout="collage"] .btn-ghost) {
          border-radius: 999px;
          border: 1.5px solid var(--invite-text);
          background: transparent;
          color: var(--invite-text);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 0.76rem;
          padding: 0.65rem 1.1rem;
        }

        :global(.invite-cover[data-layout="collage"] .invite-text-link) {
          color: var(--invite-muted);
          letter-spacing: 0.04em;
        }

        :global(.invite-cover[data-layout="collage"][data-template="blush-collage"] .invite-card) {
          background:
            linear-gradient(
              168deg,
              #fffdfb 0%,
              #fff7f2 48%,
              #fff1f6 100%
            );
        }

        :global(.invite-cover[data-layout="collage"][data-template="disco-silver"] .collage-sticker--cake) {
          filter: grayscale(0.35) drop-shadow(0 3px 4px color-mix(in srgb, #111 12%, transparent));
        }

        :global(.invite-cover[data-layout="collage"][data-template="candy-bubble"] .invite-card-headline) {
          letter-spacing: 0.01em;
          color: color-mix(in srgb, var(--invite-accent) 55%, var(--invite-text));
        }

        :global(.invite-cover[data-layout="collage"][data-template="candy-bubble"] .collage-when-date) {
          border-color: var(--invite-accent);
          color: var(--invite-accent-2);
        }

        @keyframes collageBob {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -5px;
          }
        }

        :global(.invite-cover[data-layout="collage"] .btn-primary:hover) {
          background: var(--invite-accent);
          color: #fff;
        }

        @media (max-width: 420px) {
          :global(.invite-cover[data-layout="collage"] .collage-photo-stage) {
            margin-inline: -0.75rem;
            min-height: 9.2rem;
          }

          :global(.invite-cover[data-layout="collage"] .collage-photo-stage .collage-sticker--disco) {
            width: 4.6rem;
            margin-right: -0.95rem;
          }

          :global(.invite-cover[data-layout="collage"] .collage-photo-stage .collage-sticker--balloons) {
            width: 5.8rem;
            margin-left: -1.05rem;
          }

          :global(.invite-cover[data-layout="collage"] .collage-photo-stage .invite-card-photo--inset) {
            width: 8.2rem;
          }

          :global(.invite-cover[data-layout="collage"] .collage-when-row) {
            gap: 0.3rem;
          }

          :global(.invite-cover[data-layout="collage"] .collage-when-date) {
            min-width: 7.2rem;
            font-size: 0.64rem;
            padding: 0.45rem 0.5rem;
          }

          :global(.invite-cover[data-layout="collage"] .collage-when-day),
          :global(.invite-cover[data-layout="collage"] .collage-when-time) {
            font-size: 0.58rem;
            letter-spacing: 0.1em;
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
              transparent 42%
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

        /* Dark-page templates (Blue modern, Quince azul, Game on):
           body sections become light readable cabinets on the ink page. */
        .invite-root[data-page="ink"] .invite-section {
          --invite-text: #0b1f3a;
          --invite-muted: #5b6f8c;
          --invite-bg: #f4f8ff;
          --invite-surface: #ffffff;
          color: #0b1f3a;
          max-width: 36rem;
          margin-left: auto;
          margin-right: auto;
          margin-top: 1.25rem;
          margin-bottom: 1.25rem;
          padding: clamp(1.5rem, 4vw, 2.25rem) clamp(1.25rem, 4vw, 1.85rem);
          border-radius: 1.15rem;
          background: #ffffff;
          border: 1px solid color-mix(in srgb, var(--invite-accent) 28%, transparent);
          box-shadow:
            0 1px 0 color-mix(in srgb, #fff 70%, transparent) inset,
            0 18px 40px color-mix(in srgb, #041226 18%, transparent);
        }

        .invite-root[data-page="ink"] .invite-section--paper,
        .invite-root[data-page="ink"] .invite-section--surface,
        .invite-root[data-page="ink"] .invite-section--rsvp {
          max-width: 36rem;
          padding-left: clamp(1.25rem, 4vw, 1.85rem);
          padding-right: clamp(1.25rem, 4vw, 1.85rem);
          background: #ffffff;
          border-block: none;
          box-shadow:
            0 1px 0 color-mix(in srgb, #fff 70%, transparent) inset,
            0 18px 40px color-mix(in srgb, #041226 18%, transparent);
        }

        .invite-root[data-page="ink"] .invite-section-title {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: clamp(1.35rem, 3vw, 1.7rem);
          letter-spacing: -0.02em;
          color: #0b1f3a;
        }

        .invite-root[data-page="ink"] .invite-meta dt {
          color: var(--invite-accent);
          font-weight: 600;
        }

        .invite-root[data-page="ink"] .invite-meta dd,
        .invite-root[data-page="ink"] .invite-about-body,
        .invite-root[data-page="ink"] .invite-extra-line,
        .invite-root[data-page="ink"] .invite-faq dt {
          color: #0b1f3a;
        }

        .invite-root[data-page="ink"] .invite-prompt,
        .invite-root[data-page="ink"] .invite-faq dd,
        .invite-root[data-page="ink"] .rsvp-field span {
          color: #5b6f8c;
        }

        .invite-root[data-page="ink"] .rsvp-panel {
          background: #f4f8ff;
          border: 1px solid color-mix(in srgb, var(--invite-accent) 32%, transparent);
          border-radius: 1rem;
          box-shadow: 0 12px 28px color-mix(in srgb, #041226 10%, transparent);
          padding: clamp(1.1rem, 3vw, 1.5rem);
        }

        .invite-root[data-page="ink"] .rsvp-ornament {
          background: linear-gradient(
            90deg,
            var(--invite-accent),
            var(--invite-accent-2)
          );
        }

        .invite-root[data-page="ink"] .invite-section--rsvp .invite-deadline {
          background: color-mix(in srgb, var(--invite-accent) 12%, #f4f8ff);
          color: #0b1f3a;
          border-radius: 999px;
          font-weight: 600;
        }

        .invite-root[data-page="ink"] .rsvp-field input,
        .invite-root[data-page="ink"] .rsvp-field textarea,
        .invite-root[data-page="ink"] .rsvp-field select,
        .invite-root[data-page="ink"] .invite-section--rsvp .rsvp-field input,
        .invite-root[data-page="ink"] .invite-section--rsvp .rsvp-field textarea,
        .invite-root[data-page="ink"] .invite-section--rsvp .rsvp-field select {
          background: #ffffff;
          color: #0b1f3a;
          border: 1.5px solid color-mix(in srgb, #0b1f3a 18%, transparent);
          border-radius: 0.55rem;
        }

        .invite-root[data-page="ink"] .rsvp-field input:focus,
        .invite-root[data-page="ink"] .rsvp-field textarea:focus,
        .invite-root[data-page="ink"] .rsvp-field select:focus,
        .invite-root[data-page="ink"] .invite-section--rsvp .rsvp-field input:focus,
        .invite-root[data-page="ink"] .invite-section--rsvp .rsvp-field textarea:focus,
        .invite-root[data-page="ink"] .invite-section--rsvp .rsvp-field select:focus {
          border-color: var(--invite-accent);
          outline: 2px solid color-mix(in srgb, var(--invite-accent) 35%, transparent);
          outline-offset: 1px;
        }

        .invite-root[data-page="ink"] .btn-primary,
        .invite-root[data-page="ink"] .invite-section--rsvp .btn-submit {
          background: var(--invite-accent);
          color: #ffffff;
          border: none;
          border-radius: 999px;
          font-weight: 600;
          box-shadow: 0 10px 24px color-mix(in srgb, var(--invite-accent) 30%, transparent);
        }

        .invite-root[data-page="ink"] .btn-primary:hover,
        .invite-root[data-page="ink"] .invite-section--rsvp .btn-submit:hover {
          background: color-mix(in srgb, var(--invite-accent) 82%, #041226);
          color: #ffffff;
        }

        .invite-root[data-page="ink"] .invite-footer {
          color: color-mix(in srgb, #f4f8ff 72%, transparent);
        }

        .invite-root[data-page="ink"] .invite-footer-attr {
          color: var(--invite-accent-2);
        }

        /* Blue modern — icy cobalt cabinets */
        .invite-root[data-layout="azure"] .invite-section,
        .invite-root[data-layout="azure"] .invite-section--paper,
        .invite-root[data-layout="azure"] .invite-section--surface,
        .invite-root[data-layout="azure"] .invite-section--rsvp {
          background:
            linear-gradient(
              160deg,
              #ffffff 0%,
              color-mix(in srgb, #7ec8ff 10%, #ffffff) 55%,
              #f4f8ff 100%
            );
          border-radius: 1.35rem;
          border: 0;
          box-shadow:
            0 1px 0 color-mix(in srgb, white 75%, transparent) inset,
            0 22px 48px color-mix(in srgb, #041226 22%, transparent);
        }

        .invite-root[data-layout="azure"] .rsvp-panel {
          background:
            linear-gradient(
              180deg,
              color-mix(in srgb, #7ec8ff 12%, #ffffff),
              #f4f8ff
            );
          border: 0;
          border-radius: 1.15rem;
        }

        .invite-root[data-layout="azure"] .invite-section-title {
          background: linear-gradient(105deg, #0b1f3a 0%, #2b6fff 70%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .invite-root[data-layout="azure"] .invite-section--rsvp .invite-deadline {
          background: #0b1f3a;
          color: #7ec8ff;
        }

        /* Quince azul — cobalt + champagne cabinets */
        .invite-root[data-layout="quince"] .invite-section,
        .invite-root[data-layout="quince"] .invite-section--paper,
        .invite-root[data-layout="quince"] .invite-section--surface,
        .invite-root[data-layout="quince"] .invite-section--rsvp {
          background:
            linear-gradient(
              160deg,
              #ffffff 0%,
              color-mix(in srgb, #2b6fff 6%, #ffffff) 45%,
              color-mix(in srgb, #d4af37 8%, #ffffff) 100%
            );
          border-radius: 1.25rem;
          border: 1px solid color-mix(in srgb, #d4af37 35%, transparent);
          box-shadow:
            0 1px 0 color-mix(in srgb, white 70%, transparent) inset,
            0 20px 44px color-mix(in srgb, #041226 18%, transparent);
        }

        .invite-root[data-layout="quince"] .rsvp-panel {
          background: color-mix(in srgb, #d4af37 6%, #f7faff);
          border: 1px solid color-mix(in srgb, #2b6fff 18%, transparent);
        }

        .invite-root[data-layout="quince"] .invite-section-title {
          background: linear-gradient(105deg, #0b1f3a 0%, #2b6fff 55%, #d4af37 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .invite-root[data-layout="quince"] .invite-meta dt {
          color: #d4af37;
        }

        .invite-root[data-layout="quince"] .btn-primary,
        .invite-root[data-layout="quince"] .invite-section--rsvp .btn-submit {
          background: linear-gradient(120deg, #2b6fff, #1a4fd6 60%, #d4af37);
          color: #f7faff;
        }

        /* Game on — pixel cabinets (extends ink base) */
        .invite-root[data-layout="arcade"] .invite-section {
          --invite-text: #1a0a3c;
          --invite-muted: #5c4e78;
          --invite-bg: #f7f2ff;
          border: 3px solid #1a0a3c;
          border-radius: 0.85rem;
          background:
            linear-gradient(
              160deg,
              #ffffff 0%,
              color-mix(in srgb, #ff3d9a 6%, #ffffff) 48%,
              color-mix(in srgb, #00e5ff 7%, #ffffff) 100%
            );
          box-shadow:
            4px 4px 0 #ff3d9a,
            8px 8px 0 #00e5ff;
        }

        .invite-root[data-layout="arcade"] .invite-section--paper,
        .invite-root[data-layout="arcade"] .invite-section--surface,
        .invite-root[data-layout="arcade"] .invite-section--rsvp {
          background:
            linear-gradient(
              160deg,
              #ffffff 0%,
              color-mix(in srgb, #ff3d9a 6%, #ffffff) 48%,
              color-mix(in srgb, #00e5ff 7%, #ffffff) 100%
            );
          box-shadow:
            4px 4px 0 #ff3d9a,
            8px 8px 0 #00e5ff;
        }

        .invite-root[data-layout="arcade"] .invite-section-title {
          font-family: var(--font-body);
          font-weight: 700;
          letter-spacing: 0.01em;
          background: none;
          -webkit-background-clip: unset;
          background-clip: unset;
          color: #1a0a3c;
        }

        .invite-root[data-layout="arcade"] .invite-section-title::before {
          content: "▶ ";
          color: #ff3d9a;
          font-size: 0.75em;
        }

        .invite-root[data-layout="arcade"] .invite-meta dt {
          color: #ff3d9a;
        }

        .invite-root[data-layout="arcade"] .rsvp-panel {
          background: #f7f2ff;
          border: 3px solid #1a0a3c;
          border-radius: 0.75rem;
          box-shadow: 4px 4px 0 #00e5ff;
        }

        .invite-root[data-layout="arcade"] .rsvp-ornament {
          height: 4px;
          border-radius: 0;
          background: repeating-linear-gradient(
            90deg,
            #ff3d9a 0 8px,
            #00e5ff 8px 16px,
            #ffe600 16px 24px,
            #39ff14 24px 32px
          );
        }

        .invite-root[data-layout="arcade"] .invite-section--rsvp .invite-deadline {
          background: #1a0a3c;
          color: #ffe600;
          border-radius: 0.35rem;
        }

        .invite-root[data-layout="arcade"] .rsvp-field input,
        .invite-root[data-layout="arcade"] .rsvp-field textarea,
        .invite-root[data-layout="arcade"] .rsvp-field select,
        .invite-root[data-layout="arcade"] .invite-section--rsvp .rsvp-field input,
        .invite-root[data-layout="arcade"] .invite-section--rsvp .rsvp-field textarea,
        .invite-root[data-layout="arcade"] .invite-section--rsvp .rsvp-field select {
          border: 2px solid color-mix(in srgb, #1a0a3c 28%, transparent);
          border-radius: 0.45rem;
        }

        .invite-root[data-layout="arcade"] .btn-primary,
        .invite-root[data-layout="arcade"] .invite-section--rsvp .btn-submit {
          background: #ff3d9a;
          color: #ffffff;
          border: 3px solid #1a0a3c;
          border-radius: 0.45rem;
          box-shadow: 3px 3px 0 #00e5ff;
          font-weight: 700;
        }

        .invite-root[data-layout="arcade"] .btn-primary:hover,
        .invite-root[data-layout="arcade"] .invite-section--rsvp .btn-submit:hover {
          background: #00e5ff;
          color: #1a0a3c;
        }

        .invite-root[data-layout="arcade"] .invite-footer-attr {
          color: #00e5ff;
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
          gap: 0.75rem;
          justify-items: center;
        }

        .invite-gallery img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
          background: var(--invite-surface);
        }

        .invite-gallery--square img {
          border-radius: 0.35rem;
          aspect-ratio: 1;
        }

        .invite-gallery--rectangle {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }

        .invite-gallery--rectangle img {
          aspect-ratio: 4 / 3;
          border-radius: 0.45rem;
        }

        .invite-gallery--circle img {
          aspect-ratio: 1;
          border-radius: 50%;
        }

        .invite-gallery--heart {
          gap: 1rem 0.5rem;
        }

        .invite-gallery--heart img {
          aspect-ratio: 1;
          clip-path: polygon(
            50% 88%,
            10% 52%,
            4% 28%,
            18% 8%,
            38% 10%,
            50% 28%,
            62% 10%,
            82% 8%,
            96% 28%,
            90% 52%
          );
        }

        .invite-gallery--diamond {
          gap: 1.1rem;
        }

        .invite-gallery--diamond img {
          aspect-ratio: 1;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }

        .invite-gallery--hex {
          gap: 0.85rem;
        }

        .invite-gallery--hex img {
          aspect-ratio: 1;
          clip-path: polygon(
            25% 6%,
            75% 6%,
            100% 50%,
            75% 94%,
            25% 94%,
            0% 50%
          );
        }

        .invite-gallery--scatter {
          gap: 1rem 0.85rem;
          padding: 0.5rem 0.25rem 1rem;
        }

        .invite-gallery--scatter img {
          aspect-ratio: 1;
          border-radius: 0.55rem;
          box-shadow: 0 10px 28px color-mix(in srgb, var(--invite-text) 14%, transparent);
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

        .invite-section--rsvp {
          background:
            linear-gradient(
              165deg,
              color-mix(in srgb, var(--invite-accent) 14%, var(--invite-surface)),
              var(--invite-surface) 42%,
              color-mix(in srgb, var(--invite-accent-2) 10%, var(--invite-bg))
            );
          padding-top: clamp(3.5rem, 9vw, 5.5rem);
          padding-bottom: clamp(3.5rem, 9vw, 5.5rem);
          border-block: 1px solid
            color-mix(in srgb, var(--invite-accent) 28%, transparent);
          box-shadow:
            inset 0 1px 0 color-mix(in srgb, #fff 35%, transparent),
            inset 0 -40px 80px color-mix(in srgb, var(--invite-accent) 6%, transparent);
        }

        .rsvp-panel {
          max-width: 36rem;
          margin: 0 auto;
          padding: clamp(1.35rem, 4vw, 2rem);
          border-radius: 1.15rem;
          border: 1px solid
            color-mix(in srgb, var(--invite-accent) 38%, transparent);
          background:
            linear-gradient(
              180deg,
              color-mix(in srgb, var(--invite-bg) 88%, #fff),
              color-mix(in srgb, var(--invite-surface) 70%, var(--invite-bg))
            );
          box-shadow:
            0 18px 40px color-mix(in srgb, var(--invite-text) 10%, transparent),
            0 0 0 1px color-mix(in srgb, var(--invite-accent) 12%, transparent);
        }

        .rsvp-ornament {
          width: 3.25rem;
          height: 3px;
          margin: 0 0 1rem;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            var(--invite-accent),
            var(--invite-accent-2)
          );
        }

        .rsvp-title {
          margin-bottom: 1rem;
          font-size: clamp(1.85rem, 4.5vw, 2.35rem);
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        .invite-section--rsvp .invite-prompt {
          margin-top: 0;
          color: color-mix(in srgb, var(--invite-text) 78%, var(--invite-muted));
          font-size: 1.05rem;
        }

        .invite-section--rsvp .invite-deadline {
          display: inline-block;
          margin: 0 0.5rem 1rem 0;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--invite-accent) 14%, transparent);
          color: var(--invite-text);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .invite-section--rsvp .btn-submit {
          min-height: 3.1rem;
          font-size: 1.02rem;
          letter-spacing: 0.02em;
          box-shadow: 0 10px 24px
            color-mix(in srgb, var(--invite-accent) 28%, transparent);
        }

        .invite-section--rsvp .rsvp-field input,
        .invite-section--rsvp .rsvp-field textarea,
        .invite-section--rsvp .rsvp-field select {
          border-color: color-mix(in srgb, var(--invite-accent) 28%, transparent);
          background: color-mix(in srgb, var(--invite-bg) 92%, #fff);
        }

        .invite-section--rsvp .rsvp-field input:focus,
        .invite-section--rsvp .rsvp-field textarea:focus,
        .invite-section--rsvp .rsvp-field select:focus {
          outline: 2px solid
            color-mix(in srgb, var(--invite-accent) 55%, transparent);
          outline-offset: 1px;
          border-color: var(--invite-accent);
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
          :global(.splash-blobs),
          :global(.splash-sticker),
          :global(.collage-grain),
          :global(.collage-sticker--cake),
          :global(.collage-sticker--disco),
          :global(.collage-sticker--balloons),
          :global(.collage-photo-stage .collage-sticker--disco),
          :global(.collage-photo-stage .collage-sticker--balloons),
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

        .invite-print-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          align-items: center;
          max-width: 42rem;
          margin: 0 auto;
          padding: 1rem 1rem 0;
        }

        .invite-print-tip {
          width: 100%;
          margin: 0;
          font-size: 0.8rem;
          color: var(--invite-muted);
        }

        :global(.invite-card-print-footer) {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.55rem;
          margin-top: 1rem;
        }

        :global(.invite-card-print-qr) {
          width: 5.5rem;
          height: 5.5rem;
          background: #fff;
          border: 1px solid color-mix(in srgb, var(--invite-text) 15%, transparent);
          padding: 0.25rem;
        }

        :global(.invite-card-print-url) {
          margin: 0;
          font-size: 0.72rem;
          letter-spacing: 0.02em;
          color: var(--invite-muted);
          word-break: break-all;
          text-align: center;
        }

        .invite-root--print {
          min-height: auto;
        }

        .invite-root--print :global(.invite-cover) {
          min-height: auto;
        }

        .invite-root--print :global(.fade-up) {
          opacity: 1;
          transform: none;
          animation: none;
        }

        @media print {
          @page {
            margin: 0.35in;
          }

          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invite-root--print {
            background: var(--invite-bg) !important;
          }

          .invite-print-toolbar {
            display: none !important;
          }

          .invite-root--print :global(.invite-cover) {
            min-height: auto !important;
            padding: 0 !important;
          }

          .invite-root--print :global(.invite-cover-stage) {
            padding: 0.5rem !important;
          }

          .invite-root--print :global(.invite-card) {
            box-shadow: none !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }

        .invite-cover[data-motion="float"] :global(.invite-card) {
          animation: invite-float 6s ease-in-out infinite;
        }
        .invite-cover[data-motion="pulse"] :global(.invite-card) {
          animation: invite-pulse 3.2s ease-in-out infinite;
        }
        .invite-motion-sparkle {
          pointer-events: none;
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.55) 0 1px, transparent 2px),
            radial-gradient(circle at 70% 20%, rgba(255,255,255,0.4) 0 1px, transparent 2px),
            radial-gradient(circle at 40% 75%, rgba(255,255,255,0.35) 0 1px, transparent 2px),
            radial-gradient(circle at 85% 60%, rgba(255,255,255,0.45) 0 1px, transparent 2px);
          animation: invite-sparkle 4s linear infinite;
          opacity: 0.7;
        }
        @keyframes invite-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes invite-pulse {
          0%, 100% { box-shadow: 0 24px 60px rgba(0,0,0,0.12); }
          50% { box-shadow: 0 28px 70px rgba(0,0,0,0.2); }
        }
        @keyframes invite-sparkle {
          from { transform: translateY(0); opacity: 0.55; }
          to { transform: translateY(-12px); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
