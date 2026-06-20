import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

function nesteForfall(regel: string, nåværendeForfall: string | null): string {
  const base = nåværendeForfall ? new Date(nåværendeForfall) : new Date();
  if (regel === "daglig") {
    base.setDate(base.getDate() + 1);
  } else if (regel === "ukentlig") {
    base.setDate(base.getDate() + 7);
  } else if (regel === "månedlig") {
    base.setMonth(base.getMonth() + 1);
  } else if (regel.startsWith("hver-")) {
    const dager = parseInt(regel.replace("hver-", "").replace("-dager", ""));
    if (!isNaN(dager)) base.setDate(base.getDate() + dager);
  }
  return base.toISOString().split("T")[0];
}

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

  // Fetch task first so we have recurring rule when marking done
  const [original] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!original) return NextResponse.json({ feil: "Ikke funnet" }, { status: 404 });

  const oppdatering: Record<string, unknown> = {};
  if (body.status !== undefined) oppdatering.status = body.status;
  if (body.topp3 !== undefined) oppdatering.topp3 = body.topp3;
  if (body.prioritet !== undefined) oppdatering.prioritet = body.prioritet;
  if (body.forfall !== undefined) oppdatering.forfall = body.forfall ?? null;
  if (body.tittel !== undefined) oppdatering.tittel = body.tittel;
  if (body.notat !== undefined) oppdatering.notat = body.notat ?? null;
  if (body.domainId !== undefined) oppdatering.domainId = body.domainId ?? null;
  if (body.tilbakevendendeRegel !== undefined)
    oppdatering.tilbakevendendeRegel = body.tilbakevendendeRegel ?? null;

  if (body.status === "gjort") {
    oppdatering.fullførtAt = new Date();
  }

  const [oppdatert] = await db
    .update(tasks)
    .set(oppdatering)
    .where(eq(tasks.id, taskId))
    .returning();

  // Create next occurrence if recurring and just marked done
  const regel = original.tilbakevendendeRegel;
  if (body.status === "gjort" && regel) {
    const nesteDato = nesteForfall(regel, original.forfall);
    await db.insert(tasks).values({
      domainId: original.domainId,
      projectId: original.projectId,
      tittel: original.tittel,
      notat: original.notat,
      prioritet: original.prioritet,
      topp3: false,
      tilbakevendendeRegel: regel,
      forfall: nesteDato,
      status: "åpen",
    });
  }

  return NextResponse.json({ oppgave: oppdatert });
}
