"use client";

import { useEffect, useState } from "react";
import GownIllustration from "./GownIllustration";
import { safeInviteImageUrl } from "@/lib/safe-image-url";

export default function HonoreePortrait({
  photoUrl,
  honoreeName,
  photoAlt,
}: {
  photoUrl?: string;
  honoreeName: string;
  photoAlt?: string;
}) {
  const src = safeInviteImageUrl(photoUrl);
  const [status, setStatus] = useState<"empty" | "loading" | "ready" | "error">(
    src ? "loading" : "empty",
  );

  useEffect(() => {
    setStatus(src ? "loading" : "empty");
  }, [src]);

  const filled = Boolean(src) && status === "ready";
  const name = honoreeName.trim();
  const alt =
    photoAlt?.replace("{name}", name) ||
    (name ? `Photo of ${name}` : "");

  return (
    <div
      className={
        filled
          ? "quinceframe-honoree quinceframe-honoree--filled"
          : "quinceframe-honoree"
      }
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={filled ? alt : ""}
          className={
            filled
              ? "quinceframe-portrait-photo"
              : "quinceframe-portrait-photo quinceframe-portrait-photo--pending"
          }
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
      ) : null}
      {!filled ? <GownIllustration /> : null}
      {status === "loading" && src ? (
        <span className="quinceframe-portrait-skeleton" aria-hidden />
      ) : null}
    </div>
  );
}
