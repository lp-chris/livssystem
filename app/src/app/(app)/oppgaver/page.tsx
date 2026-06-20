export const dynamic = "force-dynamic";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and, isNull, or } from "drizzle-orm";
import OppgaveKort from "@/components/OppgaveKort";

export default async function OppgaverSide() {
  const alleÅpne = await db
    .select()
    .from(tasks)
    .where(eq(tasks.status, "åpen"))
    .orderBy(tasks.forfall, tasks.prioritet);

  const topp3 = alleÅpne.filter((o) => o.topp3);
  const andre = alleÅpne.filter((o) => !o.topp3);

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          Oppgaver
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
          {alleÅpne.length} åpne
        </p>
      </header>

      {alleÅpne.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Ingen åpne oppgaver.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {topp3.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase mb-3"
              style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
            >
              Topp 3
            </h2>
            <div className="space-y-2">
              {topp3.map((o) => (
                <OppgaveKort key={o.id} oppgave={o} />
              ))}
            </div>
          </section>
        )}

        {andre.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase mb-3"
              style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
            >
              Øvrige
            </h2>
            <div className="space-y-2">
              {andre.map((o) => (
                <OppgaveKort key={o.id} oppgave={o} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
