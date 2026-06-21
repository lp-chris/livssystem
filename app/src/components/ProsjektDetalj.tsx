"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Prosjekt = {
  id: number;
  navn: string;
  beskrivelse: string | null;
  type: string;
  status: string;
  endDate: string | null;
  domainId: number;
};

type Domene = { id: number; navn: string; farge: string };

type Milepæl = {
  id: number;
  navn: string;
  forfall: string | null;
  fullført: boolean;
  rekkefølge: number;
};

type Oppgave = {
  id: number;
  tittel: string;
  status: string;
  forfall: string | null;
  prioritet: string;
};

const DOMENE_FARGE: Record<string, string> = {
  Meg: "var(--meg)",
  Oss: "var(--oss)",
  Stall: "var(--stall)",
  Hest: "var(--hest)",
};

export default function ProsjektDetalj({
  prosjekt,
  domene,
  milepæler: initialMilepæler,
  oppgaver,
}: {
  prosjekt: Prosjekt;
  domene: Domene;
  milepæler: Milepæl[];
  oppgaver: Oppgave[];
}) {
  const [milepæler, setMilepæler] = useState(initialMilepæler);
  const [nyMilepæl, setNyMilepæl] = useState("");
  const [leggerTil, setLeggerTil] = useState(false);
  const [visSlettBekreft, setVisSlettBekreft] = useState(false);
  const router = useRouter();

  const åpneOppgaver = oppgaver.filter((o) => o.status === "åpen");
  const fullførteOppgaver = oppgaver.filter((o) => o.status === "gjort");

  const totalMilepæler = milepæler.length;
  const fullførtMilepæler = milepæler.filter((m) => m.fullført).length;
  const prosent = totalMilepæler > 0 ? Math.round((fullførtMilepæler / totalMilepæler) * 100) : null;

  const domeneFarge = DOMENE_FARGE[domene?.navn ?? ""] ?? "var(--muted)";

  async function toggleMilepæl(milepæl: Milepæl) {
    const oppdatert = { ...milepæl, fullført: !milepæl.fullført };
    setMilepæler((prev) => prev.map((m) => (m.id === milepæl.id ? oppdatert : m)));

    await fetch(`/api/milestone/${milepæl.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullført: !milepæl.fullført }),
    });
  }

  async function leggTilMilepæl() {
    if (!nyMilepæl.trim()) return;
    setLeggerTil(true);
    try {
      const res = await fetch(`/api/prosjekter/${prosjekt.id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navn: nyMilepæl.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Kunne ikke lagre milepæl: ${data.feil ?? res.status}`);
        return;
      }
      const ny = await res.json();
      setMilepæler((prev) => [...prev, ny]);
      setNyMilepæl("");
    } catch {
      alert("Nettverksfeil — prøv igjen.");
    } finally {
      setLeggerTil(false);
    }
  }

  async function slettProsjekt() {
    await fetch(`/api/prosjekter/${prosjekt.id}`, { method: "DELETE" });
    router.push("/prosjekter");
    router.refresh();
  }

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/prosjekter"
            className="min-w-[44px] min-h-[44px] flex items-center"
            style={{ color: "var(--muted)", fontSize: 18 }}
          >
            ←
          </Link>
          <div
            className="text-[10px] font-bold uppercase px-2 py-1 rounded-full"
            style={{ backgroundColor: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
          >
            {prosjekt.type === "område" ? "Område" : "Prosjekt"} · {domene?.navn}
          </div>
        </div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          {prosjekt.navn}
        </h1>
        {prosjekt.beskrivelse && (
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {prosjekt.beskrivelse}
          </p>
        )}
        {prosjekt.endDate && (
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Frist: {new Date(prosjekt.endDate).toLocaleDateString("nb-NO")}
          </p>
        )}
      </header>

      <div className="space-y-6">
        {/* Fremdrift */}
        {prosent !== null && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                Fremdrift
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                {prosent}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--border)" }}
            >
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${prosent}%`, backgroundColor: domeneFarge }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {fullførtMilepæler} av {totalMilepæler} milepæler fullført
            </p>
          </section>
        )}

        {/* Milepæler */}
        <section>
          <h2
            className="text-[11px] font-bold uppercase mb-3"
            style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
          >
            Milepæler
          </h2>

          <div className="space-y-1">
            {milepæler.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMilepæl(m)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] min-h-[52px] text-left"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  opacity: m.fullført ? 0.6 : 1,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    border: `2px solid ${m.fullført ? domeneFarge : "var(--border)"}`,
                    backgroundColor: m.fullført ? domeneFarge : "transparent",
                  }}
                >
                  {m.fullført && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  className="text-sm flex-1"
                  style={{
                    color: "var(--ink)",
                    textDecoration: m.fullført ? "line-through" : "none",
                  }}
                >
                  {m.navn}
                </span>
                {m.forfall && (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {new Date(m.forfall).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Legg til milepæl */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Ny milepæl…"
              value={nyMilepæl}
              onChange={(e) => setNyMilepæl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && leggTilMilepæl()}
              className="flex-1 rounded-[14px] px-4 py-3 text-sm focus:outline-none min-h-[44px]"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            />
            <button
              onClick={leggTilMilepæl}
              disabled={!nyMilepæl.trim() || leggerTil}
              className="min-w-[44px] min-h-[44px] rounded-[14px] px-3 text-lg"
              style={{
                backgroundColor: nyMilepæl.trim() ? "var(--ink)" : "var(--border)",
                color: nyMilepæl.trim() ? "var(--surface)" : "var(--muted)",
              }}
            >
              +
            </button>
          </div>
        </section>

        {/* Åpne oppgaver */}
        {åpneOppgaver.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase mb-3"
              style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
            >
              Oppgaver ({åpneOppgaver.length})
            </h2>
            <div className="space-y-1">
              {åpneOppgaver.map((o) => (
                <Link
                  key={o.id}
                  href={`/oppgaver/${o.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-[16px] min-h-[52px]"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <span className="text-sm flex-1" style={{ color: "var(--ink)" }}>
                    {o.tittel}
                  </span>
                  {o.forfall && (
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {new Date(o.forfall).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Slett */}
        <section className="pt-4">
          {!visSlettBekreft ? (
            <button
              onClick={() => setVisSlettBekreft(true)}
              className="text-sm min-h-[44px] px-4"
              style={{ color: "var(--muted)" }}
            >
              Arkiver prosjekt
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
                onClick={slettProsjekt}
                className="flex-1 py-3 rounded-[14px] text-sm font-medium"
                style={{ backgroundColor: "#e53e3e", color: "white" }}
              >
                Ja, slett
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
