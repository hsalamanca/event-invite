/** Champagne flourish that separates the type stack from the Lunch | RSVP footer. */
export default function GoldOrnament() {
  return (
    <div className="quinceframe-ornament" aria-hidden>
      <svg viewBox="0 0 240 24" className="quinceframe-ornament-svg">
        <defs>
          <linearGradient id="quinceframeOrnamentGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C9A227" stopOpacity="0" />
            <stop offset="28%" stopColor="#C9A227" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#E8CE7C" />
            <stop offset="72%" stopColor="#C9A227" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="quinceframeOrnamentJewel" cx="38%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#FBE3EC" />
            <stop offset="45%" stopColor="#E8A0B8" />
            <stop offset="100%" stopColor="#C9678F" />
          </radialGradient>
        </defs>
        <path
          d="M8 12 H96"
          stroke="url(#quinceframeOrnamentGold)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M144 12 H232"
          stroke="url(#quinceframeOrnamentGold)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M108 12 C113 12 116 8.5 120 5 C124 8.5 127 12 132 12 C127 12 124 15.5 120 19 C116 15.5 113 12 108 12 Z"
          fill="url(#quinceframeOrnamentJewel)"
          stroke="#C9A227"
          strokeWidth="0.6"
        />
        <path
          d="M120 5 L120 19 M108 12 L132 12"
          stroke="#F6E7A8"
          strokeWidth="0.4"
          opacity="0.75"
        />
        <circle cx="101" cy="12" r="1" fill="#C9A227" />
        <circle cx="139" cy="12" r="1" fill="#C9A227" />
      </svg>
    </div>
  );
}
