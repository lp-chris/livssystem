"use client";

import { useEffect, useState } from "react";

type Hendelse = {
  id: string;
  tittel: string;
  start: string;
  slutt: string;
  helDag: boolean;
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
      <h2
        className="text-[11px] font-bold uppercase mb-3"
        style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
      >
        I dag
      </h2>
      <div className="space-y-2">
        {hendelser.map((h) => (
          <div
            key={h.id}
            className="flex items-center gap-3 px-4 py-3 rounded-[18px]"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-1 self-stretch rounded-full flex-shrink-0"
              style={{ backgroundColor: "var(--meg)", minHeight: 20 }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: "var(--ink)" }}>
                {h.tittel}
              </p>
              {!h.helDag && (
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {formaterTid(h.start)}–{formaterTid(h.slutt)}
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
