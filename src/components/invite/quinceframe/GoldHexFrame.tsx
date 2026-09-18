/** Open-bottom gold hex — lower side strokes stop above Lunch|RSVP. */
export default function GoldHexFrame() {
  return (
    <svg
      className="quinceframe-hex"
      viewBox="0 0 600 900"
      fill="none"
      aria-hidden
    >
      <path
        d="M55 640 L55 180 L130 70 L300 28 L470 70 L545 180 L545 640"
        stroke="#C9A227"
        strokeWidth="2.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      <path
        d="M200 860 L300 878 L400 860"
        stroke="#C9A227"
        strokeWidth="2.5"
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
    </svg>
  );
}
