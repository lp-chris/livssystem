"use client";

import { useState } from "react";
import Link from "next/link";
import { iDagOslo } from "@/lib/dato";

type Oppgave = {
  id: number;
  tittel: string;
  forfall: string | null;
  prioritet: string;
  topp3: boolean;
  status: string;
  notat: string | null;
};

function forfallFarge(forfall: string | null): string {
  if (!forfall) return "var(--muted)";
  const iDag = iDagOslo();
  if (forfall < iDag) return "#C28568";
  if (forfall === iDag) return "var(--hest)";
  return "var(--muted)";
}

function forfallTekst(forfall: string | null): string {
  if (!forfall) return "";
  const iDag = iDagOslo();
  if (forfall === iDag) return "i dag";
  if (forfall < iDag) return `${forfall} ⚠`;
  return forfall;
}

export default function OppgaveKort({ oppgave: init }: { oppgave: Oppgave }) {
  const [oppgave, setOppgave] = useState(init);
  const [gjort, setGjort] = useState(false);
  const [fjernet, setFjernet] = useState(false);

  async function markerFerdig() {
    // Vis avhuking med en gang, så fade ut, så fjern raden
    setGjort(true);
    setTimeout(() => setFjernet(true), 450);
    await fetch(`/api/oppgaver/${oppgave.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "gjort" }),
    });
  }

  async function toggleTopp3() {
    const ny = !oppgave.topp3;
    setOppgave((o) => ({ ...o, topp3: ny }));
    await fetch(`/api/oppgaver/${oppgave.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topp3: ny }),
    });
  }

  if (fjernet) return null;

  return (
    <div
      className="rounded-[22px]"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        opacity: gjort ? 0 : 1,
        transition: "opacity 0.35s ease",
      }}
    >
      <div className="flex items-center px-2 py-1">
        <button
          onClick={markerFerdig}
          aria-label="Marker som gjort"
          className="flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: gjort ? "1.8px solid var(--hest)" : "1.8px solid #D8D3C8",
              backgroundColor: gjort ? "var(--hest)" : "transparent",
              transition: "background-color 0.15s ease, border-color 0.15s ease",
            }}
          >
            {gjort && (
              <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>
            )}
          </div>
        </button>

        <Link href={`/oppgaver/${oppgave.id}`} className="flex-1 min-w-0 min-h-[44px] flex flex-col justify-center">
          <p className="text-sm" style={{ color: "var(--ink)" }}>
            {oppgave.tittel}
          </p>
          {oppgave.forfall && (
            <p
              className="text-xs mt-0.5"
              style={{ color: forfallFarge(oppgave.forfall) }}
            >
              {forfallTekst(oppgave.forfall)}
            </p>
          )}
        </Link>

        <button
          onClick={toggleTopp3}
          aria-label={oppgave.topp3 ? "Fjern fra topp 3" : "Legg til topp 3"}
          className="flex-shrink-0 text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{ color: oppgave.topp3 ? "var(--hest)" : "var(--border)" }}
        >
          ★
        </button>
      </div>

      {oppgave.notat && (
        <p
          className="text-xs mt-1 mb-2 ml-[52px] leading-relaxed"
          style={{ color: "var(--ink-3)" }}
        >
          {oppgave.notat}
        </p>
      )}
    </div>
  );
}
