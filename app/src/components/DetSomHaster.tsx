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

export default function DetSomHaster({ oppgaver: init }: { oppgaver: Oppgave[] }) {
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
      <h2
        className="text-[11px] font-bold uppercase mb-2"
        style={{ letterSpacing: "0.12em", color: "#C28568" }}
      >
        Haster
      </h2>
      <div className="space-y-2">
        {oppgaver.map((o) => (
          <div
            key={o.id}
            className="flex items-center gap-3 px-4 py-3 rounded-[22px]"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid #C28568",
            }}
          >
            <span className="flex-1 text-sm" style={{ color: "var(--ink)" }}>
              {o.tittel}
            </span>
            <span className="text-xs flex-shrink-0" style={{ color: "#C28568" }}>
              {forfallEtikett(o.forfall)}
            </span>
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
    </section>
  );
}
