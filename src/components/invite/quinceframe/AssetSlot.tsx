"use client";

import { useCallback, useState, type ReactNode } from "react";

/** Renders the Ink PNG; SVG/CSS children only until the bitmap is ready. */
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
  const markReady = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);
  const imgClass = loaded
    ? "quinceframe-asset"
    : "quinceframe-asset quinceframe-asset--pending";

  return (
    <span className={className}>
      {fallbackSrc ? (
        <picture>
          <source srcSet={src} type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={markReady}
            src={fallbackSrc}
            alt=""
            className={imgClass}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(false)}
          />
        </picture>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={markReady}
          src={src}
          alt=""
          className={imgClass}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
      {loaded ? null : children}
    </span>
  );
}
