"use client";

import { useState, type ReactNode } from "react";

/** Renders a PNG asset slot; falls back to SVG/CSS children if the file is missing. */
export default function AssetSlot({
  src,
  className,
  children,
}: {
  src: string;
  className?: string;
  children: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="quinceframe-asset"
        hidden={!loaded}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
      {loaded ? null : children}
    </span>
  );
}
