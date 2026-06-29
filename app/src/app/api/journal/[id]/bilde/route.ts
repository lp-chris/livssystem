import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries, journalImages } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST: sett/erstatt dagens bilde (ett pr dag). Tar { url } = komprimert data-URL.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entryId = parseInt(id);
  if (isNaN(entryId)) {
    return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.url || typeof body.url !== "string") {
    return NextResponse.json({ feil: "Mangler bilde" }, { status: 400 });
  }

  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.id, entryId));
  if (!entry) return NextResponse.json({ feil: "Ikke funnet" }, { status: 404 });

  // Ett bilde pr dag — fjern eksisterende først.
  await db.delete(journalImages).where(eq(journalImages.entryId, entryId));
  const [bilde] = await db
    .insert(journalImages)
    .values({ entryId, url: body.url })
    .returning();

  await db
    .update(journalEntries)
    .set({ oppdatert: new Date() })
    .where(eq(journalEntries.id, entryId));

  return NextResponse.json({ bilde }, { status: 201 });
}

// DELETE: fjern dagens bilde.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entryId = parseInt(id);
  if (isNaN(entryId)) {
    return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });
  }
  await db.delete(journalImages).where(eq(journalImages.entryId, entryId));
  return NextResponse.json({ ok: true });
}
