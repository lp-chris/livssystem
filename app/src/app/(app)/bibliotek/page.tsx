export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { libraryItems, domains } from "@/db/schema";
import { desc, eq, ne } from "drizzle-orm";
import BibliiotekTabs from "@/components/BibliiotekTabs";

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
        className="flex items-center justify-between px-4 py-4 rounded-[18px] mb-6"
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

      <BibliiotekTabs items={items} domener={alleDomener} />
    </main>
  );
}
