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
      <div className="flex items-center justify-between mb-2">
        <Link
          href="/rutiner"
          className="flex items-center gap-1 text-[11px] font-bold uppercase"
          style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
        >
          Dagens rutiner
          <span style={{ fontSize: 10 }}>→</span>
        </Link>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {antallFerdig}/{rutiner.length}
        </span>
      </div>
      <div className="space-y-2">
        {rutiner.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 px-4 py-3 rounded-[22px]"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              className="flex-1 text-sm transition-all"
              style={{
                color: r.fullførtIdag ? "var(--muted)" : "var(--ink)",
                textDecoration: r.fullførtIdag ? "line-through" : "none",
              }}
            >
              {r.navn}
            </span>
            <button
              onClick={() => toggle(r.id)}
              aria-label={r.fullførtIdag ? "Marker som ikke gjort" : "Marker som gjort"}
              className="flex items-center justify-center rounded-full flex-shrink-0 transition-all min-w-[44px] min-h-[44px]"
              style={{
                width: 28,
                height: 28,
                backgroundColor: r.fullførtIdag ? "var(--stall)" : "transparent",
                border: r.fullførtIdag ? "none" : "2px solid var(--border)",
                color: r.fullførtIdag ? "white" : "var(--muted)",
              }}
            >
              ✓
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
