"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Oppgave = { id: number; tittel: string; forfall: string | null; prioritet: string };
type BibliotekElement = { id: number; type: string; tittel: string | null; innhold: string | null; kilde: string | null; forfatter: string | null };
type JournalTreff = { dato: string; utdrag: string };

const TYPE_ETIKETT: Record<string, string> = {
  notat: "Notat",
  sitat: "Sitat",
  bok: "Bok",
  journal: "Journal (arkiv)",
};

function formaterDato(dato: string): string {
  return new Date(dato + "T12:00:00").toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SokSide() {
  const [spørring, setSpørring] = useState("");
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([]);
  const [bibliotek, setBibliotek] = useState<BibliotekElement[]>([]);
  const [journal, setJournal] = useState<JournalTreff[]>([]);
  const [laster, setLaster] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (spørring.length < 2) {
      setOppgaver([]);
      setBibliotek([]);
      setJournal([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLaster(true);
      const res = await fetch(`/api/sok?q=${encodeURIComponent(spørring)}`);
      const data = await res.json();
      setOppgaver(data.oppgaver ?? []);
      setBibliotek(data.bibliotek ?? []);
      setJournal(data.journal ?? []);
      setLaster(false);
    }, 300);
  }, [spørring]);

  const ingenResultater =
    spørring.length >= 2 &&
    !laster &&
    oppgaver.length === 0 &&
    bibliotek.length === 0 &&
    journal.length === 0;

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-3xl md:px-10 md:pt-10">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center"
          style={{ color: "var(--ink-3)", fontSize: 15 }}
        >
          ←
        </button>
        <div
          className="flex-1 flex items-center gap-2 rounded-[16px] px-4"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            height: 48,
          }}
        >
          <span style={{ color: "var(--muted)" }}>🔍</span>
          <input
            ref={inputRef}
            type="search"
            value={spørring}
            onChange={(e) => setSpørring(e.target.value)}
            placeholder="Søk i oppgaver, bibliotek og journal…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{ color: "var(--ink)" }}
          />
          {spørring && (
            <button onClick={() => setSpørring("")} style={{ color: "var(--muted)" }}>
              ✕
            </button>
          )}
        </div>
      </header>

      {laster && (
        <p className="text-center text-sm py-8" style={{ color: "var(--muted)" }}>
          Søker…
        </p>
      )}

      {ingenResultater && (
        <p className="text-center text-sm py-8" style={{ color: "var(--muted)" }}>
          Ingen treff på «{spørring}»
        </p>
      )}

      <div className="space-y-6">
        {oppgaver.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase mb-3"
              style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
            >
              Oppgaver ({oppgaver.length})
            </h2>
            <div className="space-y-2">
              {oppgaver.map((o) => (
                <Link
                  key={o.id}
                  href={`/oppgaver/${o.id}`}
                  className="flex flex-col px-4 py-3 rounded-[18px] min-h-[56px] justify-center"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p className="text-sm" style={{ color: "var(--ink)" }}>
                    {o.tittel}
                  </p>
                  {o.forfall && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {o.forfall}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {journal.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase mb-3"
              style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
            >
              Journal ({journal.length})
            </h2>
            <div className="space-y-2">
              {journal.map((j) => (
                <Link
                  key={j.dato}
                  href={`/journal/${j.dato}`}
                  className="flex flex-col px-4 py-3 rounded-[18px] min-h-[56px] justify-center"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    className="text-sm font-medium capitalize"
                    style={{ color: "var(--ink)" }}
                  >
                    {formaterDato(j.dato)}
                  </p>
                  {j.utdrag && (
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{ color: "var(--ink-3)" }}
                    >
                      {j.utdrag}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {bibliotek.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase mb-3"
              style={{ letterSpacing: "0.12em", color: "var(--muted)" }}
            >
              Bibliotek ({bibliotek.length})
            </h2>
            <div className="space-y-2">
              {bibliotek.map((b) => (
                <Link
                  key={b.id}
                  href={
                    b.type === "journal"
                      ? `/journal/arkiv/${b.id}`
                      : `/bibliotek/${b.id}`
                  }
                  className="flex flex-col px-4 py-3 rounded-[18px] min-h-[56px] justify-center"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--surface)",
                        color: "var(--muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {TYPE_ETIKETT[b.type] ?? b.type}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "var(--ink)" }}>
                    {b.tittel ?? (b.innhold ?? "").slice(0, 80)}
                  </p>
                  {b.kilde && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      — {b.kilde}
                    </p>
                  )}
                  {b.forfatter && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {b.forfatter}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
