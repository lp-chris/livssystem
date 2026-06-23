export const dynamic = "force-dynamic";

import { db } from "@/db";
import { apiUsage } from "@/db/schema";
import { desc } from "drizzle-orm";
import { hentIntegrasjonsstatus, type Tilstand } from "@/lib/integrasjonsstatus";
import { kostnadNok } from "@/lib/apiBruk";

const TILSTAND_FARGE: Record<Tilstand, string> = {
  ok: "#3a9d5d",
  advarsel: "#c8922a",
  feil: "#c4503e",
};

const TILSTAND_TEKST: Record<Tilstand, string> = {
  ok: "OK",
  advarsel: "Advarsel",
  feil: "Feil",
};

function kr(beløp: number): string {
  return beløp.toLocaleString("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function antall(n: number): string {
  return n.toLocaleString("nb-NO");
}

export default async function InnstillingerSide() {
  const [status, bruk] = await Promise.all([
    hentIntegrasjonsstatus(),
    db.select().from(apiUsage).orderBy(desc(apiUsage.opprettet)),
  ]);

  const nå = new Date();
  const startMåned = new Date(nå.getFullYear(), nå.getMonth(), 1);

  let totalKost = 0;
  let totalInn = 0;
  let totalUt = 0;
  let månedKost = 0;
  let månedAntall = 0;

  for (const r of bruk) {
    const k = kostnadNok({
      modell: r.modell,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
    });
    totalKost += k;
    totalInn += r.inputTokens;
    totalUt += r.outputTokens;
    if (r.opprettet >= startMåned) {
      månedKost += k;
      månedAntall += 1;
    }
  }

  const månedNavn = nå.toLocaleDateString("nb-NO", { month: "long" });

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-3xl md:px-10 md:pt-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          Innstillinger
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
          Koblinger og API-kostnader
        </p>
      </header>

      {/* Integrasjoner */}
      <section className="mb-10">
        <h2
          className="text-[11px] font-bold uppercase mb-3"
          style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
        >
          Koblinger
        </h2>
        <div className="space-y-2.5">
          {status.map((s) => (
            <div
              key={s.navn}
              className="flex items-start gap-3 p-3.5 rounded-[14px]"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="rounded-full flex-none mt-1.5"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: TILSTAND_FARGE[s.tilstand],
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: "var(--ink)" }}
                  >
                    {s.navn}
                  </span>
                  <span
                    className="text-[11px] font-semibold flex-none"
                    style={{ color: TILSTAND_FARGE[s.tilstand] }}
                  >
                    {TILSTAND_TEKST[s.tilstand]}
                  </span>
                </div>
                <p
                  className="text-[13px] mt-0.5 break-words"
                  style={{ color: "var(--muted)" }}
                >
                  {s.detalj}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* API-kostnader */}
      <section>
        <h2
          className="text-[11px] font-bold uppercase mb-3"
          style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
        >
          API-kostnader (Anthropic)
        </h2>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div
            className="p-4 rounded-[14px]"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="text-[11px] uppercase" style={{ color: "var(--muted)", letterSpacing: "0.08em" }}>
              {månedNavn}
            </div>
            <div className="text-2xl font-semibold mt-1" style={{ color: "var(--ink)" }}>
              {kr(månedKost)}
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--muted)" }}>
              {antall(månedAntall)} kall
            </div>
          </div>

          <div
            className="p-4 rounded-[14px]"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="text-[11px] uppercase" style={{ color: "var(--muted)", letterSpacing: "0.08em" }}>
              Totalt
            </div>
            <div className="text-2xl font-semibold mt-1" style={{ color: "var(--ink)" }}>
              {kr(totalKost)}
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--muted)" }}>
              {antall(bruk.length)} kall
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-[14px] text-[13px]"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
          }}
        >
          <div className="flex justify-between py-0.5">
            <span>Input-tokens totalt</span>
            <span style={{ color: "var(--ink)" }}>{antall(totalInn)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Output-tokens totalt</span>
            <span style={{ color: "var(--ink)" }}>{antall(totalUt)}</span>
          </div>
          <p className="mt-2 text-[12px]" style={{ color: "var(--muted)" }}>
            Kroner er et grovt anslag (Haiku 4.5: $1/$5 per million tokens,
            kurs ~11 kr/$). Kostnaden per fangst er typisk en brøkdel av et øre.
          </p>
        </div>
      </section>
    </main>
  );
}
