import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseInt(id);
  if (isNaN(taskId)) {
    return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });
  }
  const [oppgave] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!oppgave) return NextResponse.json({ feil: "Ikke funnet" }, { status: 404 });
  return NextResponse.json({ oppgave });
}

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
  if (body.forfall !== undefined) oppdatering.forfall = body.forfall ?? null;
  if (body.tittel !== undefined) oppdatering.tittel = body.tittel;
  if (body.notat !== undefined) oppdatering.notat = body.notat ?? null;
  if (body.domainId !== undefined) oppdatering.domainId = body.domainId ?? null;

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
