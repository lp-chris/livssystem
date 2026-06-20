export const dynamic = "force-dynamic";

import { db } from "@/db";
import { projects, domains } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import NyttProsjektSkjema from "@/components/NyttProsjektSkjema";

const DOMENE_FARGE: Record<string, string> = {
  Meg: "var(--meg)",
  Oss: "var(--oss)",
  Stall: "var(--stall)",
  Hest: "var(--hest)",
};

export default async function ProsjekterSide() {
  const alleDomener = await db.select().from(domains).orderBy(domains.rekkefølge);

  const alleProsjekter = await db
    .select({
      id: projects.id,
      navn: projects.navn,
      type: projects.type,
      endDate: projects.endDate,
      domainId: projects.domainId,
      totalMilepæler: sql<number>`(select count(*) from milestones m where m.project_id = ${projects.id})`,
      fullførtMilepæler: sql<number>`(select count(*) from milestones m where m.project_id = ${projects.id} and m.fullfort = true)`,
    })
    .from(projects)
    .where(eq(projects.status, "aktiv"))
    .orderBy(projects.domainId, projects.opprettet);

  const gruppert = alleDomener.map((d) => ({
    domene: d,
    prosjekter: alleProsjekter.filter((p) => p.domainId === d.id),
  }));

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-3xl md:px-10 md:pt-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          Prosjekter
        </h1>
        <NyttProsjektSkjema domener={alleDomener} />
      </header>

      <div className="space-y-8">
        {gruppert.map(({ domene, prosjekter }) => (
          <section key={domene.id}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: DOMENE_FARGE[domene.navn] ?? "var(--muted)" }}
              />
              <h2
                className="text-[11px] font-bold uppercase"
                style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
              >
                {domene.navn}
              </h2>
            </div>

            {prosjekter.length === 0 ? (
              <p className="text-sm pl-4" style={{ color: "var(--muted)" }}>
                Ingen aktive prosjekter
              </p>
            ) : (
              <div className="space-y-2">
                {prosjekter.map((p) => {
                  const total = Number(p.totalMilepæler);
                  const fullført = Number(p.fullførtMilepæler);
                  const prosent = total > 0 ? Math.round((fullført / total) * 100) : null;

                  return (
                    <Link
                      key={p.id}
                      href={`/prosjekter/${p.id}`}
                      className="block px-4 py-3 rounded-[18px]"
                      style={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                          {p.navn}
                        </p>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: "var(--surface)",
                            color: "var(--muted)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {p.type === "område" ? "Område" : "Prosjekt"}
                        </span>
                      </div>

                      {prosent !== null && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                              {fullført}/{total} milepæler
                            </span>
                            <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                              {prosent}%
                            </span>
                          </div>
                          <div
                            className="h-1 rounded-full overflow-hidden"
                            style={{ backgroundColor: "var(--border)" }}
                          >
                            <div
                              className="h-1 rounded-full"
                              style={{
                                width: `${prosent}%`,
                                backgroundColor:
                                  DOMENE_FARGE[domene.navn] ?? "var(--muted)",
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {p.endDate && (
                        <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
                          Frist: {new Date(p.endDate).toLocaleDateString("nb-NO")}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
