"use client";

import { useState } from "react";

type Dag = { dato: string; fullført: boolean };

type Rutine = {
  id: number;
  navn: string;
  beskrivelse?: string | null;
  streak: number;
  graf: Dag[];
  fullførtIdag: boolean;
};

export default function RutineKort({
  rutine: initial,
}: {
  rutine: Rutine;
}) {
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
      const iDagStr = new Date().toISOString().split("T")[0];

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
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 text-sm">{rutine.navn}</div>
          {rutine.beskrivelse && (
            <div className="text-xs text-gray-400 mt-0.5 truncate">
              {rutine.beskrivelse}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rutine.streak > 0 && (
            <span className="text-xs font-semibold text-orange-500">
              {rutine.streak}🔥
            </span>
          )}
          <button
            onClick={toggleFullfor}
            disabled={laster}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors min-w-[44px] min-h-[44px] ${
              rutine.fullførtIdag
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {rutine.fullførtIdag ? "✓" : "○"}
          </button>
        </div>
      </div>

      {/* 14-dagers graf */}
      <div className="flex gap-1">
        {rutine.graf.map((dag) => (
          <div
            key={dag.dato}
            title={dag.dato}
            className={`flex-1 h-2 rounded-sm ${
              dag.fullført ? "bg-green-400" : "bg-gray-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
