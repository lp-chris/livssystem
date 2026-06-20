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
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={!tekst.trim() || laster}
        className="w-full bg-indigo-600 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-40 min-h-[44px]"
      >
        {laster ? "Lagrer…" : "Legg til tanke"}
      </button>
    </form>
  );
}
