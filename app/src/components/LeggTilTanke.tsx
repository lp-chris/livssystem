"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeggTilTanke({ itemId }: { itemId: number }) {
  const [tekst, setTekst] = useState("");
  const [laster, setLaster] = useState(false);
  const router = useRouter();

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!tekst.trim() || laster) return;
    setLaster(true);
    try {
      await fetch(`/api/bibliotek/${itemId}/tanker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tekst }),
      });
      setTekst("");
      router.refresh();
    } finally {
      setLaster(false);
    }
  }

  return (
    <form onSubmit={send} className="space-y-2">
      <textarea
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder="Legg til en tanke…"
        rows={2}
        disabled={laster}
        className="w-full rounded-[16px] px-4 py-3 text-sm resize-none focus:outline-none"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--ink)",
        }}
      />
      <button
        type="submit"
        disabled={!tekst.trim() || laster}
        className="w-full rounded-[16px] py-3 text-sm font-medium transition-opacity disabled:opacity-30 min-h-[44px]"
        style={{
          backgroundColor: "var(--ink)",
          color: "white",
        }}
      >
        {laster ? "Lagrer…" : "Legg til tanke"}
      </button>
    </form>
  );
}
