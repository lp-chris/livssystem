"use client";

import { useState } from "react";

export default function FavorittKnapp({ id, favoritt: init }: { id: number; favoritt: boolean }) {
  const [favoritt, setFavoritt] = useState(init);

  async function toggle() {
    const ny = !favoritt;
    setFavoritt(ny);
    await fetch(`/api/bibliotek/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favoritt: ny }),
    });
  }

  return (
    <button
      onClick={toggle}
      aria-label={favoritt ? "Fjern fra favoritter" : "Legg til favoritter"}
      className="flex items-center justify-center min-w-[44px] min-h-[44px] text-2xl transition-colors"
      style={{ color: favoritt ? "var(--hest)" : "var(--border)" }}
    >
      ★
    </button>
  );
}
