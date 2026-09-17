export default function HostLine({ children }: { children: string }) {
  if (!children) return null;
  return <p className="quinceframe-host">{children}</p>;
}
