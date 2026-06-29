import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { iDagOslo } from "@/lib/dato";

// POST: get-or-create dagens entry (idempotent via unik dato).
// Entry opprettes først når brukeren faktisk lagrer noe, så dager
// man bare kikker innom forblir tomme (og månedsoppslaget rent).
export async function POST() {
  const dato = iDagOslo();

  const [eksisterende] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.dato, dato));

  if (eksisterende) {
    return NextResponse.json({ entry: eksisterende });
  }

  const [ny] = await db
    .insert(journalEntries)
    .values({ dato })
    .onConflictDoNothing()
    .returning();

  // onConflictDoNothing kan gi tomt resultat ved race — hent på nytt da.
  if (!ny) {
    const [igjen] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.dato, dato));
    return NextResponse.json({ entry: igjen });
  }

  return NextResponse.json({ entry: ny }, { status: 201 });
}
