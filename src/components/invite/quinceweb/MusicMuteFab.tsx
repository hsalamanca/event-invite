"use client";

import { useState } from "react";

export default function MusicMuteFab({
  muteLabel,
  unmuteLabel,
}: {
  muteLabel: string;
  unmuteLabel: string;
}) {
  const [muted, setMuted] = useState(true);

  return (
    <button
      type="button"
      className="qw-mute"
      aria-pressed={muted}
      aria-label={muted ? unmuteLabel : muteLabel}
      onClick={() => setMuted((value) => !value)}
    >
      {muted ? "♪" : "♯"}
    </button>
  );
}
