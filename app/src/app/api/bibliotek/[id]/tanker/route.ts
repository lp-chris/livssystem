import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { libraryThoughts } from "@/db/schema";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseInt(id);
  if (isNaN(itemId)) return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body?.tekst?.trim()) return NextResponse.json({ feil: "Mangler tekst" }, { status: 400 });

  const [tanke] = await db
    .insert(libraryThoughts)
    .values({ itemId, tekst: body.tekst.trim() })
    .returning();

  return NextResponse.json({ tanke }, { status: 201 });
}
