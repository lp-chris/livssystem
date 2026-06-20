"use client";

import { useState } from "react";
import Link from "next/link";

type Domene = { id: number; navn: string; farge: string };

type Notat = {
  id: number;
  tittel: string | null;
  innhold: string | null;
  domainId: number | null;
  tags: string[] | null;
  opprettet: Date;
};

export default function NotatListe({
  notater,
  domener,
}: {
  notater: Notat[];
  domener: Domene[];
}) {
  const [aktivTag, setAktivTag] = useState<string | null>(null);
  const [aktivDomene, setAktivDomene] = useState<number | null>(null);

  const alleTags = Array.from(
    new Set(notater.flatMap((n) => n.tags ?? []))
  ).sort();

  const domeneFraId = Object.fromEntries(domener.map((d) => [d.id, d]));

  const filtrert = notater.filter((n) => {
    if (aktivTag && !(n.tags ?? []).includes(aktivTag)) return false;
    if (aktivDomene !== null && n.domainId !== aktivDomene) return false;
    return true;
  });

  return (
    <section>
      <h2
        className="text-[11px] font-bold uppercase mb-3"
        style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
      >
        Notater ({notater.length})
      </h2>

      {/* Filter */}
      {(alleTags.length > 0 || domener.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Domenefilter */}
          {domener
            .filter((d) => notater.some((n) => n.domainId === d.id))
            .map((d) => (
              <button
                key={d.id}
                onClick={() =>
                  setAktivDomene(aktivDomene === d.id ? null : d.id)
                }
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor:
                    aktivDomene === d.id ? "var(--ink)" : "var(--surface)",
                  color:
                    aktivDomene === d.id ? "var(--surface)" : "var(--ink-3)",
                  border: `1px solid ${aktivDomene === d.id ? "var(--ink)" : "var(--border)"}`,
                }}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: 7,
                    height: 7,
                    backgroundColor: d.farge,
                    display: "inline-block",
                  }}
                />
                {d.navn}
              </button>
            ))}

          {/* Tagfilter */}
          {alleTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setAktivTag(aktivTag === tag ? null : tag)}
              className="px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor:
                  aktivTag === tag ? "var(--ink)" : "var(--surface)",
                color: aktivTag === tag ? "var(--surface)" : "var(--ink-3)",
                border: `1px solid ${aktivTag === tag ? "var(--ink)" : "var(--border)"}`,
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtrert.length === 0 && (
        <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
          Ingen notater matcher filteret.
        </p>
      )}

      <div className="space-y-2">
        {filtrert.map((n) => {
          const domene = n.domainId ? domeneFraId[n.domainId] : null;
          return (
            <Link
              key={n.id}
              href={`/bibliotek/${n.id}`}
              className="block px-4 py-3 rounded-[22px] transition-opacity active:opacity-70"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                {domene && (
                  <span
                    className="rounded-full flex-none"
                    style={{
                      width: 7,
                      height: 7,
                      backgroundColor: domene.farge,
                      display: "inline-block",
                    }}
                  />
                )}
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--ink)" }}
                >
                  {n.tittel ?? "(uten tittel)"}
                </p>
              </div>
              {n.innhold && (
                <p
                  className="text-xs mt-0.5 line-clamp-2"
                  style={{ color: "var(--ink-3)" }}
                >
                  {n.innhold}
                </p>
              )}
              {(n.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(n.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--surface)",
                        color: "var(--muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
