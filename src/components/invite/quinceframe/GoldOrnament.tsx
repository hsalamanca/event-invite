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
          d="M104 12 C110 12 114 8 120 4 C126 8 130 12 136 12 C130 12 126 16 120 20 C114 16 110 12 104 12 Z"
          fill="#E8A0B8"
          stroke="#C9A227"
          strokeWidth="0.7"
        />
        <circle cx="120" cy="12" r="1.7" fill="#F6E7A8" />
        <circle cx="99" cy="12" r="1.1" fill="#C9A227" />
        <circle cx="141" cy="12" r="1.1" fill="#C9A227" />
      </svg>
    </div>
  );
}
