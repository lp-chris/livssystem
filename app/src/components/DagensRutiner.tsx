"use client";

import { useState } from "react";
import Link from "next/link";

type RutinePreview = {
  id: number;
  navn: string;
  tidspunkt: string;
  fullførtIdag: boolean;
};

export default function DagensRutiner({
  rutiner: init,
}: {
  rutiner: RutinePreview[];
}) {
  const [rutiner, setRutiner] = useState(init);

  async function toggle(id: number) {
    const svar = await fetch(`/api/rutiner/${id}/fullfor`, { method: "POST" });
    const data = await svar.json();
    setRutiner((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, fullførtIdag: data.fullført } : r
      )
    );
  }

  const antallFerdig = rutiner.filter((r) => r.fullførtIdag).length;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Rutiner i dag
        </h2>
        <span className="text-xs text-gray-400">
          {antallFerdig}/{rutiner.length}
        </span>
      </div>
      <div className="space-y-2">
        {rutiner.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm"
          >
            <span
              className={`flex-1 text-sm ${
                r.fullførtIdag ? "text-gray-400 line-through" : "text-gray-900"
              }`}
            >
              {r.navn}
            </span>
            <button
              onClick={() => toggle(r.id)}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors min-w-[44px] min-h-[44px] ${
                r.fullførtIdag
                  ? "bg-green-500 text-white"
                  : "border-2 border-gray-200 text-gray-300"
              }`}
            >
              ✓
            </button>
          </div>
        ))}
      </div>
      <Link
        href="/rutiner"
        className="block text-center text-xs text-indigo-500 mt-2 py-1"
      >
        Se alle rutiner →
      </Link>
    </section>
  );
}
