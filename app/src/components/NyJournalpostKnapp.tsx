"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROMPTS = [
  "Hva tenker du på akkurat nå?",
  "Hva gikk bra i dag?",
  "Hva vil du huske fra denne uken?",
  "Hva er du takknemlig for?",
  "Noe du lærte nylig?",
  "Hva kjenner du på kroppen i dag?",
  "Noe du har utsatt — og hvorfor?",
  "Hva drener deg, og hva gir deg energi?",
  "Hva er viktigst for deg akkurat nå?",
  "En ting du ønsker du hadde sagt — eller ikke sagt.",
  "Beskriv i dag med tre ord.",
  "Hva ser du frem til?",
];

function tilfeldigPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

export default function NyJournalpostKnapp() {
  const [åpen, setÅpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tittel, setTittel] = useState("");
  const [innhold, setInnhold] = useState("");
  const [laster, setLaster] = useState(false);
  const router = useRouter();

  function åpne() {
    setPrompt(tilfeldigPrompt());
    setÅpen(true);
  }

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
        onClick={åpne}
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
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
            Ny journalpost
          </h2>
          <button
            onClick={() => setPrompt(tilfeldigPrompt())}
            className="text-[11px] px-2 py-1 rounded-full min-h-[32px] flex items-center"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
            aria-label="Nytt spørsmål"
          >
            nytt spørsmål ↺
          </button>
        </div>

        {prompt && (
          <p className="text-sm italic pb-1" style={{ color: "var(--muted)" }}>
            {prompt}
          </p>
        )}

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
            onClick={() => { setÅpen(false); setTittel(""); setInnhold(""); setPrompt(""); }}
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
