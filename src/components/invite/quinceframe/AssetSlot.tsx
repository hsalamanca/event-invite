"use client";

import { useState, type ReactNode } from "react";

/** Renders a WebP guest asset with PNG fallback; SVG/CSS children if both fail. */
export default function AssetSlot({
  src,
  fallbackSrc,
  className,
  children,
}: {
  src: string;
  fallbackSrc?: string;
  className?: string;
  children: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={className}>
      {fallbackSrc ? (
        <picture>
          <source srcSet={src} type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fallbackSrc}
            alt=""
            className="quinceframe-asset"
            hidden={!loaded}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(false)}
          />
        </picture>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="quinceframe-asset"
          hidden={!loaded}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
      {loaded ? null : children}
    </span>
  );
}
