"use client";

import { useEffect, useState } from "react";

export type Fangst = {
  id: number;
  råTekst: string;
  status: string;
  tolketJson?: {
    type?: string;
    tittel?: string;
    domene?: string | null;
  } | null;
  rutetTil?: { type: string; id: number } | null;
};

const typeEtikett: Record<string, string> = {
  oppgave: "Oppgave",
  rutine: "Rutine",
  notat: "Notat",
  sitat: "Sitat",
  bok: "Bok",
  journal: "Journal",
};

const DOMENER = ["Meg", "Oss", "Stall", "Hest"];

export default function SisteFangster({ init }: { init: Fangst[] }) {
  const [fangster, setFangster] = useState<Fangst[]>(init);
  const [åpenId, setÅpenId] = useState<number | null>(null);
  const [lagrerId, setLagrerId] = useState<number | null>(null);

  // Hold lista i takt med serveren (router.refresh() etter ny fangst)
  useEffect(() => {
    setFangster(init);
  }, [init]);

  async function flytt(f: Fangst, domene: string | null) {
    setLagrerId(f.id);
    const res = await fetch(`/api/capture/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domene }),
    });
    setLagrerId(null);
    if (res.ok) {
      setFangster((prev) =>
        prev.map((x) =>
          x.id === f.id
            ? { ...x, tolketJson: { ...x.tolketJson, domene } }
            : x
        )
      );
      setÅpenId(null);
    }
  }

  if (fangster.length === 0) return null;

  return (
    <section className="mb-8">
      <h2
        className="text-[11px] font-bold uppercase mb-3"
        style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
      >
        Nylig fanget
      </h2>
      <div className="space-y-2">
        {fangster.map((f) => {
          const åpen = åpenId === f.id;
          // Journal-fangster ligger i dagens journal (uten domene) og kan ikke flyttes
          const kanFlyttes =
            Boolean(f.rutetTil?.id) && f.rutetTil?.type !== "journal";
          return (
            <div
              key={f.id}
              className="rounded-[14px] overflow-hidden"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <button
                onClick={() =>
                  kanFlyttes ? setÅpenId(åpen ? null : f.id) : undefined
                }
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                style={{ cursor: kanFlyttes ? "pointer" : "default" }}
              >
                <span
                  className="text-sm flex-1 min-w-0 truncate"
                  style={{ color: "var(--ink)" }}
                >
                  {f.tolketJson?.tittel ?? f.råTekst}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {f.tolketJson?.domene && (
                    <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                      {f.tolketJson.domene}
                    </span>
                  )}
                  {f.tolketJson?.type && (
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--surface)",
                        color: "var(--muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {typeEtikett[f.tolketJson.type] ?? f.tolketJson.type}
                    </span>
                  )}
                  {kanFlyttes && (
                    <span
                      className="text-[11px]"
                      style={{
                        color: "var(--muted)",
                        transform: åpen ? "rotate(180deg)" : "none",
                      }}
                    >
                      ⌄
                    </span>
                  )}
                </div>
              </button>

              {/* Domene-korreksjon */}
              {åpen && (
                <div
                  className="px-4 pb-3 pt-1"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <p
                    className="text-[11px] mb-2 mt-2"
                    style={{ color: "var(--muted)" }}
                  >
                    Flytt til domene
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DOMENER.map((d) => {
                      const aktiv = f.tolketJson?.domene === d;
                      return (
                        <button
                          key={d}
                          onClick={() => flytt(f, d)}
                          disabled={lagrerId === f.id}
                          className="px-3 py-1.5 rounded-full text-[13px] font-medium min-h-[36px] flex items-center gap-1.5"
                          style={{
                            backgroundColor: aktiv ? "var(--ink)" : "var(--surface)",
                            color: aktiv ? "var(--surface)" : "var(--ink-3)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <span
                            className="rounded-full flex-none"
                            style={{
                              width: 7,
                              height: 7,
                              backgroundColor: aktiv
                                ? "var(--surface)"
                                : `var(--${d.toLowerCase()})`,
                            }}
                          />
                          {d}
                        </button>
                      );
                    })}
                    {f.tolketJson?.domene && (
                      <button
                        onClick={() => flytt(f, null)}
                        disabled={lagrerId === f.id}
                        className="px-3 py-1.5 rounded-full text-[13px] min-h-[36px] flex items-center"
                        style={{
                          backgroundColor: "var(--surface)",
                          color: "var(--muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        Uten domene
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
