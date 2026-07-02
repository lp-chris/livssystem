import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, libraryItems, journalEntries, journalAnswers } from "@/db/schema";
import { ilike, or, eq, and, desc } from "drizzle-orm";

// Plukk linjen som faktisk inneholder treffet som utdrag
function utdragRundtTreff(tekst: string, q: string): string {
  const linjer = tekst
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const treff = linjer.find((l) => l.toLowerCase().includes(q.toLowerCase()));
  return (treff ?? linjer[0] ?? "").slice(0, 140);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ oppgaver: [], bibliotek: [], journal: [] });
  }

  const mønster = `%${q}%`;

  const oppgaver = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.status, "åpen"),
        or(ilike(tasks.tittel, mønster), ilike(tasks.notat, mønster))
      )
    )
    .limit(20);

  const bibliotek = await db
    .select()
    .from(libraryItems)
    .where(
      or(
        ilike(libraryItems.tittel, mønster),
        ilike(libraryItems.innhold, mønster),
        ilike(libraryItems.kilde, mønster),
        ilike(libraryItems.forfatter, mønster)
      )
    )
    .limit(20);

  // Daglig journal: søk i svarene, returner én rad per dag
  const journalRader = await db
    .select({
      dato: journalEntries.dato,
      svar: journalAnswers.svar,
    })
    .from(journalAnswers)
    .innerJoin(journalEntries, eq(journalAnswers.entryId, journalEntries.id))
    .where(ilike(journalAnswers.svar, mønster))
    .orderBy(desc(journalEntries.dato))
    .limit(40);

  const perDag = new Map<string, string>();
  for (const r of journalRader) {
    if (!perDag.has(r.dato)) {
      perDag.set(r.dato, utdragRundtTreff(r.svar ?? "", q));
    }
  }
  const journal = [...perDag]
    .slice(0, 20)
    .map(([dato, utdrag]) => ({ dato, utdrag }));

  return NextResponse.json({ oppgaver, bibliotek, journal });
}
