"use client";

import { useState } from "react";

const statuser = [
  { verdi: "vil_lese", etikett: "Vil lese" },
  { verdi: "leser", etikett: "Leser nå" },
  { verdi: "fullført", etikett: "Lest" },
];

export default function LeseStatusVelger({
  id,
  status: init,
}: {
  id: number;
  status: string;
}) {
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
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
            status === s.verdi
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {s.etikett}
        </button>
      ))}
    </div>
  );
}
