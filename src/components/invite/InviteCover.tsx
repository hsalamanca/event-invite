"use client";

import type { CSSProperties } from "react";
import { sanitizeAboutHtml } from "@/lib/sanitize-about";
import type { InviteLayout } from "@/lib/templates";

type InviteCoverProps = {
  layout: InviteLayout;
  templateId?: string;
  hostName: string;
  title: string;
  headline: string;
  tagline: string;
  dateLabel: string;
  weekdayLabel?: string;
  dateShortLabel?: string;
  timeLabel: string;
  venue: string;
  address: string;
  heroImage: string;
  heroVideoUrl?: string | null;
  motionKit?: "none" | "sparkle" | "float" | "parallax" | "pulse";
  contactPhone?: string;
  invitesYou: string;
  comicPresents?: string;
  superYouAreInvited?: string;
  superIsTurning?: string;
  superJoinUs?: string;
  superBirthday?: string;
  spiderLetsCelebrate?: string;
  festiveParty?: string;
  toyPartyInvite?: string;
  modernCelebrate?: string;
  arcadePlayer?: string;
  quinceInvite?: string;
  fiftyCelebrate?: string;
  splashInvite?: string;
  collageInvite?: string;
  balloonDigits?: string | null;
  rsvpLabel: string;
  detailsLabel: string;
  leaveNoteLabel?: string;
  rsvpEnabled?: boolean;
  calendarLabel: string;
  calendarHref: string;
  copyLabel: string;
  postcardLabel?: string;
  postcardHref?: string;
  /** Hide interactive CTAs; show QR/URL for printable downloads */
  printMode?: boolean;
  inviteUrl?: string;
  qrUrl?: string;
  isPast?: boolean;
  onCopyLink: () => void;
  parallaxY?: number;
};

function SuperBurstBalloons() {
  return (
    <svg className="superburst-balloons" viewBox="0 0 320 220" aria-hidden>
      {/* left cluster */}
      <g transform="translate(18 40)">
        <ellipse cx="28" cy="48" rx="22" ry="28" fill="#E10600" stroke="#111" strokeWidth="3" />
        <path d="M28 76 L28 118" stroke="#111" strokeWidth="2" />
        <path d="M10 30 Q4 55 18 70" fill="none" stroke="#FFD400" strokeWidth="4" />
        <ellipse cx="58" cy="30" rx="18" ry="24" fill="#FFD400" stroke="#111" strokeWidth="3" />
        <path d="M58 54 L52 100" stroke="#111" strokeWidth="2" />
        <path d="M48 18 Q42 34 52 44" fill="none" stroke="#E10600" strokeWidth="3" />
      </g>
      {/* right cluster */}
      <g transform="translate(230 36)">
        <ellipse cx="40" cy="42" rx="20" ry="26" fill="#FFD400" stroke="#111" strokeWidth="3" />
        <path d="M40 68 L48 112" stroke="#111" strokeWidth="2" />
        <path d="M28 24 Q22 40 32 52" fill="none" stroke="#E10600" strokeWidth="3" />
        <ellipse cx="68" cy="58" rx="18" ry="24" fill="#E10600" stroke="#111" strokeWidth="3" />
        <path d="M68 82 L62 120" stroke="#111" strokeWidth="2" />
        <path d="M58 42 Q70 54 62 68" fill="none" stroke="#FFD400" strokeWidth="3" />
      </g>
      {/* bolts */}
      <path d="M118 28 L132 52 L122 52 L140 88" fill="#FFD400" stroke="#111" strokeWidth="2" />
      <path d="M198 20 L186 46 L196 46 L176 78" fill="#FFD400" stroke="#111" strokeWidth="2" />
    </svg>
  );
}

function SuperCitySkyline() {
  return (
    <svg className="superburst-skyline" viewBox="0 0 400 56" aria-hidden preserveAspectRatio="none">
      <path
        fill="#111"
        d="M0 56V34h18V18h10v8h14V10h12v24h16V22h10v14h20V8h14v20h12V16h18v20h10V28h16v12h14V20h12v16h20V12h10v24h16V30h14v26z"
      />
    </svg>
  );
}

