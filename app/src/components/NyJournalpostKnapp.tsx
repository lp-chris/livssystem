"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NyJournalpostKnapp() {
  const [åpen, setÅpen] = useState(false);
  const [tittel, setTittel] = useState("");
  const [innhold, setInnhold] = useState("");
  const [laster, setLaster] = useState(false);
  const router = useRouter();

  async function opprett() {
    if (!innhold.trim()) return;
    setLaster(true);
    await fetch("/api/bibliotek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "journal",
        tittel: tittel.trim() || null,
        innhold: innhold.trim(),
      }),
    });
    setTittel("");
    setInnhold("");
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
        aria-label="Ny journalpost"
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
          Ny journalpost
        </h2>

        <input
          type="text"
          placeholder="Tittel (valgfritt)…"
          value={tittel}
          onChange={(e) => setTittel(e.target.value)}
          className="w-full rounded-[14px] px-4 py-3 text-sm focus:outline-none"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--ink)",
          }}
        />

        <textarea
          autoFocus
          placeholder="Skriv her…"
          value={innhold}
          onChange={(e) => setInnhold(e.target.value)}
          rows={6}
          className="w-full rounded-[14px] px-4 py-3 text-sm focus:outline-none resize-none"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--ink)",
          }}
        />

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { setÅpen(false); setTittel(""); setInnhold(""); }}
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
            disabled={!innhold.trim() || laster}
            className="flex-1 py-3 rounded-[14px] text-sm font-medium"
            style={{
              backgroundColor: innhold.trim() ? "var(--ink)" : "var(--border)",
              color: innhold.trim() ? "var(--surface)" : "var(--muted)",
            }}
          >
            {laster ? "Lagrer…" : "Lagre"}
          </button>
        </div>
      </div>
    </div>
  );
}
