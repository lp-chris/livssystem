"use client";

import { useEffect, useState } from "react";

type Hendelse = {
  id: string;
  tittel: string;
  start: string;
  slutt: string;
  helDag: boolean;
  sted?: string;
};

function formaterTid(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

export default function KalenderIDag() {
  const [hendelser, setHendelser] = useState<Hendelse[]>([]);
  const [lastet, setLastet] = useState(false);

  useEffect(() => {
    fetch("/api/kalender")
      .then((r) => r.json())
      .then((data) => {
        setHendelser(data.hendelser ?? []);
        setLastet(true);
      })
      .catch(() => setLastet(true));
  }, []);

  if (!lastet || hendelser.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h2
          className="text-[11px] font-bold uppercase"
          style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
        >
          I dag · kalender
        </h2>
        <span
          className="text-[10px] flex items-center gap-1"
          style={{ color: "var(--muted)" }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          Kun visning
        </span>
      </div>

      <div
        className="rounded-[22px] overflow-hidden"
        style={{ backgroundColor: "var(--kort-lys)", border: "1px solid var(--border)" }}
      >
        {hendelser.map((h, i) => (
          <div
            key={h.id}
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}
          >
            <div
              className="text-sm font-semibold flex-shrink-0 text-right"
              style={{ width: 44, color: "var(--muted)" }}
            >
              {h.helDag ? "—" : formaterTid(h.start)}
            </div>
            <div
              className="flex-shrink-0 rounded-full"
              style={{ width: 3, height: 26, backgroundColor: "var(--sirkel)" }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: "var(--ink)" }}>
                {h.tittel}
              </p>
              {h.sted && (
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                  {h.sted}
                </p>
              )}
              {h.helDag && (
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Hele dagen
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
