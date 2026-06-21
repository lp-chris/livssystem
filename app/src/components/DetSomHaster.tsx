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
        className="text-[11px] font-bold uppercase mb-2.5 px-1"
        style={{ letterSpacing: "0.12em", color: "#C28568" }}
      >
        Det som haster
      </h2>

      <div
        className="rounded-[22px] overflow-hidden"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        {oppgaver.map((o, i) => (
          <div
            key={o.id}
            className="flex items-center px-1 py-1"
            style={{
              borderTop: i > 0 ? "1px solid var(--border)" : "none",
              borderLeft: "3px solid #C28568",
            }}
          >
            <button
              onClick={() => markerFerdig(o.id)}
              aria-label="Marker som gjort"
              className="flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <div
                style={{
                  width: 21,
                  height: 21,
                  borderRadius: "50%",
                  border: "1.8px solid #D8D3C8",
                }}
              />
            </button>
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                {o.tittel}
              </p>
              {o.forfall && (
                <p className="text-xs mt-0.5 font-medium" style={{ color: "#C28568" }}>
                  {forfallEtikett(o.forfall)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
