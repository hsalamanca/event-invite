import { QUINCE_TIARA_ASSETS } from "./assets";

/** Guest frame is the SVG slot — do not use the raster frame PNG (checkerboard / stretch). */
export default function GoldHexFrame() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={QUINCE_TIARA_ASSETS.frameSvg}
      alt=""
      className="quinceframe-hex"
      aria-hidden
    />
  );
}
