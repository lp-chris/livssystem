export const dynamic = "force-dynamic";

import { db } from "@/db";
import { tasks, domains } from "@/db/schema";
import { eq } from "drizzle-orm";
import OppgaveKort from "@/components/OppgaveKort";
import NyOppgaveKnapp from "@/components/NyOppgaveKnapp";
import Link from "next/link";

const PRIORITET_FARGE: Record<string, string> = {
  høy: "#BE6B52",
  normal: "#A98748",
  lav: "#A39E93",
};

const PRIORITET_ETIKETT: Record<string, string> = {
  høy: "Høy",
  normal: "Normal",
  lav: "Lav",
};

function forfallTekst(forfall: string | null): { tekst: string; farge: string } {
  if (!forfall) return { tekst: "Ingen frist", farge: "var(--muted)" };
  const iDag = new Date().toISOString().split("T")[0];
  if (forfall < iDag)
    return { tekst: `${forfall} ⚠`, farge: "#BE6B52" };
  if (forfall === iDag) return { tekst: "I dag", farge: "var(--hest)" };
  const d = new Date(forfall);
  const tekst = d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  return { tekst, farge: "var(--ink-3)" };
}

export default async function OppgaverSide() {
  const [alleÅpne, alleDomener] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "åpen"))
      .orderBy(tasks.forfall, tasks.prioritet),
    db.select().from(domains).orderBy(domains.rekkefølge),
  ]);

  const domeneFraId = Object.fromEntries(alleDomener.map((d) => [d.id, d]));

  const topp3 = alleÅpne.filter((o) => o.topp3);
  const andre = alleÅpne.filter((o) => !o.topp3);

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-none md:px-10 md:pt-10">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
            Oppgaver
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {alleÅpne.length} åpne
          </p>
        </div>
        <NyOppgaveKnapp />
      </header>

      {alleÅpne.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Ingen åpne oppgaver.
          </p>
        </div>
      )}

      {/* Mobil: kortvisning */}
      <div className="md:hidden space-y-8">
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

      {/* Desktop: tabellvisning */}
      {alleÅpne.length > 0 && (
        <div
          className="hidden md:block rounded-[16px] overflow-hidden"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Kolonneheader */}
          <div
            className="grid items-center px-5 py-3"
            style={{
              gridTemplateColumns: "28px 1fr 140px 130px 90px",
              gap: 16,
              backgroundColor: "var(--surface)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div />
            <div
              className="text-[11px] font-bold uppercase"
              style={{ letterSpacing: "0.06em", color: "var(--muted)" }}
            >
              Oppgave
            </div>
            <div
              className="text-[11px] font-bold uppercase"
              style={{ letterSpacing: "0.06em", color: "var(--muted)" }}
            >
              Domene
            </div>
            <div
              className="text-[11px] font-bold uppercase"
              style={{ letterSpacing: "0.06em", color: "var(--muted)" }}
            >
              Forfall
            </div>
            <div
              className="text-[11px] font-bold uppercase"
              style={{ letterSpacing: "0.06em", color: "var(--muted)" }}
            >
              Prioritet
            </div>
          </div>

          {/* Rader */}
          {alleÅpne.map((o, i) => {
            const domene = o.domainId ? domeneFraId[o.domainId] : null;
            const { tekst: forfallT, farge: forfallF } = forfallTekst(o.forfall);
            return (
              <Link
                key={o.id}
                href={`/oppgaver/${o.id}`}
                className="grid items-center px-5 py-4 transition-colors hover:bg-[var(--surface)]"
                style={{
                  gridTemplateColumns: "28px 1fr 140px 130px 90px",
                  gap: 16,
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                <div
                  className="rounded-full flex-none"
                  style={{
                    width: 24,
                    height: 24,
                    border: o.topp3
                      ? "2px solid var(--hest)"
                      : "1.8px solid var(--border)",
                    flexShrink: 0,
                  }}
                />
                <div
                  className="text-[15px] font-medium truncate"
                  style={{ color: "var(--ink)" }}
                >
                  {o.tittel}
                </div>
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--ink-3)" }}
                >
                  {domene && (
                    <div
                      className="rounded-full flex-none"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: `var(--${domene.navn.toLowerCase()})`,
                      }}
                    />
                  )}
                  {domene?.navn ?? "—"}
                </div>
                <div className="text-sm font-medium" style={{ color: forfallF }}>
                  {forfallT}
                </div>
                <div
                  className="text-[13px] font-semibold"
                  style={{ color: PRIORITET_FARGE[o.prioritet] }}
                >
                  {PRIORITET_ETIKETT[o.prioritet]}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
