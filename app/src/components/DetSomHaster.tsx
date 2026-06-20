"use client";

import { useState } from "react";

type Oppgave = {
  id: number;
  tittel: string;
  forfall: string | null;
  prioritet: string;
};

function forfallEtikett(forfall: string | null): string {
  if (!forfall) return "";
  const iDag = new Date().toISOString().split("T")[0];
  if (forfall === iDag) return "i dag";
  if (forfall < iDag) return `${forfall} ⚠`;
  return forfall;
}

export default function DetSomHaster({
  oppgaver: init,
}: {
  oppgaver: Oppgave[];
}) {
  const [oppgaver, setOppgaver] = useState(init);

  async function markerFerdig(id: number) {
    setOppgaver((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/oppgaver/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "gjort" }),
    });
  }

  if (oppgaver.length === 0) return null;

  return (
    <section>
      <h2 className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2">
        Haster
      </h2>
      <div className="space-y-2">
        {oppgaver.map((o) => (
          <div
            key={o.id}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border-l-2 border-red-300"
          >
            <span className="flex-1 text-sm text-gray-900">{o.tittel}</span>
            <span className="text-xs text-red-400 flex-shrink-0">
              {forfallEtikett(o.forfall)}
            </span>
            <button
              onClick={() => markerFerdig(o.id)}
              className="min-w-[44px] min-h-[44px] text-gray-300 hover:text-green-400 transition-colors flex items-center justify-center"
            >
              ✓
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
