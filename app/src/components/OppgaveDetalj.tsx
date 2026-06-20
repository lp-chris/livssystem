"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Oppgave = {
  id: number;
  tittel: string;
  notat: string | null;
  prioritet: string;
  forfall: string | null;
  topp3: boolean;
  domainId: number | null;
  status: string;
  tilbakevendendeRegel: string | null;
};

const GJENTAGELSE_VALG = [
  { verdi: null, etikett: "Aldri" },
  { verdi: "daglig", etikett: "Daglig" },
  { verdi: "ukentlig", etikett: "Ukentlig" },
  { verdi: "hver-14-dager", etikett: "Annenhver uke" },
  { verdi: "månedlig", etikett: "Månedlig" },
];

type Domene = {
  id: number;
  navn: string;
  farge: string;
};

const PRIORITET_ETIKETT: Record<string, string> = {
  lav: "Lav",
  normal: "Normal",
  høy: "Høy",
};

export default function OppgaveDetalj({
  oppgave: init,
  domener,
}: {
  oppgave: Oppgave;
  domener: Domene[];
}) {
  const [oppgave, setOppgave] = useState(init);
  const [lagrerFelt, setLagrerFelt] = useState<string | null>(null);
  const [markerGjort, setMarkerGjort] = useState(false);
  const router = useRouter();
  const tittelRef = useRef<HTMLInputElement>(null);
  const notatRef = useRef<HTMLTextAreaElement>(null);

  async function lagre(felt: string, verdi: unknown) {
    setLagrerFelt(felt);
    await fetch(`/api/oppgaver/${oppgave.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [felt]: verdi }),
    });
    setLagrerFelt(null);
  }

  async function markerSomGjort() {
    setMarkerGjort(true);
    await fetch(`/api/oppgaver/${oppgave.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "gjort" }),
    });
    router.push("/oppgaver");
    router.refresh();
  }

  function oppdater(felt: keyof Oppgave, verdi: unknown) {
    setOppgave((o) => ({ ...o, [felt]: verdi }));
  }

  return (
    <div>
      {/* Topplinje */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 min-h-[44px] min-w-[44px]"
          style={{ color: "var(--ink-3)", fontSize: 15 }}
        >
          ← Tilbake
        </button>
        <button
          onClick={markerSomGjort}
          disabled={markerGjort}
          className="flex items-center gap-2 px-4 py-2 rounded-full min-h-[44px] text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "var(--stall)", color: "white" }}
        >
          ✓ Ferdig
        </button>
      </div>

      {/* Tittel */}
      <div className="mb-6">
        <input
          ref={tittelRef}
          type="text"
          value={oppgave.tittel}
          onChange={(e) => oppdater("tittel", e.target.value)}
          onBlur={(e) => lagre("tittel", e.target.value.trim())}
          className="w-full bg-transparent font-semibold focus:outline-none"
          style={{
            fontSize: 22,
            color: "var(--ink)",
            borderBottom: "2px solid var(--border)",
            paddingBottom: 8,
          }}
        />
      </div>

      {/* Notat */}
      <div className="mb-8">
        <label
          className="block text-[11px] font-bold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Notat
        </label>
        <textarea
          ref={notatRef}
          value={oppgave.notat ?? ""}
          onChange={(e) => oppdater("notat", e.target.value)}
          onBlur={(e) => lagre("notat", e.target.value.trim() || null)}
          placeholder="Legg til notat…"
          rows={4}
          className="w-full rounded-[16px] px-4 py-3 text-sm resize-none focus:outline-none"
          style={{
            backgroundColor: "var(--surface)",
            color: "var(--ink)",
            border: "1px solid var(--border)",
          }}
        />
      </div>

      {/* Prioritet */}
      <div className="mb-6">
        <label
          className="block text-[11px] font-bold uppercase mb-3"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Prioritet
        </label>
        <div className="flex gap-2">
          {(["lav", "normal", "høy"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                oppdater("prioritet", p);
                lagre("prioritet", p);
              }}
              className="flex-1 py-2 rounded-full text-sm font-medium min-h-[44px] transition-all"
              style={{
                backgroundColor:
                  oppgave.prioritet === p ? "var(--ink)" : "var(--surface)",
                color:
                  oppgave.prioritet === p ? "white" : "var(--ink-3)",
                border: "1px solid var(--border)",
              }}
            >
              {PRIORITET_ETIKETT[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Forfall */}
      <div className="mb-6">
        <label
          className="block text-[11px] font-bold uppercase mb-3"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Forfall
        </label>
        <input
          type="date"
          value={oppgave.forfall ?? ""}
          onChange={(e) => oppdater("forfall", e.target.value || null)}
          onBlur={(e) => lagre("forfall", e.target.value || null)}
          className="w-full rounded-[16px] px-4 py-3 text-sm focus:outline-none"
          style={{
            backgroundColor: "var(--surface)",
            color: oppgave.forfall ? "var(--ink)" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        />
        {oppgave.forfall && (
          <button
            onClick={() => {
              oppdater("forfall", null);
              lagre("forfall", null);
            }}
            className="mt-2 text-xs min-h-[44px] px-2"
            style={{ color: "var(--muted)" }}
          >
            Fjern forfall
          </button>
        )}
      </div>

      {/* Domene */}
      <div className="mb-6">
        <label
          className="block text-[11px] font-bold uppercase mb-3"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Domene
        </label>
        <div className="flex gap-2 flex-wrap">
          {domener.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                oppdater("domainId", d.id);
                lagre("domainId", d.id);
              }}
              className="px-4 py-2 rounded-full text-sm font-medium min-h-[44px] transition-all"
              style={{
                backgroundColor:
                  oppgave.domainId === d.id
                    ? `var(--${d.navn.toLowerCase()})`
                    : "var(--surface)",
                color:
                  oppgave.domainId === d.id ? "white" : "var(--ink-3)",
                border: "1px solid var(--border)",
              }}
            >
              {d.navn}
            </button>
          ))}
        </div>
      </div>

      {/* Topp 3 */}
      <div className="mb-8">
        <button
          onClick={() => {
            const ny = !oppgave.topp3;
            oppdater("topp3", ny);
            lagre("topp3", ny);
          }}
          className="flex items-center gap-3 w-full rounded-[16px] px-4 py-3 min-h-[56px] transition-all"
          style={{
            backgroundColor: oppgave.topp3 ? "rgba(190,154,85,0.12)" : "var(--surface)",
            border: `1px solid ${oppgave.topp3 ? "var(--hest)" : "var(--border)"}`,
          }}
        >
          <span style={{ fontSize: 20, color: oppgave.topp3 ? "var(--hest)" : "var(--border)" }}>
            ★
          </span>
          <span className="text-sm" style={{ color: "var(--ink)" }}>
            Topp 3 i dag
          </span>
          <span className="ml-auto text-xs" style={{ color: "var(--muted)" }}>
            {oppgave.topp3 ? "Ja" : "Nei"}
          </span>
        </button>
      </div>

      {/* Gjentagelse */}
      <div className="mb-8">
        <label
          className="block text-[11px] font-bold uppercase mb-3"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Gjentas
        </label>
        <div className="flex gap-2 flex-wrap">
          {GJENTAGELSE_VALG.map((v) => {
            const aktiv = oppgave.tilbakevendendeRegel === v.verdi;
            return (
              <button
                key={v.verdi ?? "aldri"}
                onClick={() => {
                  oppdater("tilbakevendendeRegel", v.verdi);
                  lagre("tilbakevendendeRegel", v.verdi);
                }}
                className="px-4 py-2 rounded-full text-sm font-medium min-h-[44px] transition-all"
                style={{
                  backgroundColor: aktiv ? "var(--ink)" : "var(--surface)",
                  color: aktiv ? "white" : "var(--ink-3)",
                  border: "1px solid var(--border)",
                }}
              >
                {v.etikett}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lagrer-indikator */}
      {lagrerFelt && (
        <p className="text-center text-xs mb-4" style={{ color: "var(--muted)" }}>
          Lagrer…
        </p>
      )}
    </div>
  );
}
