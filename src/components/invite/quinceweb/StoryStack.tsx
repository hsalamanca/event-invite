import type { ReactNode } from "react";
import {
  filledPartyRoles,
  mapsSearchUrl,
  venueBlockHasContent,
  whatsappHref,
} from "@/lib/quince-fields";
import { safeInviteImageUrl } from "@/lib/safe-image-url";
import type { QuincePartyRole, QuinceVenueBlock } from "@/lib/types";

function Section({
  id,
  kicker,
  children,
}: {
  id: string;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="qw-section">
      <p className="qw-kicker">{kicker}</p>
      {children}
    </section>
  );
}

function RoleList({ items }: { items: QuincePartyRole[] }) {
  const rows = filledPartyRoles(items);
  if (rows.length === 0) return null;
  return (
    <ul className="qw-role-list">
      {rows.map((row) => (
        <li key={row.id || `${row.role}-${row.name}`}>
          {row.role ? <span className="qw-role">{row.role}</span> : null}
          <span className="qw-role-name">{row.name}</span>
        </li>
      ))}
    </ul>
  );
}

function VenueCard({
  block,
  mapLabel,
}: {
  block?: QuinceVenueBlock;
  mapLabel: string;
}) {
  if (!venueBlockHasContent(block)) return null;
  const query = [block!.place, block!.address].filter(Boolean).join(", ");
  return (
    <div className="qw-venue">
      {block!.place ? <p className="qw-venue-place">{block!.place}</p> : null}
      {block!.address ? (
        <p className="qw-venue-address">{block!.address}</p>
      ) : null}
      {block!.time ? <p className="qw-venue-time">{block!.time}</p> : null}
      {query ? (
        <p style={{ margin: "0.85rem 0 0" }}>
          <a
            className="qw-cta-link"
            href={mapsSearchUrl(query)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {mapLabel}
          </a>
        </p>
      ) : null}
    </div>
  );
}

export default function StoryStack({
  labels,
  parentsLine,
  padrinos,
  misa,
  recepcion,
  corte,
  dressCode,
  gifts,
  gallery,
  countdown,
  mapQuery,
  whatsappPhone,
  rsvp,
}: {
  labels: {
    padres: string;
    padrinos: string;
    misa: string;
    recepcion: string;
    corte: string;
    vestimenta: string;
    regalos: string;
    gallery: string;
    countdown: string;
    days: string;
    hours: string;
    minutes: string;
    mapa: string;
    openMap: string;
    whatsapp: string;
    rsvp: string;
  };
  parentsLine?: string;
  padrinos?: QuincePartyRole[];
  misa?: QuinceVenueBlock;
  recepcion?: QuinceVenueBlock;
  corte?: QuincePartyRole[];
  dressCode?: string;
  gifts?: string;
  gallery?: string[];
  countdown: { days: number; hours: number; minutes: number } | null;
  mapQuery?: string;
  whatsappPhone?: string;
  rsvp: ReactNode;
}) {
  const photos = (gallery ?? [])
    .map((src) => safeInviteImageUrl(src))
    .filter((src): src is string => Boolean(src));
  const wa = whatsappPhone ? whatsappHref(whatsappPhone) : null;
  const hasPadrinos = filledPartyRoles(padrinos ?? []).length > 0;
  const hasCorte = filledPartyRoles(corte ?? []).length > 0;

  return (
    <div className="qw-stack">
      {parentsLine?.trim() ? (
        <Section id="padres" kicker={labels.padres}>
          <p className="qw-body">{parentsLine}</p>
        </Section>
      ) : null}

      {hasPadrinos ? (
        <Section id="padrinos" kicker={labels.padrinos}>
          <RoleList items={padrinos ?? []} />
        </Section>
      ) : null}

      {venueBlockHasContent(misa) ? (
        <Section id="misa" kicker={labels.misa}>
          <VenueCard block={misa} mapLabel={labels.openMap} />
        </Section>
      ) : null}

      {venueBlockHasContent(recepcion) ? (
        <Section id="recepcion" kicker={labels.recepcion}>
          <VenueCard block={recepcion} mapLabel={labels.openMap} />
        </Section>
      ) : null}

      {hasCorte ? (
        <Section id="corte" kicker={labels.corte}>
          <RoleList items={corte ?? []} />
        </Section>
      ) : null}

      {dressCode?.trim() ? (
        <Section id="vestimenta" kicker={labels.vestimenta}>
          <p className="qw-body">{dressCode}</p>
        </Section>
      ) : null}

      {gifts?.trim() ? (
        <Section id="regalos" kicker={labels.regalos}>
          <p className="qw-body">{gifts}</p>
        </Section>
      ) : null}

      {photos.length > 0 ? (
        <Section id="gallery" kicker={labels.gallery}>
          <div className="qw-gallery">
            {photos.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" />
            ))}
          </div>
        </Section>
      ) : null}

      {countdown ? (
        <Section id="countdown" kicker={labels.countdown}>
          <div className="qw-countdown">
            <div className="qw-count-cell">
              <span className="qw-count-num">{countdown.days}</span>
              <span className="qw-count-label">{labels.days}</span>
            </div>
            <div className="qw-count-cell">
              <span className="qw-count-num">{countdown.hours}</span>
              <span className="qw-count-label">{labels.hours}</span>
            </div>
            <div className="qw-count-cell">
              <span className="qw-count-num">{countdown.minutes}</span>
              <span className="qw-count-label">{labels.minutes}</span>
            </div>
          </div>
        </Section>
      ) : null}

      {mapQuery ? (
        <Section id="mapa" kicker={labels.mapa}>
          <a
            className="qw-cta-link"
            href={mapsSearchUrl(mapQuery)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {labels.openMap}
          </a>
        </Section>
      ) : null}

      {wa ? (
        <Section id="whatsapp" kicker={labels.whatsapp}>
          <a className="qw-cta-link" href={wa} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </Section>
      ) : null}

      <section id="rsvp" className="qw-section qw-rsvp">
        <p className="qw-kicker">{labels.rsvp}</p>
        {rsvp}
      </section>
    </div>
  );
}
