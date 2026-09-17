export default function RelationLine({ children }: { children: string }) {
  if (!children) return null;
  return <p className="quinceframe-relation">{children}</p>;
}
