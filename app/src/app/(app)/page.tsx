export const dynamic = "force-dynamic";

import { db } from "@/db";
import { tasks, routines, routineLogs, libraryItems } from "@/db/schema";
import { eq, and, lte, isNotNull, sql } from "drizzle-orm";
import LoggUtKnapp from "@/components/LoggUtKnapp";
import Link from "next/link";
import Topp3 from "@/components/Topp3";
import DetSomHaster from "@/components/DetSomHaster";
import DagensRutiner from "@/components/DagensRutiner";
import Resurfacing from "@/components/Resurfacing";

function datoStreng(d: Date) {
  return d.toISOString().split("T")[0];
}

function hilsen(): string {
  const time = new Date().getHours();
  if (time < 12) return "God morgen";
  if (time < 17) return "God ettermiddag";
  return "God kveld";
}

export default async function IDag() {
  const iDagStr = datoStreng(new Date());

  const [topp3, haster, alleRutiner, logger, tilfeldigItem] = await Promise.all([
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

    db.select().from(routineLogs).where(eq(routineLogs.dato, iDagStr)),

    db.select().from(libraryItems).orderBy(sql`RANDOM()`).limit(1),
  ]);

  const dagensRutiner = alleRutiner.map((r) => ({
    id: r.id,
    navn: r.navn,
    tidspunkt: r.tidspunkt,
    fullførtIdag: logger.some((l) => l.routineId === r.id && l.fullført),
  }));

  const resurfacingItem = tilfeldigItem[0] ?? null;
  const topp3Ids = new Set(topp3.map((o) => o.id));
  const hasterFiltrert = haster.filter((o) => !topp3Ids.has(o.id));

  const dagString = new Date().toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto">
      {/* Hilsen */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--ink)" }}
          >
            {hilsen()}, Lars
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {dagString}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sok"
            aria-label="Søk"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full"
            style={{ color: "var(--muted)", fontSize: 20 }}
          >
            🔍
          </Link>
          <LoggUtKnapp />
        </div>
      </header>

      <div className="space-y-6">
        {/* Topp 3 */}
        <section>
          <h2
            className="text-[11px] font-bold uppercase mb-2"
            style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
          >
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
      </div>
    </main>
  );
}
