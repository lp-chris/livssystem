"use client";

import { useState } from "react";

type Oppgave = {
  id: number;
  tittel: string;
  forfall: string | null;
  prioritet: string;
  topp3: boolean;
  status: string;
};

export default function Topp3({ oppgaver: init }: { oppgaver: Oppgave[] }) {
  const [oppgaver, setOppgaver] = useState(init);

  async function markerFerdig(id: number) {
    setOppgaver((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/oppgaver/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "gjort" }),
    });
  }

  if (oppgaver.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic py-2">
        Ingen topp 3-oppgaver satt.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {oppgaver.map((o, i) => (
        <div
          key={o.id}
          className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm"
        >
          <span className="text-xs font-bold text-indigo-400 w-4 flex-shrink-0">
            {i + 1}
          </span>
          <span className="flex-1 text-sm text-gray-900">{o.tittel}</span>
          {o.forfall && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {o.forfall}
            </span>
          )}
          <button
            onClick={() => markerFerdig(o.id)}
            className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300 hover:border-green-400 hover:text-green-400 transition-colors min-w-[44px] min-h-[44px]"
          >
            ✓
          </button>
        </div>
      ))}
    </div>
  );
}
