export const dynamic = "force-dynamic";

import { db } from "@/db";
import { tasks, domains } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { iDagOslo } from "@/lib/dato";
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

const PRIORITET_RANG: Record<string, number> = { høy: 0, normal: 1, lav: 2 };

function forfallTekst(forfall: string | null): { tekst: string; farge: string } {
  if (!forfall) return { tekst: "Ingen frist", farge: "var(--muted)" };
  const iDag = iDagOslo();
  if (forfall < iDag) return { tekst: `${forfall} ⚠`, farge: "#BE6B52" };
  if (forfall === iDag) return { tekst: "I dag", farge: "var(--hest)" };
  const d = new Date(forfall);
  return {
    tekst: d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }),
    farge: "var(--ink-3)",
  };
}

type Sortering = "forfall" | "prioritet" | "domene" | "opprettet";

function sorterOppgaver(
  oppgaver: Awaited<ReturnType<typeof hentÅpneOppgaver>>,
  domeneFraId: Record<number, { navn: string }>,
  sortering: Sortering
) {
  return [...oppgaver].sort((a, b) => {
    switch (sortering) {
      case "prioritet":
        return (PRIORITET_RANG[a.prioritet] ?? 1) - (PRIORITET_RANG[b.prioritet] ?? 1);
      case "domene": {
        const da = a.domainId ? (domeneFraId[a.domainId]?.navn ?? "") : "";
        const db2 = b.domainId ? (domeneFraId[b.domainId]?.navn ?? "") : "";
        return da.localeCompare(db2, "nb");
      }
      case "opprettet":
        return new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime();
      default: {
        if (!a.forfall && !b.forfall) return 0;
        if (!a.forfall) return 1;
        if (!b.forfall) return -1;
        return a.forfall.localeCompare(b.forfall);
      }
    }
  });
}

async function hentÅpneOppgaver() {
  return db.select().from(tasks).where(eq(tasks.status, "åpen"));
}

const SORTERINGER: { verdi: Sortering; etikett: string }[] = [
  { verdi: "forfall", etikett: "Forfall" },
  { verdi: "prioritet", etikett: "Prioritet" },
  { verdi: "domene", etikett: "Domene" },
  { verdi: "opprettet", etikett: "Nyeste" },
];

export default async function OppgaverSide({
  searchParams,
}: {
  searchParams: Promise<{ domene?: string; sorter?: string }>;
}) {
  const { domene: valgtDomeneNavn, sorter } = await searchParams;
  const sortering: Sortering =
    sorter === "prioritet" || sorter === "domene" || sorter === "opprettet"
      ? sorter
      : "forfall";

  const [alleÅpne, alleDomener] = await Promise.all([
    hentÅpneOppgaver(),
    db.select().from(domains).orderBy(asc(domains.rekkefølge)),
  ]);

  const domeneFraId = Object.fromEntries(alleDomener.map((d) => [d.id, d]));

  const valgtDomene = valgtDomeneNavn
    ? alleDomener.find((d) => d.navn === valgtDomeneNavn)
    : null;

  const filtrerte = valgtDomene
    ? alleÅpne.filter((o) => o.domainId === valgtDomene.id)
    : alleÅpne;

  const topp3 = filtrerte.filter((o) => o.topp3);
  const andre = sorterOppgaver(
    filtrerte.filter((o) => !o.topp3),
    domeneFraId,
    sortering
  );
  // Desktop-tabellen viser alle filtrerte i én liste – sorter den også
  const sorterte = sorterOppgaver(filtrerte, domeneFraId, sortering);

  function lagUrl(params: { domene?: string; sorter?: string }) {
    const p = new URLSearchParams();
    // Bruk ny verdi hvis den er oppgitt (tom streng = fjern), ellers behold gjeldende
    const nyDomene = params.domene !== undefined ? params.domene : valgtDomeneNavn;
    if (nyDomene) p.set("domene", nyDomene);
    const nySorter = params.sorter !== undefined ? params.sorter : sorter;
    if (nySorter) p.set("sorter", nySorter);
    const str = p.toString();
    return `/oppgaver${str ? `?${str}` : ""}`;
  }

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
      <div className="flex gap-2 flex-wrap mb-4">
        <Link
          href={lagUrl({ domene: "" })}
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
              href={aktiv ? lagUrl({ domene: "" }) : lagUrl({ domene: d.navn })}
              className="px-3 py-1.5 rounded-full text-[13px] font-medium min-h-[36px] flex items-center gap-1.5"
              style={{
                backgroundColor: aktiv ? "var(--ink)" : "var(--card)",
                color: aktiv ? "var(--surface)" : "var(--ink-3)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="rounded-full flex-none"
                style={{
                  width: 7,
                  height: 7,
                  backgroundColor: aktiv
                    ? "var(--surface)"
                    : `var(--${d.navn.toLowerCase()})`,
                }}
              />
              {d.navn}
            </Link>
          );
        })}
      </div>

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
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-[11px] font-bold uppercase"
                style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
              >
                Øvrige
              </h2>
              <div className="flex gap-1">
                {SORTERINGER.map((s) => (
                  <Link
                    key={s.verdi}
                    href={lagUrl({ sorter: s.verdi })}
                    className="text-[11px] px-2 py-1 rounded-full min-h-[28px] flex items-center"
                    style={{
                      backgroundColor:
                        sortering === s.verdi ? "var(--ink)" : "var(--card)",
                      color:
                        sortering === s.verdi ? "var(--surface)" : "var(--muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {s.etikett}
                  </Link>
                ))}
              </div>
            </div>
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
            <div className="text-[11px] font-bold uppercase" style={{ letterSpacing: "0.06em", color: "var(--muted)" }}>Oppgave</div>
            {[
              { verdi: "domene" as Sortering, etikett: "Domene" },
              { verdi: "forfall" as Sortering, etikett: "Forfall" },
              { verdi: "prioritet" as Sortering, etikett: "Prioritet" },
            ].map((kol) => (
              <Link
                key={kol.verdi}
                href={lagUrl({ sorter: kol.verdi })}
                className="text-[11px] font-bold uppercase flex items-center gap-1"
                style={{
                  letterSpacing: "0.06em",
                  color: sortering === kol.verdi ? "var(--ink)" : "var(--muted)",
                }}
              >
                {kol.etikett}
                {sortering === kol.verdi && <span>↑</span>}
              </Link>
            ))}
          </div>

          {sorterte.map((o, i) => {
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
                    border: o.topp3 ? "2px solid var(--hest)" : "1.8px solid var(--border)",
                    flexShrink: 0,
                  }}
                />
                <div className="text-[15px] font-medium truncate" style={{ color: "var(--ink)" }}>
                  {o.tittel}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-3)" }}>
                  {domene && (
                    <div
                      className="rounded-full flex-none"
                      style={{ width: 8, height: 8, backgroundColor: `var(--${domene.navn.toLowerCase()})` }}
                    />
                  )}
                  {domene?.navn ?? "—"}
                </div>
                <div className="text-sm font-medium" style={{ color: forfallF }}>{forfallT}</div>
                <div className="text-[13px] font-semibold" style={{ color: PRIORITET_FARGE[o.prioritet] }}>
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
