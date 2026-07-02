"use client";

import { useState } from "react";
import { iDagOslo, forfaltEtikett } from "@/lib/dato";

type Oppgave = {
  id: number;
  tittel: string;
  forfall: string | null;
  prioritet: string;
};

function forfallEtikett(forfall: string | null): string {
  if (!forfall) return "";
  const iDag = iDagOslo();
  if (forfall === iDag) return "i dag";
  if (forfall < iDag) return `${forfaltEtikett(forfall)} ⚠`;
  return forfall;
}

export default function DetSomHaster({ oppgaver: init }: { oppgaver: Oppgave[] }) {
  const [oppgaver, setOppgaver] = useState(init);
  const [ferdige, setFerdige] = useState<Set<number>>(new Set());

  async function markerFerdig(id: number) {
    // Vis avhuking, fade ut, så fjern raden
    setFerdige((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setOppgaver((prev) => prev.filter((o) => o.id !== id));
    }, 450);
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
              opacity: ferdige.has(o.id) ? 0 : 1,
              transition: "opacity 0.35s ease",
            }}
          >
            <button
              onClick={() => markerFerdig(o.id)}
              aria-label="Marker som gjort"
              className="flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 21,
                  height: 21,
                  borderRadius: "50%",
                  border: ferdige.has(o.id)
                    ? "1.8px solid #C28568"
                    : "1.8px solid var(--sirkel)",
                  backgroundColor: ferdige.has(o.id) ? "#C28568" : "transparent",
                  transition: "background-color 0.15s ease, border-color 0.15s ease",
                }}
              >
                {ferdige.has(o.id) && (
                  <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>
                )}
              </div>
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
