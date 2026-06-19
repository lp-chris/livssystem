"use client";

import { useState } from "react";

type Resultat = {
  ok: boolean;
  capture?: {
    type: string;
    tittel: string;
    domene: string;
    prioritet?: string;
    forfall?: string | null;
  };
  rutetTil?: { type: string; id: number };
  feil?: string;
};

const typeEtikett: Record<string, string> = {
  oppgave: "Oppgave",
  rutine: "Rutine",
  notat: "Notat",
  sitat: "Sitat",
  bok: "Bok",
};

export default function FangstSkjema({ onSuksess }: { onSuksess?: () => void }) {
  const [tekst, setTekst] = useState("");
  const [laster, setLaster] = useState(false);
  const [resultat, setResultat] = useState<Resultat | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!tekst.trim() || laster) return;

    setLaster(true);
    setResultat(null);

    try {
      const svar = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tekst }),
      });
      const data = await svar.json();
      setResultat(data);
      if (data.ok) {
        setTekst("");
        onSuksess?.();
      }
    } catch {
      setResultat({ ok: false, feil: "Nettverksfeil" });
    } finally {
      setLaster(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <form onSubmit={send} className="space-y-3">
        <textarea
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder="Hva vil du fange? Skriv fritt – AI ruter det til riktig sted."
          rows={3}
          disabled={laster}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!tekst.trim() || laster}
          className="w-full bg-indigo-600 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-40 active:bg-indigo-700 min-h-[44px]"
        >
          {laster ? "Ruter…" : "Fang"}
        </button>
      </form>

      {resultat && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            resultat.ok
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {resultat.ok && resultat.capture ? (
            <div>
              <span className="font-medium">
                {typeEtikett[resultat.capture.type] ?? resultat.capture.type}
              </span>{" "}
              lagt til i{" "}
              <span className="font-medium">{resultat.capture.domene}</span>
              {" · "}
              <span className="text-green-700">{resultat.capture.tittel}</span>
            </div>
          ) : (
            <span>{resultat.feil ?? "Noe gikk galt"}</span>
          )}
        </div>
      )}
    </div>
  );
}
