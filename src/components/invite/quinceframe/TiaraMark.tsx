import AssetSlot from "./AssetSlot";
import { QUINCE_TIARA_ASSETS } from "./assets";

function TiaraSvg() {
  return (
    <svg viewBox="0 0 180 72" className="quinceframe-tiara-svg" aria-hidden>
      <defs>
        <linearGradient id="quinceframeTiaraPink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD0E0" />
          <stop offset="45%" stopColor="#E86A9A" />
          <stop offset="100%" stopColor="#C2185B" />
        </linearGradient>
        <linearGradient id="quinceframeTiaraGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3E2A0" />
          <stop offset="100%" stopColor="#D4A017" />
        </linearGradient>
      </defs>
      <path
        d="M16 58 C28 46 40 30 52 22 C64 36 78 14 90 8 C102 14 116 36 128 22 C140 30 152 46 164 58"
        fill="url(#quinceframeTiaraPink)"
        stroke="url(#quinceframeTiaraGold)"
        strokeWidth="1.4"
      />
      <path
        d="M20 58 H160"
        stroke="url(#quinceframeTiaraGold)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="90" cy="10" r="3.2" fill="#F7E7A3" />
      <circle cx="52" cy="24" r="2.4" fill="#F4C6D6" />
      <circle cx="128" cy="24" r="2.4" fill="#F4C6D6" />
      <circle cx="34" cy="44" r="1.6" fill="#FFE08A" />
      <circle cx="146" cy="44" r="1.6" fill="#FFE08A" />
      <circle cx="72" cy="30" r="1.3" fill="#fff" />
      <circle cx="108" cy="30" r="1.3" fill="#fff" />
    </svg>
  );
}

export default function TiaraMark() {
  return (
    <AssetSlot src={QUINCE_TIARA_ASSETS.tiara} className="quinceframe-tiara">
      <TiaraSvg />
    </AssetSlot>
  );
}
