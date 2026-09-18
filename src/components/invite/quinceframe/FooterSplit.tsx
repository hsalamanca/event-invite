import type { ReactNode } from "react";

export default function FooterSplit({
  lunch,
  gown,
  rsvp,
}: {
  lunch: ReactNode;
  gown: ReactNode;
  rsvp: ReactNode;
}) {
  return (
    <div className="quinceframe-footer">
      <div className="quinceframe-footer-gown">{gown}</div>
      {lunch}
      {rsvp}
    </div>
  );
}
