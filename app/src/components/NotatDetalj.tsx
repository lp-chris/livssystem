"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Domene = { id: number; navn: string; farge: string };

type Notat = {
  id: number;
  tittel: string | null;
  innhold: string | null;
  favoritt: boolean;
  domainId: number | null;
  tags: string[] | null;
  opprettet: Date;
};

export default function NotatDetalj({
  notat: init,
  domener,
}: {
  notat: Notat;
  domener: Domene[];
}) {
  const [notat, setNotat] = useState(init);
  const [nyTag, setNyTag] = useState("");
  const [visSlettBekreft, setVisSlettBekreft] = useState(false);
  const router = useRouter();
  const tagInputRef = useRef<HTMLInputElement>(null);

  async function lagre(felt: string, verdi: unknown) {
    await fetch(`/api/bibliotek/${notat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [felt]: verdi }),
    });
  }

  async function toggleFavoritt() {
    const ny = !notat.favoritt;
    setNotat((n) => ({ ...n, favoritt: ny }));
    await lagre("favoritt", ny);
  }

  async function settDomene(domainId: number | null) {
    setNotat((n) => ({ ...n, domainId }));
    await lagre("domainId", domainId);
  }

  async function leggTilTag() {
    const tag = nyTag.trim().toLowerCase();
    if (!tag || notat.tags?.includes(tag)) {
      setNyTag("");
      return;
    }
    const oppdaterteTags = [...(notat.tags ?? []), tag];
    setNotat((n) => ({ ...n, tags: oppdaterteTags }));
    setNyTag("");
    await lagre("tags", oppdaterteTags);
  }

  async function fjernTag(tag: string) {
    const oppdaterteTags = (notat.tags ?? []).filter((t) => t !== tag);
    setNotat((n) => ({ ...n, tags: oppdaterteTags }));
    await lagre("tags", oppdaterteTags);
  }

  async function slett() {
    await fetch(`/api/bibliotek/${notat.id}`, { method: "DELETE" });
    router.push("/bibliotek");
    router.refresh();
  }

  const aktivtDomene = domener.find((d) => d.id === notat.domainId);

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/bibliotek"
          className="min-w-[44px] min-h-[44px] flex items-center text-sm gap-1"
          style={{ color: "var(--muted)" }}
        >
          ← Bibliotek
        </Link>
        <button
          onClick={toggleFavoritt}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xl"
          aria-label={notat.favoritt ? "Fjern favoritt" : "Marker som favoritt"}
        >
          <span style={{ color: notat.favoritt ? "var(--hest)" : "var(--border)" }}>★</span>
        </button>
      </header>

      {/* Tittel */}
      <input
        type="text"
        defaultValue={notat.tittel ?? ""}
        onBlur={(e) => {
          const v = e.target.value.trim() || null;
          setNotat((n) => ({ ...n, tittel: v }));
          lagre("tittel", v);
        }}
        placeholder="Tittel…"
        className="w-full bg-transparent font-semibold mb-4 focus:outline-none"
        style={{
          fontSize: 22,
          color: "var(--ink)",
          borderBottom: "2px solid var(--border)",
          paddingBottom: 8,
        }}
      />

      {/* Innhold */}
      <textarea
        defaultValue={notat.innhold ?? ""}
        onBlur={(e) => {
          const v = e.target.value.trim() || null;
          setNotat((n) => ({ ...n, innhold: v }));
          lagre("innhold", v);
        }}
        placeholder="Innhold…"
        rows={10}
        className="w-full bg-transparent text-sm leading-relaxed resize-none focus:outline-none mb-6"
        style={{ color: "var(--ink)" }}
      />

      {/* Domene */}
      <div className="mb-5">
        <div
          className="text-[11px] font-bold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Domene
        </div>
        <div className="flex flex-wrap gap-2">
          {domener.map((d) => {
            const aktiv = notat.domainId === d.id;
            return (
              <button
                key={d.id}
                onClick={() => settDomene(aktiv ? null : d.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm min-h-[36px] transition-colors"
                style={{
                  backgroundColor: aktiv ? "var(--ink)" : "var(--surface)",
                  color: aktiv ? "var(--surface)" : "var(--ink-3)",
                  border: `1px solid ${aktiv ? "var(--ink)" : "var(--border)"}`,
                }}
              >
                <span
                  className="rounded-full"
                  style={{ width: 7, height: 7, backgroundColor: d.farge, display: "inline-block" }}
                />
                {d.navn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-8">
        <div
          className="text-[11px] font-bold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Tags
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {(notat.tags ?? []).map((tag) => (
            <button
              key={tag}
              onClick={() => fjernTag(tag)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--ink-3)",
                border: "1px solid var(--border)",
              }}
            >
              {tag}
              <span style={{ color: "var(--muted)", fontSize: 11 }}>✕</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            ref={tagInputRef}
            type="text"
            value={nyTag}
            onChange={(e) => setNyTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                leggTilTag();
              }
            }}
            placeholder="Legg til tag…"
            className="flex-1 rounded-[12px] px-3 py-2 text-sm focus:outline-none"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--ink)",
            }}
          />
          <button
            onClick={leggTilTag}
            disabled={!nyTag.trim()}
            className="px-3 py-2 rounded-[12px] text-sm min-h-[44px] disabled:opacity-40"
            style={{
              backgroundColor: "var(--ink)",
              color: "var(--surface)",
            }}
          >
            +
          </button>
        </div>
      </div>

      <p className="text-xs mb-8 text-center" style={{ color: "var(--border)" }}>
        Lagt til{" "}
        {new Date(notat.opprettet).toLocaleDateString("nb-NO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Slett */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        {!visSlettBekreft ? (
          <button
            onClick={() => setVisSlettBekreft(true)}
            className="text-sm min-h-[44px] px-2"
            style={{ color: "var(--muted)" }}
          >
            Slett notat
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setVisSlettBekreft(false)}
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
              onClick={slett}
              className="flex-1 py-3 rounded-[14px] text-sm font-medium"
              style={{ backgroundColor: "#e53e3e", color: "white" }}
            >
              Ja, slett
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
