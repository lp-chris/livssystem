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
        className="flex items-center justify-center rounded-full text-xl min-w-[44px] min-h-[44px]"
        style={{
          width: 36,
          height: 36,
          backgroundColor: "var(--ink)",
          color: "var(--surface)",
        }}
      >
        +
      </button>

      {åpen && (
        <div className="fixed inset-0 flex items-end justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div
            className="w-full max-w-md p-5 space-y-4 rounded-[22px]"
            style={{ backgroundColor: "var(--card)" }}
          >
            <h2 className="font-semibold text-base" style={{ color: "var(--ink)" }}>
              Ny rutine
            </h2>
            <form onSubmit={opprett} className="space-y-3">
              <input
                autoFocus
                value={navn}
                onChange={(e) => setNavn(e.target.value)}
                placeholder="Navn på rutinen"
                className="w-full rounded-[14px] px-4 py-3 text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
              />
              <select
                value={tidspunkt}
                onChange={(e) => setTidspunkt(e.target.value)}
                className="w-full rounded-[14px] px-4 py-3 text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
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
                  className="flex-1 rounded-[14px] py-3 text-sm min-h-[44px]"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--ink-3)",
                  }}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={!navn.trim() || laster}
                  className="flex-1 rounded-[14px] py-3 text-sm font-medium disabled:opacity-30 min-h-[44px]"
                  style={{ backgroundColor: "var(--ink)", color: "var(--surface)" }}
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
