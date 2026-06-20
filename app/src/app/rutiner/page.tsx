export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { routines, routineLogs } from "@/db/schema";
import { gte } from "drizzle-orm";
import RutineKort from "@/components/RutineKort";
import NyRutineKnapp from "@/components/NyRutineKnapp";

function datoStreng(d: Date) {
  return d.toISOString().split("T")[0];
}

function beregnStreak(logger: { dato: string; fullført: boolean }[]): number {
  const fullførteDatoer = new Set(
    logger.filter((l) => l.fullført).map((l) => l.dato)
  );
  const iDag = new Date();
  const iDagStr = datoStreng(iDag);
  let streak = 0;
  const startOffset = fullførteDatoer.has(iDagStr) ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const dato = new Date(iDag);
    dato.setDate(dato.getDate() - i);
    if (fullførteDatoer.has(datoStreng(dato))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function siste14Dager(logger: { dato: string; fullført: boolean }[]) {
  const fullførteDatoer = new Set(
    logger.filter((l) => l.fullført).map((l) => l.dato)
  );
  const iDag = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const dato = new Date(iDag);
    dato.setDate(dato.getDate() - (13 - i));
    const datoStr = datoStreng(dato);
    return { dato: datoStr, fullført: fullførteDatoer.has(datoStr) };
  });
}

const tidspunktRekkefølge = ["morgen", "ettermiddag", "kveld", "når_som_helst"];
const tidspunktEtikett: Record<string, string> = {
  morgen: "Morgen",
  ettermiddag: "Ettermiddag",
  kveld: "Kveld",
  når_som_helst: "Når som helst",
};

export default async function RutinerSide() {
  const alleRutiner = await db
    .select()
    .from(routines)
    .orderBy(routines.tidspunkt, routines.navn);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  const alleLogger = await db
    .select()
    .from(routineLogs)
    .where(gte(routineLogs.dato, datoStreng(cutoff)));

  const iDagStr = datoStreng(new Date());

  const rutiner = alleRutiner.map((r) => {
    const logger = alleLogger.filter((l) => l.routineId === r.id);
    return {
      id: r.id,
      navn: r.navn,
      beskrivelse: r.beskrivelse,
      tidspunkt: r.tidspunkt,
      streak: beregnStreak(logger),
      graf: siste14Dager(logger),
      fullførtIdag: logger.some((l) => l.dato === iDagStr && l.fullført),
    };
  });

  const gruppert = tidspunktRekkefølge
    .map((tid) => ({
      tid,
      rutiner: rutiner.filter((r) => r.tidspunkt === tid),
    }))
    .filter((g) => g.rutiner.length > 0);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 text-sm">
              ← Hjem
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Rutiner</h1>
          </div>
          <NyRutineKnapp />
        </div>

        {rutiner.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-2">Ingen rutiner ennå.</p>
            <p className="text-gray-400 text-xs">
              Fang en rutine via fangst-feltet på hjemsiden, eller trykk +.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {gruppert.map(({ tid, rutiner: gruppe }) => (
              <section key={tid}>
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  {tidspunktEtikett[tid]}
                </h2>
                <div className="space-y-3">
                  {gruppe.map((r) => (
                    <RutineKort key={r.id} rutine={r} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
