"use client";

import type { CSSProperties } from "react";
import type { InviteLayout } from "@/lib/templates";

type InviteCoverProps = {
  layout: InviteLayout;
  hostName: string;
  title: string;
  headline: string;
  tagline: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  address: string;
  heroImage: string;
  invitesYou: string;
  comicPresents?: string;
  festiveParty?: string;
  toyPartyInvite?: string;
  modernCelebrate?: string;
  arcadePlayer?: string;
  quinceInvite?: string;
  fiftyCelebrate?: string;
  rsvpLabel: string;
  detailsLabel: string;
  calendarLabel: string;
  calendarHref: string;
  copyLabel: string;
  isPast?: boolean;
  onCopyLink: () => void;
  parallaxY?: number;
};

function BalloonGarland() {
  const balloons = [
    { c: "#FF4D8D", x: 8, y: 18, s: 1 },
    { c: "#FFD23F", x: 22, y: 10, s: 1.1 },
    { c: "#4D96FF", x: 36, y: 16, s: 0.95 },
    { c: "#7CFFB2", x: 50, y: 8, s: 1.05 },
    { c: "#C77DFF", x: 64, y: 15, s: 1 },
    { c: "#FF8A3D", x: 78, y: 9, s: 1.08 },
    { c: "#FF6B9D", x: 92, y: 17, s: 0.92 },
  ];
  return (
    <svg
      className="festive-garland"
      viewBox="0 0 100 40"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M4 22 C 20 8, 40 30, 50 14 S 80 6, 96 20"
        fill="none"
        stroke="#2A1848"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.35"
      />
      {balloons.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          <g className={`festive-balloon festive-balloon--${i}`}>
            <ellipse cx="0" cy="0" rx="5.2" ry="6.4" fill={b.c} />
            <ellipse
              cx="-1.6"
              cy="-2"
              rx="1.4"
              ry="2"
              fill="white"
              opacity="0.35"
            />
            <path
              d="M0 6.2 L0 12"
              stroke="#2A1848"
              strokeWidth="0.55"
              opacity="0.4"
            />
            <path
              d="M-1.2 6.4 Q0 7.6 1.2 6.4"
              fill="none"
              stroke="#2A1848"
              strokeWidth="0.55"
              opacity="0.35"
            />
          </g>
        </g>
      ))}
    </svg>
  );
}

function ArcadeStickers() {
  return (
    <>
      <span className="arcade-badge arcade-badge--1up" aria-hidden>
        1UP
      </span>
      <svg
        className="arcade-sticker arcade-sticker--pad"
        viewBox="0 0 64 48"
        aria-hidden
      >
        <rect
          x="4"
          y="10"
          width="56"
          height="28"
          rx="10"
          fill="#FF3D9A"
          stroke="#1A0A3C"
          strokeWidth="2.5"
        />
        <circle cx="20" cy="24" r="7" fill="#FFF8FF" stroke="#1A0A3C" strokeWidth="2" />
        <path
          d="M20 19.5v9M15.5 24h9"
          stroke="#1A0A3C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="42" cy="20" r="3.2" fill="#39FF14" stroke="#1A0A3C" strokeWidth="1.5" />
        <circle cx="50" cy="26" r="3.2" fill="#00E5FF" stroke="#1A0A3C" strokeWidth="1.5" />
      </svg>
      <span className="arcade-badge arcade-badge--start" aria-hidden>
        START
      </span>
    </>
  );
}