function possessiveName(name: string): string {
  const trimmed = name.trim() || "Guest";
  const upper = trimmed.toUpperCase();
  if (/[S]$/i.test(trimmed)) return `${upper}'`;
  return `${upper}'S`;
}

function SpiderSilhouette() {
  return (
    <svg className="spider-icon" viewBox="0 0 120 140" aria-hidden>
      <ellipse cx="60" cy="58" rx="22" ry="26" fill="#111" />
      <circle cx="60" cy="36" r="14" fill="#111" />
      <path
        d="M38 48 C10 30 4 18 8 8 M38 58 C8 58 2 70 6 86 M40 70 C14 86 10 104 16 118 M82 48 C110 30 116 18 112 8 M82 58 C112 58 118 70 114 86 M80 70 C106 86 110 104 104 118"
        fill="none"
        stroke="#111"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="54" cy="34" r="2.2" fill="#fff" />
      <circle cx="66" cy="34" r="2.2" fill="#fff" />
    </svg>
  );
}

function SpiderWebBehind() {
  return (
    <svg
      className="spider-photo-web"
      viewBox="0 0 200 200"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        fill="none"
        stroke="#111"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      >
        <circle cx="100" cy="100" r="18" />
        <circle cx="100" cy="100" r="36" />
        <circle cx="100" cy="100" r="54" />
        <circle cx="100" cy="100" r="72" />
        <circle cx="100" cy="100" r="90" />
        <path d="M100 10 L100 190 M10 100 L190 100 M28 28 L172 172 M172 28 L28 172" />
        <path d="M100 10 L172 28 L190 100 L172 172 L100 190 L28 172 L10 100 L28 28 Z" />
      </g>
    </svg>
  );
}

function SpiderCitySmoke() {
  return (
    <svg className="spider-smoke" viewBox="0 0 160 70" aria-hidden>
      <ellipse cx="40" cy="48" rx="28" ry="16" fill="#f2f2f2" />
      <ellipse cx="70" cy="42" rx="24" ry="18" fill="#e4e4e4" />
      <ellipse cx="105" cy="50" rx="30" ry="16" fill="#f7f7f7" />
      <ellipse cx="130" cy="44" rx="18" ry="12" fill="#ddd" />
    </svg>
  );
}

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

function SplashStickers() {
  return (
    <>
      <svg
        className="splash-sticker splash-sticker--balloon"
        viewBox="0 0 48 64"
        aria-hidden
      >
        <ellipse
          cx="24"
          cy="24"
          rx="16"
          ry="20"
          fill="#E53935"
          stroke="#1A2744"
          strokeWidth="2.2"
        />
        <path
          d="M24 43v14M20 57h8"
          stroke="#1A2744"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse cx="18" cy="16" rx="4" ry="6" fill="#FFD54F" opacity="0.55" />
      </svg>
      <svg
        className="splash-sticker splash-sticker--star"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <path
          d="M24 5l5.4 11 12.1 1.8-8.8 8.5 2.1 12.1L24 32.6 13.2 38.4l2.1-12.1-8.8-8.5 12.1-1.8z"
          fill="#FFD54F"
          stroke="#1A2744"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="splash-sticker splash-sticker--dot"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <circle
          cx="24"
          cy="24"
          r="15"
          fill="#4FC3F7"
          stroke="#1A2744"
          strokeWidth="2.2"
        />
        <circle cx="18" cy="18" r="4" fill="#FFF6EB" opacity="0.7" />
      </svg>
    </>
  );
}

