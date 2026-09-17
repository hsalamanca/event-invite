import AssetSlot from "./AssetSlot";
import { QUINCE_TIARA_ASSETS } from "./assets";

function GownSvg() {
  return (
    <svg viewBox="0 0 120 168" className="quinceframe-gown-svg" aria-hidden>
      <defs>
        <linearGradient id="quinceframeGownSkirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7C7D6" />
          <stop offset="42%" stopColor="#E48BA8" />
          <stop offset="100%" stopColor="#C2185B" />
        </linearGradient>
        <linearGradient id="quinceframeGownBodice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4DCE4" />
          <stop offset="100%" stopColor="#D46A88" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="18" rx="7" ry="8" fill="#F3D0C4" />
      <path
        d="M48 28 C48 40 46 50 44 58 L76 58 C74 50 72 40 72 28 Z"
        fill="url(#quinceframeGownBodice)"
      />
      <path
        d="M54 32 L56 54 M60 30 L60 54 M66 32 L64 54"
        stroke="#C2185B"
        strokeWidth="0.7"
        opacity="0.55"
      />
      <path
        d="M44 58 C22 78 8 118 14 156 C36 148 48 148 60 148 C72 148 84 148 106 156 C112 118 98 78 76 58 Z"
        fill="url(#quinceframeGownSkirt)"
      />
      <path
        d="M60 58 C52 92 46 124 48 148"
        fill="none"
        stroke="#9A1248"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <path
        d="M60 58 C68 92 74 124 72 148"
        fill="none"
        stroke="#9A1248"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <path
        d="M36 150 C48 144 72 144 84 150"
        fill="none"
        stroke="#D4A017"
        strokeWidth="0.8"
        opacity="0.7"
      />
    </svg>
  );
}

export default function GownIllustration() {
  return (
    <AssetSlot src={QUINCE_TIARA_ASSETS.gown} className="quinceframe-gown">
      <GownSvg />
    </AssetSlot>
  );
}
