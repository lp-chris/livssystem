export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { libraryItems, domains } from "@/db/schema";
import { desc, eq, ne } from "drizzle-orm";
import NotatListe from "@/components/NotatListe";

const leseStatusEtikett: Record<string, string> = {
  vil_lese: "Vil lese",
  leser: "Leser nå",
  fullført: "Lest",
};

export default async function BibliiotekSide() {
  const [items, sisteJournal, alleDomener] = await Promise.all([
    db
      .select()
      .from(libraryItems)
      .where(ne(libraryItems.type, "journal"))
      .orderBy(desc(libraryItems.opprettet)),
    db
      .select()
      .from(libraryItems)
      .where(eq(libraryItems.type, "journal"))
      .orderBy(desc(libraryItems.opprettet))
      .limit(1),
    db.select().from(domains).orderBy(domains.rekkefølge),
  ]);

  const notater = items.filter((i) => i.type === "notat");
  const sitater = items.filter((i) => i.type === "sitat");
  const bøker = items.filter((i) => i.type === "bok");

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-3xl md:px-10 md:pt-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          Bibliotek
        </h1>
      </header>

      {/* Journal-lenke */}
      <Link
        href="/journal"
        className="flex items-center justify-between px-4 py-4 rounded-[18px] mb-8"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>Journal</p>
          {sisteJournal[0] ? (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Siste:{" "}
              {new Date(sisteJournal[0].opprettet).toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "long",
              })}
              {sisteJournal[0].tittel ? ` · ${sisteJournal[0].tittel}` : ""}
            </p>
          ) : (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Ingen poster ennå</p>
          )}
        </div>
        <span style={{ color: "var(--muted)", fontSize: 18 }}>→</span>
      </Link>

      {items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
            Ingenting her ennå.
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Fang et notat, sitat eller bok via mikrofon-knappen.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {bøker.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase mb-3"
              style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
            >
              Bøker ({bøker.length})
            </h2>
            <div className="space-y-2">
              {bøker.map((b) => (
                <Link
                  key={b.id}
                  href={`/bibliotek/${b.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-[22px] transition-opacity active:opacity-70"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ color: "var(--hest)", fontSize: 18 }}>❧</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
                      {b.tittel}
                    </div>
                    {b.forfatter && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {b.forfatter}
                      </div>
                    )}
                  </div>
                  {b.leseStatus && (
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                      {leseStatusEtikett[b.leseStatus] ?? b.leseStatus}
                    </span>
                  )}
                  {b.favoritt && (
                    <span style={{ color: "var(--hest)" }}>★</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {sitater.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase mb-3"
              style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
            >
              Sitater ({sitater.length})
            </h2>
            <div className="space-y-2">
              {sitater.map((s) => (
                <Link
                  key={s.id}
                  href={`/bibliotek/${s.id}`}
                  className="block px-4 py-4 rounded-[22px] transition-opacity active:opacity-70"
                  style={{
                    backgroundColor: "#EBE6DB",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    className="text-sm leading-relaxed line-clamp-2"
                    style={{ color: "var(--ink-2)", fontStyle: "italic" }}
                  >
                    "{s.innhold}"
                  </p>
                  {s.kilde && (
                    <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
                      — {s.kilde}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {notater.length > 0 && (
          <NotatListe notater={notater} domener={alleDomener} />
        )}
      </div>
    </main>
  );
}
