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
      <p className="text-sm italic py-2" style={{ color: "var(--muted)" }}>
        Ingen topp 3-oppgaver satt ennå.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
        {oppgaver.length} igjen
      </p>
    <div className="space-y-2">
      {oppgaver.map((o, i) => (
        <div
          key={o.id}
          className="flex items-center gap-3 px-4 py-3 rounded-[22px]"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            className="text-xs font-bold w-5 flex-shrink-0"
            style={{ color: "var(--muted)" }}
          >
            {i + 1}
          </span>
          <span className="flex-1 text-sm" style={{ color: "var(--ink)" }}>
            {o.tittel}
          </span>
          {o.forfall && (
            <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
              {o.forfall}
            </span>
          )}
          <button
            onClick={() => markerFerdig(o.id)}
            aria-label="Marker som gjort"
            className="flex items-center justify-center rounded-full flex-shrink-0 transition-colors min-w-[44px] min-h-[44px]"
            style={{
              width: 28,
              height: 28,
              border: "2px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            ✓
          </button>
        </div>
      ))}
    </div>
    </div>
  );
}
