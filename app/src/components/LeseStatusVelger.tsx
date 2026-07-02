"use client";

import { useState } from "react";

const statuser = [
  { verdi: "vil_lese", etikett: "Vil lese" },
  { verdi: "leser", etikett: "Leser nå" },
  { verdi: "fullført", etikett: "Lest" },
];

export default function LeseStatusVelger({ id, status: init }: { id: number; status: string }) {
  const [status, setStatus] = useState(init);

  async function endre(nyStatus: string) {
    setStatus(nyStatus);
    await fetch(`/api/bibliotek/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leseStatus: nyStatus }),
    });
  }

  return (
    <div className="flex gap-2">
      {statuser.map((s) => (
        <button
          key={s.verdi}
          onClick={() => endre(s.verdi)}
          className="flex-1 py-2 rounded-[14px] text-xs font-medium transition-all min-h-[44px]"
          style={{
            backgroundColor: status === s.verdi ? "var(--ink)" : "var(--surface)",
            color: status === s.verdi ? "var(--surface)" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          {s.etikett}
        </button>
      ))}
    </div>
  );
}
