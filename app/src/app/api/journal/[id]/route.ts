import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries, journalAnswers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const GYLDIGE_NOKLER = [
  "morning.gratitude",
  "morning.great_day",
  "morning.affirmation",
  "evening.went_well",
  "capture.reflection",
];

// PATCH: autosave. Tar enten { questionKey, svar } (upsert i journal_answers)
// eller { sted } (oppdaterer entryen). Skrives ved hvert feltbytte/blur.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entryId = parseInt(id);
  if (isNaN(entryId)) {
    return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ feil: "Mangler body" }, { status: 400 });

  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.id, entryId));
  if (!entry) return NextResponse.json({ feil: "Ikke funnet" }, { status: 404 });

  // Sted
  if (body.sted !== undefined) {
    await db
      .update(journalEntries)
      .set({ sted: body.sted || null, oppdatert: new Date() })
      .where(eq(journalEntries.id, entryId));
  }

  // Svar (upsert på entry + questionKey)
  if (body.questionKey !== undefined) {
    if (!GYLDIGE_NOKLER.includes(body.questionKey)) {
      return NextResponse.json({ feil: "Ugyldig spørsmål" }, { status: 400 });
    }
    const svar = typeof body.svar === "string" ? body.svar : "";

    const [eksisterende] = await db
      .select()
      .from(journalAnswers)
      .where(
        and(
          eq(journalAnswers.entryId, entryId),
          eq(journalAnswers.questionKey, body.questionKey)
        )
      );

    if (eksisterende) {
      await db
        .update(journalAnswers)
        .set({ svar })
        .where(eq(journalAnswers.id, eksisterende.id));
    } else {
      await db
        .insert(journalAnswers)
        .values({ entryId, questionKey: body.questionKey, svar });
    }

    await db
      .update(journalEntries)
      .set({ oppdatert: new Date() })
      .where(eq(journalEntries.id, entryId));
  }

  return NextResponse.json({ ok: true });
}
