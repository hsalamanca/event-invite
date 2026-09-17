export default function LunchBlock({
  label,
  detail,
}: {
  label: string;
  detail: string;
}) {
  return (
    <div className="quinceframe-lunch">
      <p className="quinceframe-col-head">{label}</p>
      {detail ? <p className="quinceframe-side-detail">{detail}</p> : null}
    </div>
  );
}
