"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NyOppgaveKnapp() {
  const [åpen, setÅpen] = useState(false);
  const [tittel, setTittel] = useState("");
  const [laster, setLaster] = useState(false);
  const router = useRouter();

  async function opprett() {
    if (!tittel.trim()) return;
    setLaster(true);
    await fetch("/api/oppgaver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tittel: tittel.trim() }),
    });
    setTittel("");
    setÅpen(false);
    setLaster(false);
    router.refresh();
  }

  if (!åpen) {
    return (
      <button
        onClick={() => setÅpen(true)}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xl"
        style={{ color: "var(--ink)" }}
        aria-label="Ny oppgave"
      >
        +
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="w-full max-w-md rounded-t-[24px] px-4 pt-6 pb-10 space-y-3"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <h2 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
          Ny oppgave
        </h2>
        <input
          autoFocus
          type="text"
          placeholder="Hva skal gjøres?"
          value={tittel}
          onChange={(e) => setTittel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && opprett()}
          className="w-full rounded-[14px] px-4 py-3 text-sm focus:outline-none"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--ink)",
          }}
        />
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Domene, forfall og prosjekt setter du på detaljsiden.
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { setÅpen(false); setTittel(""); }}
            className="flex-1 py-3 rounded-[14px] text-sm"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--ink)",
              border: "1px solid var(--border)",
            }}
          >
            Avbryt
          </button>
          <button
            onClick={opprett}
            disabled={!tittel.trim() || laster}
            className="flex-1 py-3 rounded-[14px] text-sm font-medium"
            style={{
              backgroundColor: tittel.trim() ? "var(--ink)" : "var(--border)",
              color: tittel.trim() ? "var(--surface)" : "var(--muted)",
            }}
          >
            {laster ? "Oppretter…" : "Opprett"}
          </button>
        </div>
      </div>
    </div>
  );
}
