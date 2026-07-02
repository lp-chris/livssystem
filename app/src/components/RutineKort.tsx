"use client";

import { useState } from "react";
import { iDagOslo } from "@/lib/dato";

type Dag = { dato: string; fullført: boolean };

type Rutine = {
  id: number;
  navn: string;
  beskrivelse?: string | null;
  streak: number;
  graf: Dag[];
  fullførtIdag: boolean;
};

export default function RutineKort({ rutine: initial }: { rutine: Rutine }) {
  const [rutine, setRutine] = useState(initial);
  const [laster, setLaster] = useState(false);

  async function toggleFullfor() {
    if (laster) return;
    setLaster(true);
    try {
      const svar = await fetch(`/api/rutiner/${rutine.id}/fullfor`, {
        method: "POST",
      });
      const data = await svar.json();
      const nyFullførtIdag = data.fullført as boolean;
      const iDagStr = iDagOslo();

      setRutine((r) => ({
        ...r,
        fullførtIdag: nyFullførtIdag,
        graf: r.graf.map((d) =>
          d.dato === iDagStr ? { ...d, fullført: nyFullførtIdag } : d
        ),
        streak: nyFullførtIdag ? r.streak + 1 : Math.max(0, r.streak - 1),
      }));
    } finally {
      setLaster(false);
    }
  }

  return (
    <div
      className="rounded-[22px] p-4"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            {rutine.navn}
          </div>
          {rutine.beskrivelse && (
            <div className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
              {rutine.beskrivelse}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rutine.streak > 0 && (
            <span className="text-xs font-semibold" style={{ color: "var(--hest)" }}>
              {rutine.streak} 🔥
            </span>
          )}
          <button
            onClick={toggleFullfor}
            disabled={laster}
            aria-label={rutine.fullførtIdag ? "Angre" : "Fullfør"}
            className="flex items-center justify-center rounded-full transition-all min-w-[44px] min-h-[44px]"
            style={{
              width: 32,
              height: 32,
              backgroundColor: rutine.fullførtIdag ? "var(--stall)" : "transparent",
              border: rutine.fullførtIdag ? "none" : "2px solid var(--border)",
              color: rutine.fullførtIdag ? "white" : "var(--muted)",
            }}
          >
            ✓
          </button>
        </div>
      </div>

      {/* 14-dagers graf */}
      <div className="flex gap-1">
        {rutine.graf.map((dag) => (
          <div
            key={dag.dato}
            title={dag.dato}
            className="flex-1 rounded-sm"
            style={{
              height: 6,
              backgroundColor: dag.fullført ? "var(--stall)" : "var(--border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
