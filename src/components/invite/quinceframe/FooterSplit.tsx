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
      {lunch}
      {gown}
      {rsvp}
    </div>
  );
}