function ToyStickers() {
  return (
    <>
      <svg
        className="toy-sticker toy-sticker--block"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <rect
          x="6"
          y="10"
          width="36"
          height="32"
          rx="5"
          fill="#FFD400"
          stroke="#1C3A6E"
          strokeWidth="2.2"
        />
        <rect x="12" y="16" width="10" height="10" rx="2" fill="#2F6FE0" />
        <rect x="26" y="16" width="10" height="10" rx="2" fill="#FFFDF7" />
        <rect x="12" y="28" width="10" height="10" rx="2" fill="#FFFDF7" />
        <rect x="26" y="28" width="10" height="10" rx="2" fill="#2F6FE0" />
      </svg>
      <svg
        className="toy-sticker toy-sticker--star"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <path
          d="M24 5l5.4 11 12.1 1.8-8.8 8.5 2.1 12.1L24 32.6 13.2 38.4l2.1-12.1-8.8-8.5 12.1-1.8z"
          fill="#FFD400"
          stroke="#1C3A6E"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="toy-sticker toy-sticker--ball"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="#2F6FE0"
          stroke="#1C3A6E"
          strokeWidth="2.2"
        />
        <path
          d="M10 20c5 2 8 2 14 0s9-2 14 0M10 28c5-2 8-2 14 0s9 2 14 0M24 8c-1 8-1 16 0 32"
          fill="none"
          stroke="#FFD400"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

function Ornament({ layout }: { layout: InviteLayout }) {
  if (layout === "comic") {
    return (
      <div className="invite-ornament invite-ornament--comic" aria-hidden>
        <span className="comic-burst">POW!</span>
      </div>
    );
  }
  if (layout === "festive") {
    return (
      <div className="invite-ornament invite-ornament--festive" aria-hidden>
        <span className="festive-dot" style={{ background: "#FF4D8D" }} />
        <span className="festive-dot" style={{ background: "#FFD23F" }} />
        <span className="festive-dot" style={{ background: "#4D96FF" }} />
        <span className="festive-dot" style={{ background: "#7CFFB2" }} />
        <span className="festive-dot" style={{ background: "#C77DFF" }} />
      </div>
    );
  }
  if (layout === "toybox") {
    return (
      <div className="invite-ornament invite-ornament--toybox" aria-hidden>
        <span className="toy-pip" style={{ background: "#2F6FE0" }} />
        <span className="toy-pip toy-pip--square" style={{ background: "#FFD400" }} />
        <span className="toy-pip" style={{ background: "#2F6FE0" }} />
        <span className="toy-pip toy-pip--square" style={{ background: "#FFD400" }} />
        <span className="toy-pip" style={{ background: "#2F6FE0" }} />
      </div>
    );
  }
  if (layout === "azure") {
    return (
      <svg
        className="invite-ornament invite-ornament--azure"
        viewBox="0 0 140 28"
        aria-hidden
      >
        <path
          d="M10 18c18-14 42-14 60 0"
          fill="none"
          stroke="#2B6FFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M70 18c18-14 42-14 60 0"
          fill="none"
          stroke="#7EC8FF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="70" cy="10" r="3.2" fill="#2B6FFF" />
      </svg>
    );
  }
  if (layout === "quince") {
    return (
      <svg
        className="invite-ornament invite-ornament--quince"
        viewBox="0 0 140 28"
        aria-hidden
      >
        <path
          d="M8 16c20-12 40-12 54 0"
          fill="none"
          stroke="#2B6FFF"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M78 16c14-12 34-12 54 0"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M70 4l1.6 4.8H76l-3.8 2.8 1.5 4.7L70 13.8l-3.7 2.7 1.5-4.7-3.8-2.8h4.4z"
          fill="#D4AF37"
        />
      </svg>
    );
  }
  if (layout === "fifty") {
    return (
      <svg
        className="invite-ornament invite-ornament--fifty"
        viewBox="0 0 160 28"
        aria-hidden
      >
        <path d="M8 14h40M112 14h40" stroke="#E8A317" strokeWidth="1.4" />
        <path
          d="M58 14h10M92 14h10"
          stroke="#FF7A59"
          strokeWidth="1.2"
          opacity="0.85"
        />
        <path
          d="M80 3l1.8 5.2H87l-4.2 3.1 1.6 5.1L80 13.4l-4.4 2.9 1.6-5.1-4.2-3.1h5.2z"
          fill="#E8A317"
        />
      </svg>
    );
  }
  if (layout === "arcade") {
    return (
      <div className="invite-ornament invite-ornament--arcade" aria-hidden>
        <span className="arcade-pixel" style={{ background: "#FF3D9A" }} />
        <span className="arcade-pixel" style={{ background: "#39FF14" }} />
        <span className="arcade-pixel" style={{ background: "#00E5FF" }} />
        <span className="arcade-pixel" style={{ background: "#FFE600" }} />
        <span className="arcade-pixel" style={{ background: "#FF3D9A" }} />
      </div>
    );
  }
  if (layout === "script" || layout === "botanical") {
    return (
      <svg className="invite-ornament" viewBox="0 0 120 24" aria-hidden>
        <path
          d="M2 12c18-10 28 10 46 0s28 10 46 0 16-8 24 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="60" cy="12" r="2.2" fill="currentColor" />
      </svg>
    );
  }
  if (layout === "foil" || layout === "glam" || layout === "classic") {
    return (
      <svg className="invite-ornament" viewBox="0 0 120 18" aria-hidden>
        <path d="M8 9h40M72 9h40" stroke="currentColor" strokeWidth="1" />
        <path
          d="M60 2l1.4 4.2H66l-3.5 2.6 1.3 4.2L60 10.4l-3.8 2.6 1.3-4.2-3.5-2.6h4.6z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (layout === "coastal") {
    return (
      <svg className="invite-ornament" viewBox="0 0 120 20" aria-hidden>
        <path
          d="M0 12c10-8 20 8 30 0s20 8 30 0 20 8 30 0 20 8 30 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    );
  }
  if (layout === "fiesta") {
    return (
      <svg className="invite-ornament" viewBox="0 0 120 22" aria-hidden>
        <path d="M10 11h28M82 11h28" stroke="currentColor" strokeWidth="1.5" />
        <rect
          x="52"
          y="4"
          width="16"
          height="16"
          transform="rotate(45 60 12)"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (layout === "party") {
    return (
      <div className="invite-ornament invite-ornament--dots" aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }
  return (
    <div className="invite-ornament invite-ornament--line" aria-hidden />
  );
}

export default function InviteCover({
  layout,
  hostName,
  title,
  headline,
  tagline,
  dateLabel,
  timeLabel,
  venue,
  address,
  heroImage,
  invitesYou,
  comicPresents,
  festiveParty,
  toyPartyInvite,
  modernCelebrate,
  arcadePlayer,
  quinceInvite,
  fiftyCelebrate,
  rsvpLabel,
  detailsLabel,
  calendarLabel,
  calendarHref,
  copyLabel,
  isPast = false,
  onCopyLink,
  parallaxY = 0,
}: InviteCoverProps) {
  const photoTop =
    layout === "arch" ||
    layout === "party" ||
    layout === "glam" ||
    layout === "comic" ||
    layout === "festive" ||
    layout === "toybox" ||
    layout === "azure" ||
    layout === "arcade" ||
    layout === "quince" ||
    layout === "fifty";
  const isComic = layout === "comic";
  const isFestive = layout === "festive";
  const isToybox = layout === "toybox";
  const isAzure = layout === "azure";
  const isArcade = layout === "arcade";
  const isQuince = layout === "quince";
  const isFifty = layout === "fifty";

  const inviteLine = isComic
    ? comicPresents || invitesYou
    : isFestive
      ? festiveParty || invitesYou
      : isToybox
        ? toyPartyInvite || invitesYou
        : isAzure
          ? modernCelebrate || invitesYou
          : isArcade
            ? arcadePlayer || invitesYou
            : isQuince
              ? quinceInvite || invitesYou
              : isFifty
                ? fiftyCelebrate || invitesYou
                : invitesYou;

  return (
    <section
      className="invite-cover"
      data-layout={layout}
      aria-label="Invitation"
    >
      <div
        className="invite-cover-atmosphere"
        style={
          { transform: `translateY(${parallaxY * 0.4}px)` } as CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImage} alt="" className="invite-cover-atmosphere-img" />
        <div className="invite-cover-atmosphere-veil" aria-hidden />
      </div>

      {isComic ? <div className="comic-halftone" aria-hidden /> : null}
      {isFestive ? <div className="festive-confetti" aria-hidden /> : null}
      {isToybox ? <div className="toybox-dots" aria-hidden /> : null}
      {isAzure || isQuince ? <div className="azure-glow" aria-hidden /> : null}
      {isFifty ? <div className="fifty-sparkle" aria-hidden /> : null}
      {isArcade ? <div className="arcade-scanlines" aria-hidden /> : null}

      <div className="invite-cover-stage">
        <article className="invite-card fade-up fade-up-1">
          {isComic ? (
            <>
              <span className="comic-sticker comic-sticker--tl" aria-hidden>
                BAM!
              </span>
              <span className="comic-sticker comic-sticker--tr" aria-hidden>
                ZAP!
              </span>
            </>
          ) : null}

          {isToybox ? <ToyStickers /> : null}
          {isArcade ? <ArcadeStickers /> : null}

          {isAzure ? (
            <>
              <span className="azure-ring azure-ring--tl" aria-hidden />
              <span className="azure-ring azure-ring--br" aria-hidden />
            </>
          ) : null}

          {isQuince ? (
            <>
              <span className="quince-ring quince-ring--tl" aria-hidden />
              <span className="quince-ring quince-ring--br" aria-hidden />
              <span className="quince-xv" aria-hidden>
                XV
              </span>
            </>
          ) : null}

          {isFifty ? (
            <>
              <span className="fifty-corner fifty-corner--tl" aria-hidden />
              <span className="fifty-corner fifty-corner--tr" aria-hidden />
              <span className="fifty-corner fifty-corner--bl" aria-hidden />
              <span className="fifty-corner fifty-corner--br" aria-hidden />
              <span className="fifty-badge" aria-hidden>
                50
              </span>
            </>
          ) : null}

          {isFestive ? (
            <div className="festive-garland-wrap" aria-hidden>
              <BalloonGarland />
            </div>
          ) : null}

          {photoTop ? (
            <div className="invite-card-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt="" />
            </div>
          ) : null}

          <div className="invite-card-body">
            <Ornament layout={layout} />

            <p className="invite-card-host">{hostName || title}</p>
            <p className="invite-card-invite-line">{inviteLine}</p>

            <h1 className="invite-card-headline">{headline}</h1>

            <Ornament layout={layout} />

            <div className="invite-card-when">
              <p className="invite-card-date">{dateLabel}</p>
              <p className="invite-card-time">{timeLabel}</p>
              <p className="invite-card-venue">{venue}</p>
              <p className="invite-card-address">{address}</p>
            </div>

            {!photoTop ? (
              <div className="invite-card-photo invite-card-photo--inset">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="" />
              </div>
            ) : null}

            <p className="invite-card-tagline">{tagline}</p>

            <div className="invite-card-actions">
              {isPast ? (
                <a className="btn-primary" href="#guestbook">
                  Leave a note
                </a>
              ) : (
                <a className="btn-primary" href="#rsvp">
                  {rsvpLabel}
                </a>
              )}
              <a className="btn-ghost" href="#details">
                {detailsLabel}
              </a>
            </div>

            <div className="invite-card-share">
              <a className="invite-text-link" href={calendarHref}>
                {calendarLabel}
              </a>
              <button
                type="button"
                className="invite-text-link"
                onClick={onCopyLink}
              >
                {copyLabel}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
