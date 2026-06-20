import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const milepælId = parseInt(id);
  const body = await req.json();

  const oppdatering: Record<string, unknown> = {};
  if (body.fullført !== undefined) oppdatering.fullført = body.fullført;
  if (body.navn !== undefined) oppdatering.navn = body.navn;
  if (body.forfall !== undefined) oppdatering.forfall = body.forfall;

  const [oppdatert] = await db
    .update(milestones)
    .set(oppdatering)
    .where(eq(milestones.id, milepælId))
    .returning();

  return NextResponse.json(oppdatert);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(milestones).where(eq(milestones.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}
