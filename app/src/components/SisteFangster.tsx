"use client";

import { useEffect, useState } from "react";

type Fangst = {
  id: number;
  råTekst: string;
  status: string;
  tolketJson?: {
    type?: string;
    tittel?: string;
    domene?: string;
  } | null;
  rutetTil?: { type: string; id: number } | null;
  opprettet: string;
};

const typeEtikett: Record<string, string> = {
  oppgave: "Oppgave",
  rutine: "Rutine",
  notat: "Notat",
  sitat: "Sitat",
  bok: "Bok",
  journal: "Journal",
};

export default function SisteFangster({ oppdater }: { oppdater?: number }) {
  const [fangster, setFangster] = useState<Fangst[]>([]);

  useEffect(() => {
    fetch("/api/capture/siste")
      .then((r) => r.json())
      .then((data) => setFangster(data.fangster ?? []))
      .catch(() => {});
  }, [oppdater]);

  if (fangster.length === 0) return null;

  return (
    <section className="mb-8">
      <h2
        className="text-[11px] font-bold uppercase mb-3"
        style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
      >
        Nylig fanget
      </h2>
      <div className="space-y-2">
        {fangster.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between px-4 py-3 rounded-[14px]"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              className="text-sm flex-1 min-w-0 truncate"
              style={{ color: "var(--ink)" }}
            >
              {f.tolketJson?.tittel ?? f.råTekst}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              {f.tolketJson?.domene && (
                <span
                  className="text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  {f.tolketJson.domene}
                </span>
              )}
              {f.tolketJson?.type && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {typeEtikett[f.tolketJson.type] ?? f.tolketJson.type}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
