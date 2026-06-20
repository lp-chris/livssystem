export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { libraryItems, libraryThoughts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import FavorittKnapp from "@/components/FavorittKnapp";
import LeggTilTanke from "@/components/LeggTilTanke";
import LeseStatusVelger from "@/components/LeseStatusVelger";

const leseStatusEtikett: Record<string, string> = {
  vil_lese: "Vil lese",
  leser: "Leser nå",
  fullført: "Lest",
};

export default async function BibliotekDetaljSide({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = parseInt(id);
  if (isNaN(itemId)) notFound();

  const [item] = await db
    .select()
    .from(libraryItems)
    .where(eq(libraryItems.id, itemId));
  if (!item) notFound();

  const tanker = await db
    .select()
    .from(libraryThoughts)
    .where(eq(libraryThoughts.itemId, itemId))
    .orderBy(libraryThoughts.opprettet);

  return (
    <main className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/bibliotek" className="text-gray-400 text-sm">
            ← Bibliotek
          </Link>
          <FavorittKnapp id={item.id} favoritt={item.favoritt} />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* Bok */}
        {item.type === "bok" && (
          <>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {item.tittel}
              </h1>
              {item.forfatter && (
                <p className="text-sm text-gray-500 mt-1">{item.forfatter}</p>
              )}
            </div>
            <LeseStatusVelger id={item.id} status={item.leseStatus ?? "vil_lese"} />
            {item.sammendrag && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {item.sammendrag}
              </p>
            )}
          </>
        )}

        {/* Sitat */}
        {item.type === "sitat" && (
          <div className="bg-indigo-50 rounded-xl p-5">
            <p className="text-base text-gray-800 italic leading-relaxed">
              "{item.innhold}"
            </p>
            {item.kilde && (
              <p className="text-sm text-gray-500 mt-3">— {item.kilde}</p>
            )}
          </div>
        )}

        {/* Notat */}
        {item.type === "notat" && (
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-3">
              {item.tittel}
            </h1>
            {item.innhold && (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {item.innhold}
              </p>
            )}
          </div>
        )}

        {/* Tanker (sitater og notater) */}
        {(item.type === "sitat" || item.type === "notat") && (
          <section>
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Tanker
            </h2>
            {tanker.length > 0 && (
              <div className="space-y-3 mb-4">
                {tanker.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-xl px-4 py-3 shadow-sm"
                  >
                    <p className="text-sm text-gray-800">{t.tekst}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(t.opprettet).toLocaleDateString("nb-NO")}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <LeggTilTanke itemId={item.id} />
          </section>
        )}

        <p className="text-xs text-gray-300 text-center">
          Lagt til{" "}
          {new Date(item.opprettet).toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </main>
  );
}
