export const dynamic = "force-dynamic";

import { db } from "@/db";
import { journalEntries, journalAnswers, journalImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { iDagOslo } from "@/lib/dato";
import JournalDagen from "@/components/JournalDagen";

export default async function JournalSide() {
  const dato = iDagOslo();

  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.dato, dato));

  let svar: Record<string, string> = {};
  let bildeUrl: string | null = null;

  if (entry) {
    const rader = await db
      .select()
      .from(journalAnswers)
      .where(eq(journalAnswers.entryId, entry.id));
    svar = Object.fromEntries(
      rader.map((r) => [r.questionKey, r.svar ?? ""])
    );

    const [bilde] = await db
      .select()
      .from(journalImages)
      .where(eq(journalImages.entryId, entry.id));
    bildeUrl = bilde?.url ?? null;
  }

  return (
    <JournalDagen
      dato={dato}
      entryId={entry?.id ?? null}
      sted={entry?.sted ?? ""}
      svar={svar}
      bildeUrl={bildeUrl}
    />
  );
}
