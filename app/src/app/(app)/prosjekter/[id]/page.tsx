export const dynamic = "force-dynamic";

import { db } from "@/db";
import { projects, milestones, tasks, domains } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProsjektDetalj from "@/components/ProsjektDetalj";

export default async function ProsjektDetaljSide({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prosjektId = parseInt(id);

  const [prosjekt] = await db.select().from(projects).where(eq(projects.id, prosjektId));
  if (!prosjekt) notFound();

  const [domene] = await db.select().from(domains).where(eq(domains.id, prosjekt.domainId));

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

  return (
    <ProsjektDetalj
      prosjekt={prosjekt}
      domene={domene}
      milepæler={alleMilepæler}
      oppgaver={alleOppgaver}
    />
  );
}
