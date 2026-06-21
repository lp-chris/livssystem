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
      <div className="flex items-center justify-between px-4 py-3.5">
        <h2 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
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
          className="text-sm italic px-4 pb-4"
          style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}
        >
          Ingen topp 3-oppgaver satt ennå.
        </p>
      ) : (
        oppgaver.map((o) => (
          <div
            key={o.id}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <button
              onClick={() => markerFerdig(o.id)}
              aria-label="Marker som gjort"
              className="flex items-center justify-center rounded-full flex-shrink-0 transition-colors min-w-[44px] min-h-[44px]"
              style={{
                width: 26,
                height: 26,
                border: "1.8px solid #D8D3C8",
              }}
            />
            <span className="flex-1 text-sm font-medium" style={{ color: "var(--ink)" }}>
              {o.tittel}
            </span>
            {o.forfall && (
              <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                {o.forfall}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
