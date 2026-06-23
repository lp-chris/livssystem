"use client";

import { useState } from "react";

export default function BokSammendrag({
  id,
  sammendrag: initSammendrag,
  takeaways: initTakeaways,
}: {
  id: number;
  sammendrag: string | null;
  takeaways: string[] | null;
}) {
  const [sammendrag, setSammendrag] = useState(initSammendrag);
  const [takeaways, setTakeaways] = useState<string[]>(initTakeaways ?? []);
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const harSammendrag = Boolean(sammendrag) || takeaways.length > 0;

  async function generer() {
    setLaster(true);
    setFeil(null);
    try {
      const res = await fetch(`/api/bibliotek/${id}/sammendrag`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setFeil(data.feil ?? "Noe gikk galt");
        return;
      }
      setSammendrag(data.item.aiSammendrag ?? null);
      setTakeaways(data.item.aiTakeaways ?? []);
    } catch {
      setFeil("Noe gikk galt");
    } finally {
      setLaster(false);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-[11px] font-bold uppercase"
          style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
        >
          AI-sammendrag
        </h2>
        {harSammendrag && (
          <button
            onClick={generer}
            disabled={laster}
            className="text-xs min-h-[44px] disabled:opacity-40"
            style={{ color: "var(--muted)" }}
          >
            {laster ? "Lager…" : "↻ Lag på nytt"}
          </button>
        )}
      </div>

      {!harSammendrag && (
        <button
          onClick={generer}
          disabled={laster}
          className="w-full rounded-[16px] py-3 text-sm font-medium transition-opacity disabled:opacity-40 min-h-[44px]"
          style={{ backgroundColor: "var(--ink)", color: "white" }}
        >
          {laster ? "Lager sammendrag…" : "✨ Lag AI-sammendrag"}
        </button>
      )}

      {feil && (
        <p className="text-sm mt-2" style={{ color: "#b4413c" }}>
          {feil}
        </p>
      )}

      {harSammendrag && (
        <div
          className="rounded-[18px] px-4 py-4 space-y-4"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          {sammendrag && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
              {sammendrag}
            </p>
          )}
          {takeaways.length > 0 && (
            <div>
              <p
                className="text-[11px] font-bold uppercase mb-2"
                style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
              >
                Key take-outs
              </p>
              <ul className="space-y-2">
                {takeaways.map((t, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed flex gap-2"
                    style={{ color: "var(--ink)" }}
                  >
                    <span style={{ color: "var(--muted)" }}>•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
