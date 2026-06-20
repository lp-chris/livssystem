type LibraryItem = {
  id: number;
  type: string;
  tittel: string | null;
  innhold: string | null;
  kilde: string | null;
  forfatter: string | null;
};

export default function Resurfacing({ item }: { item: LibraryItem | null }) {
  if (!item) return null;

  const tekst =
    item.type === "sitat"
      ? item.innhold
      : item.type === "bok"
      ? item.tittel
      : item.tittel ?? item.innhold;

  const undertekst =
    item.type === "sitat"
      ? item.kilde
      : item.type === "bok"
      ? item.forfatter
      : null;

  return (
    <section className="bg-indigo-50 rounded-xl px-4 py-4">
      <div className="text-xs font-medium text-indigo-400 uppercase tracking-wide mb-2">
        {item.type === "sitat" ? "Sitat" : item.type === "bok" ? "Bok" : "Notat"}
      </div>
      <p className="text-sm text-gray-800 leading-relaxed">
        {item.type === "sitat" ? `"${tekst}"` : tekst}
      </p>
      {undertekst && (
        <p className="text-xs text-gray-400 mt-1">— {undertekst}</p>
      )}
    </section>
  );
}
