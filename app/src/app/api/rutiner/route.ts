import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { routines, routineLogs, domains } from "@/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";

function datoStreng(d: Date) {
  return d.toISOString().split("T")[0];
}

function beregnStreak(logger: { dato: string; fullført: boolean }[]): number {
  const fullførteDatoer = new Set(
    logger.filter((l) => l.fullført).map((l) => l.dato)
  );

  let streak = 0;
  const iDag = new Date();

  // Sjekk om i dag er fullført
  const iDagStr = datoStreng(iDag);
  let sjekkFra = fullførteDatoer.has(iDagStr) ? 0 : 1;

  for (let i = sjekkFra; i < 365; i++) {
    const dato = new Date(iDag);
    dato.setDate(dato.getDate() - i);
    const datoStr = datoStreng(dato);
    if (fullførteDatoer.has(datoStr)) {
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
  const dager = [];
  const iDag = new Date();
  for (let i = 13; i >= 0; i--) {
    const dato = new Date(iDag);
    dato.setDate(dato.getDate() - i);
    const datoStr = datoStreng(dato);
    dager.push({ dato: datoStr, fullført: fullførteDatoer.has(datoStr) });
  }
  return dager;
}

export async function GET() {
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

  const resultat = alleRutiner.map((r) => {
    const logger = alleLogger.filter((l) => l.routineId === r.id);
    const fullførtIdag = logger.some(
      (l) => l.dato === iDagStr && l.fullført
    );
    return {
      ...r,
      streak: beregnStreak(logger),
      graf: siste14Dager(logger),
      fullførtIdag,
    };
  });

  return NextResponse.json({ rutiner: resultat });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.navn) {
    return NextResponse.json({ feil: "Mangler navn" }, { status: 400 });
  }

  const alleDomener = await db.select().from(domains);
  const domene = alleDomener.find((d) => d.navn === body.domene);

  const [rutine] = await db
    .insert(routines)
    .values({
      domainId: domene?.id ?? null,
      navn: body.navn,
      beskrivelse: body.beskrivelse ?? null,
      tidspunkt: body.tidspunkt ?? "når_som_helst",
      type: body.type ?? "daglig",
      startDate: datoStreng(new Date()),
      sendVarsel: false,
    })
    .returning();

  return NextResponse.json({ rutine }, { status: 201 });
}
