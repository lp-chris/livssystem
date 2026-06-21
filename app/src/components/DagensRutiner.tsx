"use client";

import { useState } from "react";
import Link from "next/link";

type RutinePreview = {
  id: number;
  navn: string;
  tidspunkt: string;
  fullførtIdag: boolean;
};

export default function DagensRutiner({ rutiner: init }: { rutiner: RutinePreview[] }) {
  const [rutiner, setRutiner] = useState(init);

  async function toggle(id: number) {
    const svar = await fetch(`/api/rutiner/${id}/fullfor`, { method: "POST" });
    const data = await svar.json();
    setRutiner((prev) =>
      prev.map((r) => (r.id === id ? { ...r, fullførtIdag: data.fullført } : r))
    );
  }

  const antallFerdig = rutiner.filter((r) => r.fullførtIdag).length;

  return (
    <section>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <Link
          href="/rutiner"
          className="flex items-center gap-1 text-[11px] font-bold uppercase"
          style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
        >
          Dagens rutiner
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {antallFerdig}/{rutiner.length}
        </span>
      </div>

      <div
        className="rounded-[22px] overflow-hidden"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        {rutiner.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}
          >
            <button
              onClick={() => toggle(r.id)}
              aria-label={r.fullførtIdag ? "Marker som ikke gjort" : "Marker som gjort"}
              className="flex items-center justify-center rounded-full flex-shrink-0 transition-all min-w-[44px] min-h-[44px]"
              style={{
                width: 25,
                height: 25,
                backgroundColor: r.fullførtIdag ? "var(--ink)" : "transparent",
                border: r.fullførtIdag ? "none" : "1.8px solid #D8D3C8",
                color: "white",
                fontSize: 13,
              }}
            >
              {r.fullførtIdag ? "✓" : ""}
            </button>
            <span
              className="flex-1 text-sm font-medium transition-all"
              style={{
                color: r.fullførtIdag ? "var(--muted)" : "var(--ink)",
                textDecoration: r.fullførtIdag ? "line-through" : "none",
              }}
            >
              {r.navn}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
