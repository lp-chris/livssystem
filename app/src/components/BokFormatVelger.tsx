"use client";

import { useState } from "react";

const formater = [
  { verdi: "bok", etikett: "📖 Leser" },
  { verdi: "lydbok", etikett: "🎧 Lytter" },
];

export default function BokFormatVelger({
  id,
  format: init,
}: {
  id: number;
  format: string | null;
}) {
  const [format, setFormat] = useState(init ?? "bok");

  async function endre(nyttFormat: string) {
    setFormat(nyttFormat);
    await fetch(`/api/bibliotek/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: nyttFormat }),
    });
  }

  return (
    <div className="flex gap-2">
      {formater.map((f) => (
        <button
          key={f.verdi}
          onClick={() => endre(f.verdi)}
          className="flex-1 py-2 rounded-[14px] text-xs font-medium transition-all min-h-[44px]"
          style={{
            backgroundColor: format === f.verdi ? "var(--ink)" : "var(--surface)",
            color: format === f.verdi ? "var(--surface)" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          {f.etikett}
        </button>
      ))}
    </div>
  );
}