function CollageStickers() {
  return (
    <>
      <svg
        className="collage-sticker collage-sticker--banner"
        viewBox="0 0 140 40"
        aria-hidden
      >
        <path
          d="M6 10 C 40 4, 90 16, 134 8"
          fill="none"
          stroke="#1A1A1A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {[
          { x: 14, fill: "#F9A8D4" },
          { x: 36, fill: "#111111" },
          { x: 58, fill: "#F472B6" },
          { x: 80, fill: "#111111" },
          { x: 102, fill: "#FDA4AF" },
        ].map((f, i) => (
          <path
            key={i}
            d={`M${f.x} 10 L${f.x + 18} 10 L${f.x + 9} 34 Z`}
            fill={f.fill}
            stroke="#1A1A1A"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      <svg
        className="collage-sticker collage-sticker--cake"
        viewBox="0 0 64 72"
        aria-hidden
      >
        {/* flame */}
        <ellipse cx="32" cy="8" rx="4" ry="5.5" fill="#F472B6" stroke="#1A1A1A" strokeWidth="1.4" />
        <ellipse cx="32" cy="9" rx="1.6" ry="2.4" fill="#FDA4AF" />
        {/* candle */}
        <rect x="29.5" y="12" width="5" height="14" rx="1.2" fill="#FFF7ED" stroke="#1A1A1A" strokeWidth="1.4" />
        {/* heart topper */}
        <path
          d="M44 10c0-2.4 1.8-4 4-4 1.4 0 2.6.8 3.2 1.8C52 6.8 53.2 6 54.6 6c2.2 0 4 1.6 4 4 0 4.4-7.2 8.2-7.2 8.2S44 14.4 44 10z"
          fill="#F472B6"
          stroke="#1A1A1A"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        {/* frosting dome */}
        <path
          d="M12 34c0-10 9-16 20-16s20 6 20 16"
          fill="#FFF1F7"
          stroke="#1A1A1A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 34c4.5-4.5 8-4.5 12.5 0S35 38.5 39.5 34 48 29.5 52 34"
          fill="none"
          stroke="#EC4899"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* cake body */}
        <rect
          x="10"
          y="34"
          width="44"
          height="24"
          rx="3"
          fill="#F9A8D4"
          stroke="#1A1A1A"
          strokeWidth="1.8"
        />
        <path
          d="M16 42h32M20 50h24"
          stroke="#1A1A1A"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.45"
        />
        {/* plate */}
        <path
          d="M8 58h48"
          stroke="#1A1A1A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse cx="32" cy="62" rx="22" ry="3.5" fill="#1A1A1A" opacity="0.08" />
      </svg>

      <svg
        className="collage-sticker collage-sticker--star collage-sticker--star-a"
        viewBox="0 0 32 32"
        aria-hidden
      >
        <path
          d="M16 2l3.2 8.4H28l-7.2 5.4 2.8 8.6L16 19.8 8.4 24.4l2.8-8.6L4 10.4h8.8z"
          fill="#F472B6"
          stroke="#1A1A1A"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="collage-sticker collage-sticker--star collage-sticker--star-b"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          d="M12 2l2.2 5.8H20l-4.6 3.6 1.8 5.8L12 14.2 6.8 17.2l1.8-5.8L4 7.8h5.8z"
          fill="#FDA4AF"
          stroke="#1A1A1A"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="collage-sticker collage-sticker--star collage-sticker--star-c"
        viewBox="0 0 20 20"
        aria-hidden
      >
        <path
          d="M10 1.5l1.8 4.8H17l-3.8 3 1.5 4.8L10 11.6 5.3 14.1l1.5-4.8L3 6.3h5.2z"
          fill="#111"
          stroke="#1A1A1A"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="collage-sticker collage-sticker--lips"
        viewBox="0 0 48 32"
        aria-hidden
      >
        <path
          d="M6 16c4-8 12-10 18-4 6-6 14-4 18 4-3 8-10 12-18 12S9 24 6 16z"
          fill="#F472B6"
          stroke="#1A1A1A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M10 16c3.5 2 8 3 14 3s10.5-1 14-3"
          fill="none"
          stroke="#1A1A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <span className="collage-sticker collage-sticker--dot collage-sticker--dot-a" aria-hidden />
      <span className="collage-sticker collage-sticker--dot collage-sticker--dot-b" aria-hidden />
      <span className="collage-sticker collage-sticker--dot collage-sticker--dot-c" aria-hidden />
      <span className="collage-sticker collage-sticker--dot collage-sticker--dot-d" aria-hidden />
      <span className="collage-sticker collage-sticker--dot collage-sticker--dot-e" aria-hidden />
      <span className="collage-sticker collage-sticker--confetti collage-sticker--confetti-a" aria-hidden />
      <span className="collage-sticker collage-sticker--confetti collage-sticker--confetti-b" aria-hidden />
      <span className="collage-sticker collage-sticker--confetti collage-sticker--confetti-c" aria-hidden />
    </>
  );
}

