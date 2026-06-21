import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prosjektId = parseInt(id);
  const body = await req.json();

  if (!body.navn) {
    return NextResponse.json({ feil: "Navn er påkrevd" }, { status: 400 });
  }

  try {
    const [maxRekke] = await db
      .select({ max: sql<number>`coalesce(max(rekkefolge), 0)::int` })
      .from(milestones)
      .where(eq(milestones.projectId, prosjektId));

    const [ny] = await db
      .insert(milestones)
      .values({
        projectId: prosjektId,
        navn: body.navn,
        forfall: body.forfall || null,
        rekkefølge: Number(maxRekke?.max ?? 0) + 1,
      })
      .returning();

    return NextResponse.json(ny, { status: 201 });
  } catch (e) {
    console.error("Milepæl insert feil:", e);
    return NextResponse.json({ feil: String(e) }, { status: 500 });
  }
}
