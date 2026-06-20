import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseInt(id);
  if (isNaN(taskId)) {
    return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ feil: "Mangler body" }, { status: 400 });

  const oppdatering: Record<string, unknown> = {};
  if (body.status !== undefined) oppdatering.status = body.status;
  if (body.topp3 !== undefined) oppdatering.topp3 = body.topp3;
  if (body.prioritet !== undefined) oppdatering.prioritet = body.prioritet;
  if (body.forfall !== undefined) oppdatering.forfall = body.forfall;

  if (body.status === "gjort") {
    oppdatering.fullførtAt = new Date();
  }

  const [oppdatert] = await db
    .update(tasks)
    .set(oppdatering)
    .where(eq(tasks.id, taskId))
    .returning();

  return NextResponse.json({ oppgave: oppdatert });
}