function CollageDiscoBall() {
  return (
    <svg
      className="collage-sticker collage-sticker--disco"
      viewBox="0 0 64 64"
      aria-hidden
    >
      <defs>
        <radialGradient id="collageDiscoShine" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#D4D4D8" />
          <stop offset="100%" stopColor="#71717A" />
        </radialGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="url(#collageDiscoShine)"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4].map((col) => {
          const x = 16 + col * 7;
          const y = 16 + row * 7;
          const inCircle = (x - 32) ** 2 + (y - 32) ** 2 < 17 ** 2;
          if (!inCircle) return null;
          return (
            <rect
              key={`${row}-${col}`}
              x={x}
              y={y}
              width="5.2"
              height="5.2"
              rx="0.6"
              fill={
                (row + col) % 3 === 0
                  ? "#F9A8D4"
                  : (row + col) % 2 === 0
                    ? "#FAFAFA"
                    : "#A1A1AA"
              }
              stroke="#1A1A1A"
              strokeWidth="0.55"
              opacity="0.9"
            />
          );
        }),
      )}
      <path
        d="M32 10 V4 M28 5 h8"
        stroke="#1A1A1A"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="24" cy="22" r="2.2" fill="#fff" opacity="0.75" />
    </svg>
  );
}

function normalizeBalloonDigits(raw?: string | null): string {
  const digits = String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 2);
  return digits || "20";
}

