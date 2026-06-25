import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { libraryItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let query = db
    .select()
    .from(libraryItems)
    .orderBy(desc(libraryItems.opprettet))
    .$dynamic();

  if (type && ["notat", "sitat", "bok"].includes(type)) {
    query = query.where(eq(libraryItems.type, type as "notat" | "sitat" | "bok"));
  }

  const items = await query;
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.type) return NextResponse.json({ feil: "Mangler type" }, { status: 400 });

  const [item] = await db
    .insert(libraryItems)
    .values({
      type: body.type,
      tittel: body.tittel ?? null,
      innhold: body.innhold ?? null,
      kilde: body.kilde ?? null,
      forfatter: body.forfatter ?? null,
      omslagUrl: body.omslagUrl ?? null,
      isbn: body.isbn ?? null,
      leseStatus: body.leseStatus ?? null,
      format: body.format ?? null,
      rating: body.rating ?? null,
      sammendrag: body.sammendrag ?? null,
      domainId: body.domainId ?? null,
      tags: body.tags ?? null,
    })
    .returning();

  return NextResponse.json({ item }, { status: 201 });
}
