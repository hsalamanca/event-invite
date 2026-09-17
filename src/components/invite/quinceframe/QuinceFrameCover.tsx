import DateLine from "./DateLine";
import EventScript from "./EventScript";
import FloralCorner from "./FloralCorner";
import FooterSplit from "./FooterSplit";
import GoldHexFrame from "./GoldHexFrame";
import GownIllustration from "./GownIllustration";
import HonoreeName from "./HonoreeName";
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
}: {
  copy: QuinceFrameCopy;
  printMode?: boolean;
  rsvpHref: string;
  rsvpLabel: string;
  inviteUrl?: string;
  qrUrl?: string;
}) {
  return (
    <div className="quinceframe-card">
      <div className="quinceframe-sparkle" aria-hidden />
      <GoldHexFrame />
      <FloralCorner corner="tl" />
      <FloralCorner corner="tr" />
      <FloralCorner corner="bl" />
      <FloralCorner corner="br" />
      <div className="quinceframe-body">
        <TiaraMark />
        <HostLine>{copy.hostLine}</HostLine>
        <EventScript>{copy.eventScript}</EventScript>
        <RelationLine>{copy.relationLine}</RelationLine>
        <HonoreeName>{copy.honoreeName}</HonoreeName>
        <DateLine>{copy.dateLine}</DateLine>
        <MassLine label={copy.massLabel} detail={copy.massDetail} />
        <FooterSplit
          lunch={
            <LunchBlock label={copy.lunchLabel} detail={copy.lunchDetail} />
          }
          gown={<GownIllustration />}
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
