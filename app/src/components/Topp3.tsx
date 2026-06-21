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

  return (
    <div
      className="rounded-[22px] overflow-hidden"
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Topp 3 i dag
        </h2>
        {oppgaver.length > 0 && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {oppgaver.length} igjen
          </span>
        )}
      </div>

      {oppgaver.length === 0 ? (
        <p
          className="text-sm italic px-4 pb-3"
          style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}
        >
          Ingen topp 3-oppgaver satt ennå.
        </p>
      ) : (
        oppgaver.map((o) => (
          <div
            key={o.id}
            className="flex items-center px-2 py-1"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <button
              onClick={() => markerFerdig(o.id)}
              aria-label="Marker som gjort"
              className="flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "1.8px solid #D8D3C8",
                }}
              />
            </button>
            <span className="flex-1 text-sm" style={{ color: "var(--ink)" }}>
              {o.tittel}
            </span>
            {o.forfall && (
              <span className="text-xs pr-3 flex-shrink-0" style={{ color: "var(--muted)" }}>
                {o.forfall}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
