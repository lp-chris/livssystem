"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SlettBibliotekElement({ id }: { id: number }) {
  const [bekrefter, setBekrefter] = useState(false);
  const [sletter, setSletter] = useState(false);
  const router = useRouter();

  async function slett() {
    setSletter(true);
    await fetch(`/api/bibliotek/${id}`, { method: "DELETE" });
    router.push("/bibliotek");
    router.refresh();
  }

  if (bekrefter) {
    return (
      <div className="flex gap-3">
        <button
          onClick={slett}
          disabled={sletter}
          className="flex-1 py-3 rounded-[16px] text-sm font-medium min-h-[44px] transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "#C28568", color: "white" }}
        >
          {sletter ? "Sletter…" : "Ja, slett"}
        </button>
        <button
          onClick={() => setBekrefter(false)}
          className="flex-1 py-3 rounded-[16px] text-sm min-h-[44px]"
          style={{ backgroundColor: "var(--surface)", color: "var(--ink-3)", border: "1px solid var(--border)" }}
        >
          Avbryt
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setBekrefter(true)}
      className="w-full py-3 rounded-[16px] text-sm min-h-[44px]"
      style={{ backgroundColor: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
    >
      Slett
    </button>
  );
}
