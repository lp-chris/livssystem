export const dynamic = "force-dynamic";

import { db } from "@/db";
import { tasks, domains } from "@/db/schema";
import { eq } from "drizzle-orm";
import OppgaveKort from "@/components/OppgaveKort";
import NyOppgaveKnapp from "@/components/NyOppgaveKnapp";
import SisteFangster from "@/components/SisteFangster";
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

export default async function OppgaverSide({
  searchParams,
}: {
  searchParams: Promise<{ domene?: string }>;
}) {
  const { domene: valgtDomeneNavn } = await searchParams;

  const [alleÅpne, alleDomener] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "åpen"))
      .orderBy(tasks.forfall, tasks.prioritet),
    db.select().from(domains).orderBy(domains.rekkefølge),
  ]);

  const domeneFraId = Object.fromEntries(alleDomener.map((d) => [d.id, d]));

  const valgtDomene = valgtDomeneNavn
    ? alleDomener.find((d) => d.navn === valgtDomeneNavn)
    : null;

  const filtrerte = valgtDomene
    ? alleÅpne.filter((o) => o.domainId === valgtDomene.id)
    : alleÅpne;

  const topp3 = filtrerte.filter((o) => o.topp3);
  const andre = filtrerte.filter((o) => !o.topp3);

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-none md:px-10 md:pt-10">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
            Oppgaver
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {filtrerte.length} åpne{valgtDomene ? ` · ${valgtDomene.navn}` : ""}
          </p>
        </div>
        <NyOppgaveKnapp />
      </header>

      {/* Domenefiltere */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Link
          href="/oppgaver"
          className="px-3 py-1.5 rounded-full text-[13px] font-medium min-h-[36px] flex items-center"
          style={{
            backgroundColor: !valgtDomene ? "var(--ink)" : "var(--card)",
            color: !valgtDomene ? "var(--surface)" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          Alle
        </Link>
        {alleDomener.map((d) => {
          const aktiv = valgtDomene?.id === d.id;
          return (
            <Link
              key={d.id}
              href={aktiv ? "/oppgaver" : `/oppgaver?domene=${d.navn}`}
              className="px-3 py-1.5 rounded-full text-[13px] font-medium min-h-[36px] flex items-center gap-1.5"
              style={{
                backgroundColor: aktiv ? "var(--ink)" : "var(--card)",
                color: aktiv ? "var(--surface)" : "var(--ink-3)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="rounded-full"
                style={{
                  width: 7,
                  height: 7,
                  backgroundColor: aktiv
                    ? "var(--surface)"
                    : `var(--${d.navn.toLowerCase()})`,
                  flexShrink: 0,
                }}
              />
              {d.navn}
            </Link>
          );
        })}
      </div>

      <SisteFangster />

      {filtrerte.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Ingen åpne oppgaver{valgtDomene ? ` i ${valgtDomene.navn}` : ""}.
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
      {filtrerte.length > 0 && (
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
          {filtrerte.map((o, i) => {
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
