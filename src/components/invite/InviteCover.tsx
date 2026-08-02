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
  rsvpLabel: string;
  detailsLabel: string;
  calendarLabel: string;
  calendarHref: string;
  copyLabel: string;
  isPast?: boolean;
  onCopyLink: () => void;
  parallaxY?: number;
};

function Ornament({ layout }: { layout: InviteLayout }) {
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
  rsvpLabel,
  detailsLabel,
  calendarLabel,
  calendarHref,
  copyLabel,
  isPast = false,
  onCopyLink,
  parallaxY = 0,
}: InviteCoverProps) {
  const photoTop = layout === "arch" || layout === "party" || layout === "glam";

  return (
    <section
      className="invite-cover"
      data-layout={layout}
      aria-label="Invitation"
    >
      <div
        className="invite-cover-atmosphere"
        style={{ transform: `translateY(${parallaxY * 0.4}px)` } as CSSProperties}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImage} alt="" className="invite-cover-atmosphere-img" />
        <div className="invite-cover-atmosphere-veil" aria-hidden />
      </div>

      <div className="invite-cover-stage">
        <article className="invite-card fade-up fade-up-1">
          {photoTop ? (
            <div className="invite-card-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt="" />
            </div>
          ) : null}

          <div className="invite-card-body">
            <Ornament layout={layout} />

            <p className="invite-card-host">{hostName || title}</p>
            <p className="invite-card-invite-line">{invitesYou}</p>

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
