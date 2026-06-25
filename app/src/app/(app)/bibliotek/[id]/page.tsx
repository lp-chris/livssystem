export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { libraryItems, libraryThoughts, domains } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import FavorittKnapp from "@/components/FavorittKnapp";
import LeggTilTanke from "@/components/LeggTilTanke";
import LeseStatusVelger from "@/components/LeseStatusVelger";
import BokRating from "@/components/BokRating";
import BokFormatVelger from "@/components/BokFormatVelger";
import BokSammendrag from "@/components/BokSammendrag";
import BokTanker from "@/components/BokTanker";
import SlettBibliotekElement from "@/components/SlettBibliotekElement";
import NotatDetalj from "@/components/NotatDetalj";

export default async function BibliotekDetaljSide({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = parseInt(id);
  if (isNaN(itemId)) notFound();

  const [[item], tanker, alleDomener] = await Promise.all([
    db.select().from(libraryItems).where(eq(libraryItems.id, itemId)),
    db
      .select()
      .from(libraryThoughts)
      .where(eq(libraryThoughts.itemId, itemId))
      .orderBy(libraryThoughts.opprettet),
    db.select().from(domains).orderBy(domains.rekkefølge),
  ]);
  if (!item) notFound();

  // Notater har egen redigerbar visning
  if (item.type === "notat") {
    return <NotatDetalj notat={item} domener={alleDomener} />;
  }

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-8">
        <Link
          href="/bibliotek"
          className="text-sm flex items-center gap-1 min-h-[44px]"
          style={{ color: "var(--muted)" }}
        >
          ← Bibliotek
        </Link>
        <FavorittKnapp id={item.id} favoritt={item.favoritt} />
      </header>

      <div className="space-y-6">
        {/* Bok */}
        {item.type === "bok" && (
          <>
            <div className="flex gap-4">
              {item.omslagUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.omslagUrl}
                  alt=""
                  className="w-24 h-36 object-cover rounded-[12px] flex-shrink-0"
                  style={{ border: "1px solid var(--border)" }}
                />
              ) : (
                <div
                  className="w-24 h-36 rounded-[12px] flex-shrink-0 flex items-center justify-center text-3xl"
                  style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                >
                  📖
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
                  {item.tittel}
                </h1>
                {item.forfatter && (
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    {item.forfatter}
                  </p>
                )}
              </div>
            </div>
            <BokFormatVelger id={item.id} format={item.format} />
            <LeseStatusVelger id={item.id} status={item.leseStatus ?? "vil_lese"} />
            <BokRating id={item.id} rating={item.rating} />
            <BokSammendrag
              id={item.id}
              sammendrag={item.aiSammendrag}
              takeaways={item.aiTakeaways}
            />
            <BokTanker id={item.id} sammendrag={item.sammendrag} />
          </>
        )}

        {/* Sitat */}
        {item.type === "sitat" && (
          <div
            className="rounded-[22px] px-5 py-5"
            style={{ backgroundColor: "#EBE6DB" }}
          >
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--ink-2)", fontStyle: "italic" }}
            >
              "{item.innhold}"
            </p>
            {item.kilde && (
              <p className="text-sm mt-3" style={{ color: "var(--muted)" }}>
                — {item.kilde}
              </p>
            )}
          </div>
        )}

        {/* Tanker */}
        {(item.type === "sitat") && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase mb-3"
              style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
            >
              Tanker
            </h2>
            {tanker.length > 0 && (
              <div className="space-y-3 mb-4">
                {tanker.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-[18px] px-4 py-3"
                    style={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p className="text-sm" style={{ color: "var(--ink)" }}>
                      {t.tekst}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      {new Date(t.opprettet).toLocaleDateString("nb-NO")}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <LeggTilTanke itemId={item.id} />
          </section>
        )}

        <p className="text-xs text-center" style={{ color: "var(--border)" }}>
          Lagt til{" "}
          {new Date(item.opprettet).toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <SlettBibliotekElement id={item.id} />
      </div>
    </main>
  );
}
