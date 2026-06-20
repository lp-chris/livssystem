import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, milestones, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prosjektId = parseInt(id);

  const [prosjekt] = await db.select().from(projects).where(eq(projects.id, prosjektId));
  if (!prosjekt) return NextResponse.json({ feil: "Ikke funnet" }, { status: 404 });

  const alleMilepæler = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, prosjektId))
    .orderBy(milestones.rekkefølge, milestones.id);

  const alleOppgaver = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, prosjektId))
    .orderBy(tasks.status, tasks.forfall);

  return NextResponse.json({ prosjekt, milepæler: alleMilepæler, oppgaver: alleOppgaver });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prosjektId = parseInt(id);
  const body = await req.json();

  const oppdatering: Record<string, unknown> = {};
  if (body.navn !== undefined) oppdatering.navn = body.navn;
  if (body.beskrivelse !== undefined) oppdatering.beskrivelse = body.beskrivelse;
  if (body.status !== undefined) oppdatering.status = body.status;
  if (body.endDate !== undefined) oppdatering.endDate = body.endDate;

  const [oppdatert] = await db
    .update(projects)
    .set(oppdatering)
    .where(eq(projects.id, prosjektId))
    .returning();

  return NextResponse.json(oppdatert);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prosjektId = parseInt(id);

  await db.delete(milestones).where(eq(milestones.projectId, prosjektId));
  await db
    .update(tasks)
    .set({ projectId: null, milestoneId: null })
    .where(eq(tasks.projectId, prosjektId));
  await db.delete(projects).where(eq(projects.id, prosjektId));

  return NextResponse.json({ ok: true });
}
