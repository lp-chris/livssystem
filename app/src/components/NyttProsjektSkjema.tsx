"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Domene = { id: number; navn: string };

export default function NyttProsjektSkjema({ domener }: { domener: Domene[] }) {
  const [åpen, setÅpen] = useState(false);
  const [navn, setNavn] = useState("");
  const [type, setType] = useState<"prosjekt" | "område">("prosjekt");
  const [domeneId, setDomeneId] = useState<number>(domener[0]?.id ?? 1);
  const [endDate, setEndDate] = useState("");
  const [laster, setLaster] = useState(false);
  const router = useRouter();

  async function opprett() {
    if (!navn.trim()) return;
    setLaster(true);
    await fetch("/api/prosjekter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ navn: navn.trim(), type, domainId: domeneId, endDate: endDate || null }),
    });
    setNavn("");
    setEndDate("");
    setÅpen(false);
    setLaster(false);
    router.refresh();
  }

  if (!åpen) {
    return (
      <button
        onClick={() => setÅpen(true)}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-xl"
        style={{ color: "var(--ink)" }}
        aria-label="Nytt prosjekt"
      >
        +
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="w-full max-w-md rounded-t-[24px] px-4 pt-6 pb-10 space-y-4"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <h2 className="text-base font-semibold" style={{ color: "var(--ink)" }}>
          Nytt prosjekt
        </h2>

        <input
          autoFocus
          type="text"
          placeholder="Navn…"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && opprett()}
          className="w-full rounded-[14px] px-4 py-3 text-sm focus:outline-none"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--ink)",
          }}
        />

        {/* Type */}
        <div className="flex gap-2">
          {(["prosjekt", "område"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="flex-1 py-2.5 rounded-[12px] text-sm capitalize"
              style={{
                backgroundColor: type === t ? "var(--ink)" : "var(--card)",
                color: type === t ? "var(--surface)" : "var(--ink)",
                border: "1px solid var(--border)",
              }}
            >
              {t === "prosjekt" ? "Prosjekt" : "Område"}
            </button>
          ))}
        </div>

        {/* Domene */}
        <div className="flex gap-2 flex-wrap">
          {domener.map((d) => (
            <button
              key={d.id}
              onClick={() => setDomeneId(d.id)}
              className="px-4 py-2 rounded-[12px] text-sm"
              style={{
                backgroundColor: domeneId === d.id ? "var(--ink)" : "var(--card)",
                color: domeneId === d.id ? "var(--surface)" : "var(--ink)",
                border: "1px solid var(--border)",
              }}
            >
              {d.navn}
            </button>
          ))}
        </div>

        {/* Frist (bare for prosjekt) */}
        {type === "prosjekt" && (
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-[14px] px-4 py-3 text-sm focus:outline-none"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: endDate ? "var(--ink)" : "var(--muted)",
            }}
          />
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setÅpen(false)}
            className="flex-1 py-3 rounded-[14px] text-sm"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--ink)",
              border: "1px solid var(--border)",
            }}
          >
            Avbryt
          </button>
          <button
            onClick={opprett}
            disabled={!navn.trim() || laster}
            className="flex-1 py-3 rounded-[14px] text-sm font-medium"
            style={{
              backgroundColor: navn.trim() ? "var(--ink)" : "var(--border)",
              color: navn.trim() ? "var(--surface)" : "var(--muted)",
            }}
          >
            {laster ? "Oppretter…" : "Opprett"}
          </button>
        </div>
      </div>
    </div>
  );
}
