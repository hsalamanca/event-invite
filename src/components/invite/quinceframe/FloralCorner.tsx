import AssetSlot from "./AssetSlot";
import { QUINCE_TIARA_ASSETS } from "./assets";

function RoseBouquet() {
  return (
    <svg viewBox="0 0 160 160" className="quinceframe-floral-svg" aria-hidden>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M18 142 C38 118 52 92 62 58"
          stroke="#C9A227"
          strokeWidth="1.4"
        />
        <path
          d="M62 58 C78 44 104 36 138 28"
          stroke="#E0B84A"
          strokeWidth="1.2"
        />
        <path
          d="M44 112 C28 96 22 72 38 58 C50 48 66 58 62 74 C58 90 40 96 44 112 Z"
          fill="#F4B3C8"
          stroke="#E8A0B8"
          strokeWidth="0.8"
        />
        <path
          d="M72 48 C62 30 78 14 96 22 C108 28 108 44 96 50 C86 55 76 52 72 48 Z"
          fill="#E8A0B8"
          stroke="#D4789A"
          strokeWidth="0.7"
        />
      </g>
    </svg>
  );
}

const SRC = {
  tl: QUINCE_TIARA_ASSETS.floralTl,
  br: QUINCE_TIARA_ASSETS.floralBr,
  tr: QUINCE_TIARA_ASSETS.floralTr,
  bl: QUINCE_TIARA_ASSETS.floralBl,
} as const;

export default function FloralCorner({
  corner,
}: {
  corner: "tl" | "br" | "tr" | "bl";
}) {
  return (
    <AssetSlot
      src={SRC[corner].png}
      className={`quinceframe-floral quinceframe-floral--${corner}`}
    >
      <RoseBouquet />
    </AssetSlot>
  );
}
