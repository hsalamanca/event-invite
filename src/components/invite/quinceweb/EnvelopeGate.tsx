"use client";

import { useEffect, useState } from "react";
import { QUINCE_PRINCESA_ASSETS } from "./assets";

const OPEN_MS = 1200;

export default function EnvelopeGate({
  monogram,
  hint,
  onOpened,
}: {
  monogram: string;
  hint: string;
  onOpened: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onOpened();
      return;
    }
    const timer = window.setTimeout(onOpened, OPEN_MS);
    return () => window.clearTimeout(timer);
  }, [open, onOpened]);

  function handleOpen() {
    if (open) return;
    setOpen(true);
  }

  const useDemoSeal = monogram === "KG" || monogram === "KXZ";

  return (
    <div className={`qw-envelope${open ? " is-open" : ""}`} aria-hidden={open}>
      <div className="qw-envelope-stage">
        <div className="qw-envelope-body" aria-hidden />
        <div className="qw-envelope-flap">
          <button
            type="button"
            className="qw-envelope-hit"
            onClick={handleOpen}
            aria-label={hint}
          >
            <span className="qw-seal">
              {useDemoSeal ? (
                // SVG only — PNG still has the old KXZ raster.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={QUINCE_PRINCESA_ASSETS.sealMonogramSvg}
                  alt=""
                  width={88}
                  height={88}
                />
              ) : (
                <span className="qw-seal-custom">
                  <picture>
                    <source
                      type="image/svg+xml"
                      srcSet={QUINCE_PRINCESA_ASSETS.sealCrownSvg}
                    />
                    <img
                      src={QUINCE_PRINCESA_ASSETS.sealCrownPng}
                      alt=""
                      width={88}
                      height={72}
                    />
                  </picture>
                  {monogram ? (
                    <span className="qw-seal-letters">{monogram}</span>
                  ) : null}
                </span>
              )}
            </span>
          </button>
        </div>
        <p className="qw-envelope-hint">{hint}</p>
      </div>
    </div>
  );
}
