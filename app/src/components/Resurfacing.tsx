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
    <section
      className="rounded-[22px] px-5 py-5"
      style={{ backgroundColor: "#EBE6DB" }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <p
          className="text-[11px] font-bold uppercase"
          style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
        >
          {item.type === "sitat" ? "Sitat" : item.type === "bok" ? "Bok" : "Notat"}
        </p>
        <span className="text-[10px]" style={{ color: "var(--muted)" }}>
          roterer daglig
        </span>
      </div>
      <p
        className="text-base leading-relaxed"
        style={{
          color: "var(--ink-2)",
          fontStyle: item.type === "sitat" ? "italic" : "normal",
        }}
      >
        {item.type === "sitat" ? `"${tekst}"` : tekst}
      </p>
      {undertekst && (
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          — {undertekst}
        </p>
      )}
    </section>
  );
}
