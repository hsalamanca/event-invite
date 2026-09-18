export default function DateLine({ children }: { children: string }) {
  if (!children) return null;
  return <p className="quinceframe-date">{children}</p>;
}