function CollageNumberBalloons({ digits }: { digits?: string | null }) {
  const value = normalizeBalloonDigits(digits);
  const chars = value.split("");
  const dual = chars.length > 1;
  const width = dual ? 90 : 52;
  const stringPaths = dual
    ? [
        "M28 58 C 28 72, 22 80, 18 86",
        "M58 58 C 58 72, 64 80, 70 86",
      ]
    : ["M26 58 C 26 72, 24 80, 22 86"];
  const offsets = dual ? [8, 40] : [6];

  return (
    <svg
      className="collage-sticker collage-sticker--balloons"
      viewBox={`0 0 ${width} 88`}
      aria-hidden
    >
      <defs>
        <linearGradient id="collageBalloonMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="40%" stopColor="#D4D4D8" />
          <stop offset="100%" stopColor="#71717A" />
        </linearGradient>
      </defs>
      {stringPaths.map((d, i) => (
        <path
          key={`string-${i}`}
          d={d}
          fill="none"
          stroke="#1A1A1A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ))}
      {chars.map((digit, i) => (
        <g key={`${digit}-${i}`} transform={`translate(${offsets[i] ?? 8} 4)`}>
          <rect
            x="4"
            y="6"
            width="34"
            height="50"
            rx="17"
            fill="url(#collageBalloonMetal)"
            stroke="#1A1A1A"
            strokeWidth="2"
          />
          <text
            x="21"
            y="42"
            textAnchor="middle"
            fontSize="34"
            fontWeight="700"
            fontFamily="Impact, Arial Black, sans-serif"
            fill="#1A1A1A"
          >
            {digit}
          </text>
          <ellipse cx="14" cy="18" rx="5" ry="8" fill="#fff" opacity="0.45" />
          <path
            d="M21 56 l-3 4 h6z"
            fill="#A1A1AA"
            stroke="#1A1A1A"
            strokeWidth="1.2"
          />
        </g>
      ))}
    </svg>
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
  if (layout === "superhero" || layout === "superburst" || layout === "spiderweb") {
    return null;
  }
  if (layout === "collage") {
    return (
      <div className="invite-ornament invite-ornament--collage" aria-hidden>
        <span className="collage-rule" />
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
  if (layout === "splash") {
    return (
      <div className="invite-ornament invite-ornament--splash" aria-hidden>
        <span className="splash-pip" style={{ background: "#E53935" }} />
        <span className="splash-pip splash-pip--diamond" style={{ background: "#FFD54F" }} />
        <span className="splash-pip" style={{ background: "#4FC3F7" }} />
        <span className="splash-pip splash-pip--diamond" style={{ background: "#E53935" }} />
        <span className="splash-pip" style={{ background: "#FFD54F" }} />
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
  templateId,
  hostName,
  title,
  headline,
  tagline,
  dateLabel,
  weekdayLabel,
  dateShortLabel,
  timeLabel,
  venue,
  address,
  heroImage,
  heroVideoUrl,
  motionKit = "none",
  invitesYou,
  comicPresents,
  superYouAreInvited,
  superIsTurning,
  superJoinUs,
  superBirthday,
  spiderLetsCelebrate,
  festiveParty,
  toyPartyInvite,
  modernCelebrate,
  arcadePlayer,
  quinceInvite,
  fiftyCelebrate,
  splashInvite,
  collageInvite,
  balloonDigits,
  contactPhone,
  rsvpLabel,
  detailsLabel,
  leaveNoteLabel = "Leave a note",
  rsvpEnabled = true,
  calendarLabel,
  calendarHref,
  copyLabel,
  postcardLabel,
  postcardHref,
  printMode = false,
  inviteUrl,
  qrUrl,
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
    layout === "splash" ||
    layout === "azure" ||
    layout === "arcade" ||
    layout === "quince" ||
    layout === "fifty";
  const isComic = layout === "comic";
  const isSuperhero = layout === "superhero";
  const isSuperburst = layout === "superburst";
  const isSpiderweb = layout === "spiderweb";
  const isFestive = layout === "festive";
  const isToybox = layout === "toybox";
  const isSplash = layout === "splash";
  const isCollage = layout === "collage";
  const isAzure = layout === "azure";
  const isArcade = layout === "arcade";
  const isQuince = layout === "quince";
  const isFifty = layout === "fifty";

  const ageDigit = String(balloonDigits ?? "7").replace(/\D/g, "").slice(0, 2) || "7";

  const inviteLine = isComic
    ? comicPresents || invitesYou
    : isFestive
      ? festiveParty || invitesYou
      : isToybox
        ? toyPartyInvite || invitesYou
        : isSplash
          ? splashInvite || invitesYou
          : isCollage
            ? collageInvite || invitesYou
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
      data-template={templateId || undefined}
      data-motion={motionKit && motionKit !== "none" ? motionKit : undefined}
      aria-label="Invitation"
    >
      <div
        className="invite-cover-atmosphere"
        style={
          {
            transform: `translateY(${parallaxY * (motionKit === "parallax" ? 0.55 : 0.4)}px)`,
          } as CSSProperties
        }
      >
        {heroVideoUrl && !printMode ? (
          <video
            className="invite-cover-atmosphere-img"
            autoPlay
            muted
            loop
            playsInline
            poster={heroImage}
            aria-hidden
          >
            <source src={heroVideoUrl} />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" className="invite-cover-atmosphere-img" />
        )}
        <div className="invite-cover-atmosphere-veil" aria-hidden />
        {motionKit === "sparkle" ? (
          <div className="invite-motion-sparkle" aria-hidden />
        ) : null}
      </div>

      {isComic || isSuperhero ? <div className="comic-halftone" aria-hidden /> : null}
      {isSuperburst ? <div className="superburst-rays" aria-hidden /> : null}
      {isSpiderweb ? <div className="spider-web-overlay" aria-hidden /> : null}
      {isFestive ? <div className="festive-confetti" aria-hidden /> : null}
      {isToybox ? <div className="toybox-dots" aria-hidden /> : null}
      {isSplash ? <div className="splash-blobs" aria-hidden /> : null}
      {isCollage ? <div className="collage-grain" aria-hidden /> : null}
      {isAzure || isQuince ? <div className="azure-glow" aria-hidden /> : null}
      {isFifty ? <div className="fifty-sparkle" aria-hidden /> : null}
      {isArcade ? <div className="arcade-scanlines" aria-hidden /> : null}

      <div className="invite-cover-stage">
        <article
          className="invite-card fade-up fade-up-1"
          id={printMode ? "invite-print-target" : undefined}
        >
          {isSuperhero ? (
            <>
              <div className="super-banner">
                <p className="super-banner-title">{title || "Super Party"}</p>
              </div>
              <p className="super-invited">
                {superYouAreInvited || "You are invited!"}
              </p>
              <div className="super-hero-stage">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="" className="super-hero-art" />
                <div className="super-center-copy">
                  <h1 className="super-name">{headline}</h1>
                  <p className="super-turning">
                    {superIsTurning || "is turning"}
                  </p>
                  <div className="super-shield" aria-label={`Age ${ageDigit}`}>
                    <span className="super-shield-age">{ageDigit}</span>
                  </div>
                </div>
              </div>
              <div className="super-pow">
                <div className="super-pow-inner">
                  <p className="super-pow-line">
                    <span>{dateLabel}</span>
                    <span aria-hidden> | </span>
                    <span>{timeLabel}</span>
                  </p>
                  <p className="super-pow-line">
                    {[venue, address].filter(Boolean).join(", ")}
                  </p>
                  {contactPhone ? (
                    <p className="super-pow-line">
                      RSVP: {contactPhone}
                    </p>
                  ) : null}
                </div>
                <span className="super-bam" aria-hidden>
                  BAM!
                </span>
              </div>
              {!printMode ? (
                <div className="super-actions">
                  {isPast || !rsvpEnabled ? (
                    <a className="btn-primary" href="#guestbook">
                      {leaveNoteLabel}
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
              ) : (
                <div className="invite-card-print-footer">
                  {qrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrUrl}
                      alt=""
                      width={96}
                      height={96}
                      className="invite-card-print-qr"
                    />
                  ) : null}
                  {inviteUrl ? (
                    <p className="invite-card-print-url">{inviteUrl}</p>
                  ) : null}
                </div>
              )}
            </>
          ) : isSuperburst ? (
            <>
              <div className="superburst-card">
                <p className="superburst-join">
                  {superJoinUs || "Join us for"}
                </p>
                <h1 className="superburst-name">{possessiveName(headline)}</h1>
                <div className="superburst-photo-wrap">
                  <SuperBurstBalloons />
                  <div className="superburst-shield" aria-hidden />
                  <div className="superburst-hex">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroImage} alt="" />
                  </div>
                  <p className="superburst-ribbon">
                    {superBirthday || "Birthday"}
                  </p>
                </div>
                <p className="superburst-title">
                  {(title || "Super Party").toUpperCase()}
                </p>
                <div className="superburst-burst">
                  <div className="superburst-burst-inner">
                    <div className="superburst-burst-left">
                      <p className="superburst-date">
                        {dateShortLabel || dateLabel}
                      </p>
                      {weekdayLabel ? (
                        <p className="superburst-weekday">{weekdayLabel}</p>
                      ) : null}
                      {venue ? (
                        <p className="superburst-place">{venue}</p>
                      ) : null}
                      {address ? (
                        <p className="superburst-place superburst-place--address">
                          {address}
                        </p>
                      ) : null}
                      {contactPhone ? (
                        <p className="superburst-rsvp">RSVP: {contactPhone}</p>
                      ) : null}
                    </div>
                    <div className="superburst-burst-right">
                      <div className="superburst-time-pow">
                        <span>{timeLabel}</span>
                      </div>
                      <span className="superburst-bang" aria-hidden>
                        !
                      </span>
                    </div>
                  </div>
                </div>
                <SuperCitySkyline />
              </div>
              {!printMode ? (
                <div className="super-actions">
                  {isPast || !rsvpEnabled ? (
                    <a className="btn-primary" href="#guestbook">
                      {leaveNoteLabel}
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
              ) : (
                <div className="invite-card-print-footer">
                  {qrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrUrl}
                      alt=""
                      width={96}
                      height={96}
                      className="invite-card-print-qr"
                    />
                  ) : null}
                  {inviteUrl ? (
                    <p className="invite-card-print-url">{inviteUrl}</p>
                  ) : null}
                </div>
              )}
            </>
          ) : isSpiderweb ? (
            <>
              <div className="spider-card">
                <div className="spider-top">
                  <div className="spider-photo-stack">
                    <SpiderWebBehind />
                    <div className="spider-photo-frame">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={heroImage} alt="" />
                    </div>
                  </div>
                  <SpiderSilhouette />
                </div>
                <p className="spider-celebrate">
                  {spiderLetsCelebrate || "Let's celebrate!"}
                </p>
                <div className="spider-name-burst">
                  <h1 className="spider-name">{headline}</h1>
                  <p className="spider-age" aria-label={`Age ${ageDigit}`}>
                    {ageDigit}
                  </p>
                </div>
                <div className="spider-bottom">
                  <div className="spider-address">
                    {[venue, address].filter(Boolean).join(", ") || "Address TBA"}
                  </div>
                </div>
                <div className="spider-footer-art" aria-hidden>
                  <SuperCitySkyline />
                  <SpiderCitySmoke />
                </div>
                <div className="spider-card-bar">
                  <div className="spider-date-footer">
                    <p>
                      {[weekdayLabel, dateShortLabel || dateLabel]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {timeLabel ? <p>{timeLabel}</p> : null}
                  </div>
                  {!printMode ? (
                    <div className="super-actions spider-actions">
                      {isPast || !rsvpEnabled ? (
                        <a className="btn-primary" href="#guestbook">
                          {leaveNoteLabel}
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
                  ) : null}
                </div>
              </div>
              {printMode ? (
                <div className="invite-card-print-footer">
                  {qrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrUrl}
                      alt=""
                      width={96}
                      height={96}
                      className="invite-card-print-qr"
                    />
                  ) : null}
                  {inviteUrl ? (
                    <p className="invite-card-print-url">{inviteUrl}</p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <>
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
          {isSplash ? <SplashStickers /> : null}
          {isCollage ? <CollageStickers /> : null}
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

            {isCollage ? (
              <div className="invite-card-when invite-card-when--collage">
                <div className="collage-when-row">
                  <span className="collage-when-day">
                    {weekdayLabel || dateLabel}
                  </span>
                  <span className="collage-when-date">
                    {dateShortLabel || dateLabel}
                  </span>
                  <span className="collage-when-time">{timeLabel}</span>
                </div>
                <p className="invite-card-venue">{venue}</p>
                <p className="invite-card-address">{address}</p>
              </div>
            ) : (
              <div className="invite-card-when">
                <p className="invite-card-date">{dateLabel}</p>
                <p className="invite-card-time">{timeLabel}</p>
                <p className="invite-card-venue">{venue}</p>
                <p className="invite-card-address">{address}</p>
              </div>
            )}

            {!photoTop ? (
              isCollage ? (
                <div className="collage-photo-stage">
                  <CollageDiscoBall />
                  <div className="invite-card-photo invite-card-photo--inset">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroImage} alt="" />
                  </div>
                  <CollageNumberBalloons digits={balloonDigits} />
                </div>
              ) : (
                <div className="invite-card-photo invite-card-photo--inset">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt="" />
                </div>
              )
            ) : null}

            <div
              className="invite-card-tagline"
              dangerouslySetInnerHTML={{
                __html: sanitizeAboutHtml(tagline),
              }}
            />

            {!printMode ? (
              <>
                <div className="invite-card-actions">
                  {isPast || !rsvpEnabled ? (
                    <a className="btn-primary" href="#guestbook">
                      {leaveNoteLabel}
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
                  {postcardHref && postcardLabel ? (
                    <a
                      className="invite-text-link"
                      href={postcardHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {postcardLabel}
                    </a>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="invite-card-print-footer">
                {qrUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrUrl}
                    alt=""
                    width={96}
                    height={96}
                    className="invite-card-print-qr"
                  />
                ) : null}
                {inviteUrl ? (
                  <p className="invite-card-print-url">{inviteUrl}</p>
                ) : null}
              </div>
            )}
          </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
