"use client";

import { useState } from "react";

export default function BokTanker({
  id,
  sammendrag: init,
}: {
  id: number;
  sammendrag: string | null;
}) {
  const [tekst, setTekst] = useState(init ?? "");
  const [lagret, setLagret] = useState(init ?? "");
  const [lagrer, setLagrer] = useState(false);

  const endret = tekst.trim() !== lagret.trim();

  async function lagre() {
    setLagrer(true);
    const verdi = tekst.trim();
    await fetch(`/api/bibliotek/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sammendrag: verdi || null }),
    });
    setLagret(verdi);
    setLagrer(false);
  }

  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase mb-2"
        style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
      >
        Hva jeg tenker
      </p>
      <textarea
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder="Skriv ned tankene dine om boken…"
        rows={5}
        className="w-full rounded-[16px] px-4 py-3 text-sm leading-relaxed focus:outline-none resize-none"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          color: "var(--ink)",
        }}
      />
      {endret && (
        <button
          onClick={lagre}
          disabled={lagrer}
          className="mt-2 px-4 py-2 rounded-[14px] text-sm font-medium min-h-[44px]"
          style={{ backgroundColor: "var(--ink)", color: "var(--surface)" }}
        >
          {lagrer ? "Lagrer…" : "Lagre"}
        </button>
      )}
    </div>
  );
}
