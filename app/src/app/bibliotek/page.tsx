export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { libraryItems } from "@/db/schema";
import { desc } from "drizzle-orm";
import FavorittKnapp from "@/components/FavorittKnapp";

const typeIkon: Record<string, string> = {
  notat: "📝",
  sitat: "❝",
  bok: "📚",
};

const leseStatusEtikett: Record<string, string> = {
  vil_lese: "Vil lese",
  leser: "Leser nå",
  fullført: "Lest",
};

export default async function BibliiotekSide() {
  const items = await db
    .select()
    .from(libraryItems)
    .orderBy(desc(libraryItems.opprettet));

  const notater = items.filter((i) => i.type === "notat");
  const sitater = items.filter((i) => i.type === "sitat");
  const bøker = items.filter((i) => i.type === "bok");

  return (
    <main className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-400 text-sm">
            ← Hjem
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Bibliotek</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-1">Ingenting her ennå.</p>
            <p className="text-gray-400 text-xs">
              Fang et notat, sitat eller bok via fangst-feltet på hjemsiden.
            </p>
          </div>
        )}

        {bøker.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Bøker ({bøker.length})
            </h2>
            <div className="space-y-2">
              {bøker.map((b) => (
                <Link
                  key={b.id}
                  href={`/bibliotek/${b.id}`}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm"
                >
                  <span className="text-lg">📚</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {b.tittel}
                    </div>
                    {b.forfatter && (
                      <div className="text-xs text-gray-400">{b.forfatter}</div>
                    )}
                  </div>
                  {b.leseStatus && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {leseStatusEtikett[b.leseStatus] ?? b.leseStatus}
                    </span>
                  )}
                  {b.favoritt && <span className="text-yellow-400">★</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {sitater.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Sitater ({sitater.length})
            </h2>
            <div className="space-y-2">
              {sitater.map((s) => (
                <Link
                  key={s.id}
                  href={`/bibliotek/${s.id}`}
                  className="block bg-white rounded-xl px-4 py-3 shadow-sm"
                >
                  <p className="text-sm text-gray-800 italic leading-relaxed line-clamp-2">
                    "{s.innhold}"
                  </p>
                  {s.kilde && (
                    <p className="text-xs text-gray-400 mt-1">— {s.kilde}</p>
                  )}
                  {s.favoritt && (
                    <span className="text-yellow-400 text-xs">★</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {notater.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Notater ({notater.length})
            </h2>
            <div className="space-y-2">
              {notater.map((n) => (
                <Link
                  key={n.id}
                  href={`/bibliotek/${n.id}`}
                  className="block bg-white rounded-xl px-4 py-3 shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {n.tittel}
                  </p>
                  {n.innhold && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.innhold}
                    </p>
                  )}
                  {n.favoritt && (
                    <span className="text-yellow-400 text-xs">★</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
