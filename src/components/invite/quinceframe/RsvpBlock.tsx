export default function RsvpBlock({
  header,
  detail,
  ctaLabel,
  href,
  printMode,
  inviteUrl,
  qrUrl,
}: {
  header: string;
  detail: string;
  ctaLabel: string;
  href: string;
  printMode?: boolean;
  inviteUrl?: string;
  qrUrl?: string;
}) {
  if (printMode) {
    return (
      <div className="quinceframe-rsvp quinceframe-rsvp--print">
        <p className="quinceframe-col-head">{header}</p>
        {detail ? <p className="quinceframe-side-detail">{detail}</p> : null}
        {qrUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrUrl}
            alt=""
            width={56}
            height={56}
            className="quinceframe-rsvp-qr"
          />
        ) : null}
        {inviteUrl ? <p className="quinceframe-rsvp-url">{inviteUrl}</p> : null}
      </div>
    );
  }

  return (
    <div className="quinceframe-rsvp">
      <a className="quinceframe-col-head quinceframe-rsvp-cta" href={href}>
        {header || ctaLabel}
      </a>
      {detail ? <p className="quinceframe-side-detail">{detail}</p> : null}
    </div>
  );
}
