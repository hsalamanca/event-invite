"use client";

import { useState } from "react";

export default function StudioCheckoutButton({
  label,
  className,
  style,
}: {
  label: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "studio" }),
      });
      const data = (await res.json()) as {
        url?: string;
        mailto?: string;
        alreadyStudio?: boolean;
        error?: string;
      };
      if (data.alreadyStudio) {
        window.location.href = "/dashboard?studio=1";
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.mailto) {
        window.location.href = data.mailto;
        return;
      }
      window.location.href =
        "mailto:hello@ownvite.com?subject=Ownvite%20Studio";
    } catch {
      window.location.href =
        "mailto:hello@ownvite.com?subject=Ownvite%20Studio";
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void start()}
      className={className}
      style={style}
    >
      {busy ? "…" : label}
    </button>
  );
}
