export default function MassLine({
  label,
  detail,
}: {
  label: string;
  detail: string;
}) {
  const text = [label, detail].filter(Boolean).join(" ");
  if (!text) return null;
  return (
    <div className="quinceframe-mass">
      <p className="quinceframe-kicker">{text}</p>
    </div>
  );
}
