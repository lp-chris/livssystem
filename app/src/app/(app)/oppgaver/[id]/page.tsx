export const dynamic = "force-dynamic";

import { db } from "@/db";
import { tasks, domains, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import OppgaveDetalj from "@/components/OppgaveDetalj";

export default async function OppgaveDetaljSide({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taskId = parseInt(id);
  if (isNaN(taskId)) notFound();

  const [oppgave] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!oppgave) notFound();

  const [alleDomener, alleProsjekter] = await Promise.all([
    db.select().from(domains).orderBy(domains.rekkefølge),
    db
      .select({ id: projects.id, navn: projects.navn, domainId: projects.domainId })
      .from(projects)
      .where(eq(projects.status, "aktiv"))
      .orderBy(projects.domainId, projects.navn),
  ]);

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto">
      <OppgaveDetalj oppgave={oppgave} domener={alleDomener} prosjekter={alleProsjekter} />
    </main>
  );
}
