export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { tasks, routines, routineLogs, libraryItems } from "@/db/schema";
import { eq, and, lte, isNotNull, gte, sql } from "drizzle-orm";
import LoggUtKnapp from "@/components/LoggUtKnapp";
import FangstSkjema from "@/components/FangstSkjema";
import Topp3 from "@/components/Topp3";
import DetSomHaster from "@/components/DetSomHaster";
import DagensRutiner from "@/components/DagensRutiner";
import Resurfacing from "@/components/Resurfacing";

function datoStreng(d: Date) {
  return d.toISOString().split("T")[0];
}

export default async function IDag() {
  const iDagStr = datoStreng(new Date());

  const [topp3, haster, alleRutiner, logger, tilfeldigItem] = await Promise.all(
    [
      db
        .select()
        .from(tasks)
        .where(and(eq(tasks.status, "åpen"), eq(tasks.topp3, true)))
        .limit(3),

      db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.status, "åpen"),
            isNotNull(tasks.forfall),
            lte(tasks.forfall, iDagStr)
          )
        )
        .orderBy(tasks.forfall)
        .limit(10),

      db.select().from(routines).orderBy(routines.tidspunkt),

      db
        .select()
        .from(routineLogs)
        .where(eq(routineLogs.dato, iDagStr)),

      db
        .select()
        .from(libraryItems)
        .orderBy(sql`RANDOM()`)
        .limit(1),
    ]
  );

  const dagensRutiner = alleRutiner.map((r) => ({
    id: r.id,
    navn: r.navn,
    tidspunkt: r.tidspunkt,
    fullførtIdag: logger.some((l) => l.routineId === r.id && l.fullført),
  }));

  const resurfacingItem = tilfeldigItem[0] ?? null;

  // Filtrer ut topp3-oppgaver fra haster-listen
  const topp3Ids = new Set(topp3.map((o) => o.id));
  const hasterFiltrert = haster.filter((o) => !topp3Ids.has(o.id));

  return (
    <main className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">I dag</h1>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <LoggUtKnapp />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Fangst */}
        <FangstSkjema />

        {/* Topp 3 */}
        <section>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Topp 3 i dag
          </h2>
          <Topp3 oppgaver={topp3} />
        </section>

        {/* Det som haster */}
        <DetSomHaster oppgaver={hasterFiltrert} />

        {/* Rutiner */}
        {dagensRutiner.length > 0 && (
          <DagensRutiner rutiner={dagensRutiner} />
        )}

        {/* Resurfacing */}
        <Resurfacing item={resurfacingItem} />

        {/* Navigasjon */}
        <nav className="grid grid-cols-3 gap-2 pt-2">
          <Link
            href="/oppgaver"
            className="bg-white rounded-xl shadow-sm px-3 py-3 text-xs font-medium text-gray-600 text-center"
          >
            Oppgaver
          </Link>
          <Link
            href="/rutiner"
            className="bg-white rounded-xl shadow-sm px-3 py-3 text-xs font-medium text-gray-600 text-center"
          >
            Rutiner
          </Link>
          <Link
            href="/bibliotek"
            className="bg-white rounded-xl shadow-sm px-3 py-3 text-xs font-medium text-gray-400 text-center"
          >
            Bibliotek
          </Link>
        </nav>
      </div>
    </main>
  );
}
