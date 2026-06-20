import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, domains } from "@/db/schema";
import { eq, and, lte, isNotNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const iDagStr = new Date().toISOString().split("T")[0];

  let query = db
    .select()
    .from(tasks)
    .where(eq(tasks.status, "åpen"))
    .$dynamic();

  if (filter === "topp3") {
    query = query.where(and(eq(tasks.status, "åpen"), eq(tasks.topp3, true)));
  } else if (filter === "haster") {
    query = query.where(
      and(
        eq(tasks.status, "åpen"),
        isNotNull(tasks.forfall),
        lte(tasks.forfall, iDagStr)
      )
    );
  }

  const resultat = await query.orderBy(tasks.forfall, tasks.prioritet);
  return NextResponse.json({ oppgaver: resultat });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.tittel) {
    return NextResponse.json({ feil: "Mangler tittel" }, { status: 400 });
  }

  const alleDomener = await db.select().from(domains);
  const domene = alleDomener.find((d) => d.navn === body.domene);

  const [oppgave] = await db
    .insert(tasks)
    .values({
      domainId: domene?.id ?? null,
      tittel: body.tittel,
      notat: body.notat ?? null,
      prioritet: body.prioritet ?? "normal",
      forfall: body.forfall ?? null,
      topp3: body.topp3 ?? false,
      status: "åpen",
    })
    .returning();

  return NextResponse.json({ oppgave }, { status: 201 });
}
