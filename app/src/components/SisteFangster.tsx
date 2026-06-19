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
    <section>
      <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        Nylig lagt til
      </h2>
      <div className="space-y-2">
        {fangster.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-lg px-4 py-3 shadow-sm text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-gray-900 flex-1 min-w-0 truncate">
                {f.tolketJson?.tittel ?? f.råTekst}
              </span>
              {f.tolketJson?.type && (
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {typeEtikett[f.tolketJson.type] ?? f.tolketJson.type}
                </span>
              )}
            </div>
            {f.tolketJson?.domene && (
              <div className="text-xs text-gray-400 mt-0.5">
                {f.tolketJson.domene}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
