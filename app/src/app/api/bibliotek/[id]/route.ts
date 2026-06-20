import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { libraryItems, libraryThoughts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseInt(id);
  if (isNaN(itemId)) return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });

  const [item] = await db.select().from(libraryItems).where(eq(libraryItems.id, itemId));
  if (!item) return NextResponse.json({ feil: "Ikke funnet" }, { status: 404 });

  const tanker = await db
    .select()
    .from(libraryThoughts)
    .where(eq(libraryThoughts.itemId, itemId))
    .orderBy(libraryThoughts.opprettet);

  return NextResponse.json({ item, tanker });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseInt(id);
  if (isNaN(itemId)) return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });

  await db.delete(libraryThoughts).where(eq(libraryThoughts.itemId, itemId));
  await db.delete(libraryItems).where(eq(libraryItems.id, itemId));

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseInt(id);
  if (isNaN(itemId)) return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ feil: "Mangler body" }, { status: 400 });

  const oppdatering: Record<string, unknown> = {};
  if (body.tittel !== undefined) oppdatering.tittel = body.tittel ?? null;
  if (body.innhold !== undefined) oppdatering.innhold = body.innhold ?? null;
  if (body.favoritt !== undefined) oppdatering.favoritt = body.favoritt;
  if (body.leseStatus !== undefined) oppdatering.leseStatus = body.leseStatus;
  if (body.rating !== undefined) oppdatering.rating = body.rating;
  if (body.flaggetForReview !== undefined) oppdatering.flaggetForReview = body.flaggetForReview;
  if (body.domainId !== undefined) oppdatering.domainId = body.domainId ?? null;
  if (body.tags !== undefined) oppdatering.tags = Array.isArray(body.tags) ? body.tags : null;

  const [oppdatert] = await db
    .update(libraryItems)
    .set(oppdatering)
    .where(eq(libraryItems.id, itemId))
    .returning();

  return NextResponse.json({ item: oppdatert });
}
