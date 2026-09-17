export default function EventScript({ children }: { children: string }) {
  if (!children) return null;
  return <p className="quinceframe-script">{children}</p>;
}
