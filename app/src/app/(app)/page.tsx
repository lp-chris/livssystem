export const dynamic = "force-dynamic";

import { db } from "@/db";
import {
  tasks,
  routines,
  routineLogs,
  libraryItems,
  journalEntries,
  journalAnswers,
} from "@/db/schema";
import { eq, and, lte, isNotNull, sql } from "drizzle-orm";
import { iDagOslo } from "@/lib/dato";
import LoggUtKnapp from "@/components/LoggUtKnapp";
import Link from "next/link";
import Topp3 from "@/components/Topp3";
import DetSomHaster from "@/components/DetSomHaster";
import DagensRutiner from "@/components/DagensRutiner";
import Resurfacing from "@/components/Resurfacing";
import KalenderIDag from "@/components/KalenderIDag";

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

  // Dagens journal — har morgenrefleksjonen blitt startet?
  const [journalEntry] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.dato, iDagOslo()));
  let journalStartet = false;
  if (journalEntry) {
    const [gratitude] = await db
      .select()
      .from(journalAnswers)
      .where(
        and(
          eq(journalAnswers.entryId, journalEntry.id),
          eq(journalAnswers.questionKey, "morning.gratitude")
        )
      );
    journalStartet = (gratitude?.svar ?? "").trim().length > 0;
  }

  const resurfacingItem = tilfeldigItem[0] ?? null;
  const topp3Ids = new Set(topp3.map((o) => o.id));
  const hasterFiltrert = haster.filter((o) => !topp3Ids.has(o.id));

  const dagString = new Date().toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="pb-40 px-4 pt-5 max-w-md mx-auto md:max-w-none md:px-10 md:pt-10">
      {/* Hilsen */}
      <header className="mb-5 flex items-start justify-between">
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
          <Link
            href="/innstillinger"
            aria-label="Innstillinger"
            className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full"
            style={{ color: "var(--muted)", fontSize: 20 }}
          >
            ⚙
          </Link>
          <LoggUtKnapp />
        </div>
      </header>

      {/* Mobil: én kolonne / Desktop: to kolonner */}
      <div className="md:grid md:grid-cols-2 md:gap-5 space-y-5 md:space-y-0">
        {/* Venstre kolonne */}
        <div className="space-y-5">
          <Topp3 oppgaver={topp3} />
          {dagensRutiner.length > 0 && (
            <DagensRutiner rutiner={dagensRutiner} />
          )}
        </div>

        {/* Høyre kolonne */}
        <div className="space-y-5">
          <DetSomHaster oppgaver={hasterFiltrert} />
          <KalenderIDag />
          <Link
            href="/journal"
            className="flex items-center justify-between px-4 py-4 rounded-[18px]"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <p
                className="text-[11px] font-semibold uppercase"
                style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
              >
                Dagens journal
              </p>
              <p className="text-sm mt-0.5" style={{ color: "var(--ink)" }}>
                {journalStartet
                  ? "Fortsett dagens notat"
                  : "Skriv morgenrefleksjonen"}
              </p>
            </div>
            <span style={{ color: "var(--muted)", fontSize: 18 }}>→</span>
          </Link>
        </div>
      </div>

      {/* Resurfacing — full bredde under */}
      <div className="mt-6">
        <Resurfacing item={resurfacingItem} />
      </div>
    </main>
  );
}
