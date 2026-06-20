"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const tidspunktValg = [
  { verdi: "morgen", etikett: "Morgen" },
  { verdi: "ettermiddag", etikett: "Ettermiddag" },
  { verdi: "kveld", etikett: "Kveld" },
  { verdi: "når_som_helst", etikett: "Når som helst" },
];

export default function NyRutineKnapp() {
  const [åpen, setÅpen] = useState(false);
  const [navn, setNavn] = useState("");
  const [tidspunkt, setTidspunkt] = useState("når_som_helst");
  const [laster, setLaster] = useState(false);
  const router = useRouter();

  async function opprett(e: React.FormEvent) {
    e.preventDefault();
    if (!navn.trim() || laster) return;
    setLaster(true);
    try {
      await fetch("/api/rutiner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navn, tidspunkt }),
      });
      setNavn("");
      setTidspunkt("når_som_helst");
      setÅpen(false);
      router.refresh();
    } finally {
      setLaster(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setÅpen(true)}
        className="w-9 h-9 rounded-full bg-indigo-600 text-white text-xl flex items-center justify-center min-w-[44px] min-h-[44px]"
      >
        +
      </button>

      {åpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Ny rutine</h2>
            <form onSubmit={opprett} className="space-y-3">
              <input
                autoFocus
                value={navn}
                onChange={(e) => setNavn(e.target.value)}
                placeholder="Navn på rutinen"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={tidspunkt}
                onChange={(e) => setTidspunkt(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {tidspunktValg.map((t) => (
                  <option key={t.verdi} value={t.verdi}>
                    {t.etikett}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setÅpen(false)}
                  className="flex-1 border border-gray-200 rounded-lg py-3 text-sm text-gray-600 min-h-[44px]"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={!navn.trim() || laster}
                  className="flex-1 bg-indigo-600 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-40 min-h-[44px]"
                >
                  {laster ? "Lagrer…" : "Legg til"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
