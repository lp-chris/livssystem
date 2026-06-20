import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, milestones, domains } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const alle = await db
    .select({
      id: projects.id,
      navn: projects.navn,
      beskrivelse: projects.beskrivelse,
      type: projects.type,
      status: projects.status,
      startDate: projects.startDate,
      endDate: projects.endDate,
      domainId: projects.domainId,
      totalMilepæler: sql<number>`(select count(*) from milestones m where m.project_id = ${projects.id})`,
      fullførtMilepæler: sql<number>`(select count(*) from milestones m where m.project_id = ${projects.id} and m.fullfort = true)`,
    })
    .from(projects)
    .where(eq(projects.status, "aktiv"))
    .orderBy(projects.domainId, projects.opprettet);

  return NextResponse.json(alle);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { navn, beskrivelse, type, domainId, endDate } = body;

  if (!navn || !domainId) {
    return NextResponse.json({ feil: "Navn og domene er påkrevd" }, { status: 400 });
  }

  const [nytt] = await db
    .insert(projects)
    .values({
      navn,
      beskrivelse: beskrivelse || null,
      type: type || "prosjekt",
      domainId,
      endDate: endDate || null,
    })
    .returning();

  return NextResponse.json(nytt, { status: 201 });
}
