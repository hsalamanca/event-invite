"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocalizedPadrinos } from "@/lib/i18n/event-content";
import { monogramFromName } from "@/lib/quince-fields";
import { resolveLocalizedInviteCopy } from "@/lib/templates";
import type { EventRecord, RsvpAnswers } from "@/lib/types";
import EnvelopeGate from "./EnvelopeGate";
import HeroCinematic from "./HeroCinematic";
import LocalePill from "./LocalePill";
import MusicMuteFab from "./MusicMuteFab";
import QuinceRsvp from "./QuinceRsvp";
import StoryStack from "./StoryStack";
import "./quinceweb.css";

function countdownFrom(dateISO: string, timeLabel?: string) {
  const time = timeLabel?.match(/(\d{1,2}):(\d{2})/);
  const hours = time ? Number(time[1]) : 12;
  const minutes = time ? Number(time[2]) : 0;
  const target = new Date(`${dateISO}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

export default function QuinceWebInvite({
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
  const ui = getDictionary(locale).invite;
  const { headline, tagline } = resolveLocalizedInviteCopy(event, locale);
  const honoreeName = headline || event.title;
  const [opened, setOpened] = useState(false);
  const [tick, setTick] = useState(0);
  const onOpened = useCallback(() => setOpened(true), []);

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

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const countdown = useMemo(
    () => countdownFrom(event.dateISO, event.timeLabel),
    // tick keeps the clock moving without Date.now in render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event.dateISO, event.timeLabel, tick],
  );

  const mapQuery = [
    event.recepcion?.place || event.misa?.place || event.venue,
    event.recepcion?.address || event.misa?.address || event.address,
  ]
    .filter(Boolean)
    .join(", ");

  const printHref = event.slug.startsWith("quince-princesa")
    ? "/preview/quince-princesa/print"
    : `/e/${event.slug}/print/postcard`;

  return (
    <div className="qw-root" data-open={opened ? "true" : "false"}>
      <LocalePill locale={locale} />
      {opened ? (
        <MusicMuteFab muteLabel={ui.quinceMute} unmuteLabel={ui.quinceUnmute} />
      ) : null}
      {!opened ? (
        <EnvelopeGate
          monogram={monogramFromName(honoreeName)}
          hint={ui.quinceEnvelopeHint}
          onOpened={onOpened}
        />
      ) : null}
      <HeroCinematic
        name={honoreeName}
        misXv={ui.quinceMisXv}
        inviteLine={tagline}
        photoUrl={event.honoreePhotoUrl}
        photoAlt={ui.honoreePhotoAlt.replace("{name}", honoreeName)}
        heroImage={event.heroImage}
        scrollLabel={ui.quinceScroll}
      />
      {opened ? (
        <>
          <StoryStack
            labels={{
              padres: ui.quincePadres,
              padrinos: ui.quincePadrinos,
              misa: ui.quinceMass,
              recepcion: ui.quinceRecepcion,
              corte: ui.quinceCorte,
              vestimenta: ui.quinceVestimenta,
              regalos: ui.quinceRegalos,
              gallery: ui.gallery,
              countdown: ui.quinceCountdown,
              days: ui.quinceDays,
              hours: ui.quinceHours,
              minutes: ui.quinceMinutes,
              mapa: ui.quinceMap,
              openMap: ui.openMap,
              whatsapp: ui.quinceWhatsapp,
              rsvp: ui.rsvp,
            }}
            parentsLine={event.parentsLine || event.hostName}
            padrinos={resolveLocalizedPadrinos(event.padrinos, locale)}
            misa={event.misa}
            recepcion={event.recepcion}
            corte={resolveLocalizedPadrinos(event.corte, locale)}
            dressCode={event.dressCode}
            gifts={event.gifts}
            gallery={event.gallery}
            countdown={countdown}
            mapQuery={mapQuery}
            whatsappPhone={event.whatsappPhone || event.contactPhone}
            rsvp={
              <QuinceRsvp
                event={event}
                locale={locale}
                seatsTaken={seatsTaken}
                atCapacity={atCapacity}
                isPast={isPast}
                onRsvpSubmit={onRsvpSubmit}
              />
            }
          />
          <div className="qw-sticky-rsvp">
            <a href="#rsvp">{ui.rsvp}</a>
          </div>
          <a className="qw-print-link" href={printHref}>
            {ui.downloadPostcard}
          </a>
        </>
      ) : null}
    </div>
  );
}
