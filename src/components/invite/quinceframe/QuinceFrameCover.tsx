import DateLine from "./DateLine";
import EventScript from "./EventScript";
import FloralCorner from "./FloralCorner";
import FooterSplit from "./FooterSplit";
import GoldOrnament from "./GoldOrnament";
import HonoreeName from "./HonoreeName";
import HonoreePortrait from "./HonoreePortrait";
import HostLine from "./HostLine";
import LunchBlock from "./LunchBlock";
import MassLine from "./MassLine";
import RelationLine from "./RelationLine";
import RsvpBlock from "./RsvpBlock";
import TiaraMark from "./TiaraMark";
import type { QuinceFrameCopy } from "./copy";
import "./quinceframe.css";

export default function QuinceFrameCover({
  copy,
  printMode = false,
  rsvpHref,
  rsvpLabel,
  inviteUrl,
  qrUrl,
  denseFlorals = false,
  honoreePhotoUrl,
  honoreePhotoAlt,
}: {
  copy: QuinceFrameCopy;
  printMode?: boolean;
  rsvpHref: string;
  rsvpLabel: string;
  inviteUrl?: string;
  qrUrl?: string;
  /** Optional TR/BL florals. Default is Hugo/art-dir TL+BR only. */
  denseFlorals?: boolean;
  honoreePhotoUrl?: string;
  honoreePhotoAlt?: string;
}) {
  return (
    <div className="quinceframe-card">
      <div className="quinceframe-grain" aria-hidden />
      <div className="quinceframe-sparkle" aria-hidden />
      {printMode ? null : (
        <div className="quinceframe-foil print-hidden" aria-hidden />
      )}
      <FloralCorner corner="tl" />
      {denseFlorals ? <FloralCorner corner="tr" /> : null}
      {denseFlorals ? <FloralCorner corner="bl" /> : null}
      <FloralCorner corner="br" />
      <div className="quinceframe-body">
        <TiaraMark />
        <HostLine>{copy.hostLine}</HostLine>
        <EventScript>{copy.eventScript}</EventScript>
        <RelationLine>{copy.relationLine}</RelationLine>
        <HonoreeName>{copy.honoreeName}</HonoreeName>
        <DateLine>{copy.dateLine}</DateLine>
        <MassLine label={copy.massLabel} detail={copy.massDetail} />
        <GoldOrnament />
        <FooterSplit
          lunch={
            <LunchBlock label={copy.lunchLabel} detail={copy.lunchDetail} />
          }
          gown={
            <HonoreePortrait
              photoUrl={honoreePhotoUrl}
              honoreeName={copy.honoreeName}
              photoAlt={honoreePhotoAlt}
            />
          }
          rsvp={
            <RsvpBlock
              header={copy.rsvpHeader}
              detail={copy.rsvpDetail}
              ctaLabel={rsvpLabel}
              href={rsvpHref}
              printMode={printMode}
              inviteUrl={inviteUrl}
              qrUrl={qrUrl}
            />
          }
        />
      </div>
    </div>
  );
}
