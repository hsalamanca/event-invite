"use client";

import { useState } from "react";

function NoteIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M10 5.2v9.15a3.4 3.4 0 1 0 1.7 2.95V9.1l7.1-1.55v6.4a3.4 3.4 0 1 0 1.7 2.95V4.35L10 6.15V5.2Z"
      />
      {muted ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          d="M4.2 19.2 19.8 4.8"
        />
      ) : null}
    </svg>
  );
}

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
      <NoteIcon muted={muted} />
    </button>
  );
}
