"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type OpenLibraryTreff = {
  key: string;
  title: string;
  author_name?: string[];
  isbn?: string[];
  cover_i?: number;
  first_publish_year?: number;
};

type ValgtBok = {
  tittel: string;
  forfatter: string;
  isbn: string;
  omslagUrl: string;
};

const LESE_STATUS = [
  { verdi: "vil_lese", etikett: "Vil lese" },
  { verdi: "leser", etikett: "Leser nå" },
  { verdi: "fullført", etikett: "Lest" },
];

export default function LeggTilBokKnapp() {
  const [åpen, setÅpen] = useState(false);
  const [søk, setSøk] = useState("");
  const [resultater, setResultater] = useState<OpenLibraryTreff[]>([]);
  const [søker, setSøker] = useState(false);
  const [valgt, setValgt] = useState<ValgtBok | null>(null);
  const [leseStatus, setLeseStatus] = useState("vil_lese");
  const [lagrer, setLagrer] = useState(false);
  const søkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!åpen) {
      setSøk("");
      setResultater([]);
      setValgt(null);
      setLeseStatus("vil_lese");
    }
  }, [åpen]);

  function håndterSøk(tekst: string) {
    setSøk(tekst);
    setValgt(null);
    if (søkTimer.current) clearTimeout(søkTimer.current);
    if (!tekst.trim()) { setResultater([]); return; }
    søkTimer.current = setTimeout(async () => {
      setSøker(true);
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(tekst)}&limit=6&fields=key,title,author_name,isbn,cover_i,first_publish_year`
        );
        const data = await res.json();
        setResultater(data.docs ?? []);
      } catch {
        setResultater([]);
      } finally {
        setSøker(false);
      }
    }, 400);
  }

  function velgBok(t: OpenLibraryTreff) {
    setValgt({
      tittel: t.title,
      forfatter: t.author_name?.[0] ?? "",
      isbn: t.isbn?.[0] ?? "",
      omslagUrl: t.cover_i
        ? `https://covers.openlibrary.org/b/id/${t.cover_i}-M.jpg`
        : "",
    });
    setResultater([]);
    setSøk("");
  }

  async function lagre() {
    if (!valgt) return;
    setLagrer(true);
    await fetch("/api/bibliotek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "bok",
        tittel: valgt.tittel,
        forfatter: valgt.forfatter || null,
        isbn: valgt.isbn || null,
        omslagUrl: valgt.omslagUrl || null,
        leseStatus,
      }),
    });
    setLagrer(false);
    setÅpen(false);
    router.refresh();
  }

  if (!åpen) {
    return (
      <button
        onClick={() => setÅpen(true)}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xl"
        style={{ color: "var(--ink)" }}
        aria-label="Legg til bok"
      >
        +
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setÅpen(false); }}
    >
      <div
        className="w-full max-w-md rounded-t-[24px] px-4 pt-6 pb-10"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--ink)" }}>
          Legg til bok
        </h2>

        {/* Valgt bok */}
        {valgt ? (
          <div
            className="flex gap-3 p-3 rounded-[16px] mb-4"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            {valgt.omslagUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={valgt.omslagUrl}
                alt=""
                className="w-12 h-16 object-cover rounded-[8px] flex-shrink-0"
              />
            ) : (
              <div
                className="w-12 h-16 rounded-[8px] flex-shrink-0 flex items-center justify-center text-xl"
                style={{ backgroundColor: "var(--surface)" }}
              >
                📖
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                {valgt.tittel}
              </p>
              {valgt.forfatter && (
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {valgt.forfatter}
                </p>
              )}
              <button
                onClick={() => setValgt(null)}
                className="text-xs mt-2"
                style={{ color: "var(--muted)" }}
              >
                Bytt bok
              </button>
            </div>
          </div>
        ) : (
          /* Søkefelt */
          <div className="relative mb-2">
            <input
              type="text"
              autoFocus
              placeholder="Søk på tittel eller forfatter…"
              value={søk}
              onChange={(e) => håndterSøk(e.target.value)}
              className="w-full rounded-[14px] px-4 py-3 text-sm focus:outline-none"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            />
            {søker && (
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "var(--muted)" }}
              >
                Søker…
              </span>
            )}
          </div>
        )}

        {/* Søkeresultater */}
        {resultater.length > 0 && !valgt && (
          <div
            className="rounded-[14px] overflow-hidden mb-4"
            style={{ border: "1px solid var(--border)" }}
          >
            {resultater.map((t, i) => (
              <button
                key={t.key}
                onClick={() => velgBok(t)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  backgroundColor: "var(--card)",
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  color: "var(--ink)",
                }}
              >
                {t.cover_i ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://covers.openlibrary.org/b/id/${t.cover_i}-S.jpg`}
                    alt=""
                    className="w-8 h-11 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-8 h-11 rounded flex-shrink-0 flex items-center justify-center text-sm"
                    style={{ backgroundColor: "var(--surface)" }}
                  >
                    📖
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  {t.author_name?.[0] && (
                    <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                      {t.author_name[0]}
                      {t.first_publish_year ? ` · ${t.first_publish_year}` : ""}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Lese-status (vises kun når bok er valgt) */}
        {valgt && (
          <div className="mb-4">
            <p
              className="text-[11px] font-bold uppercase mb-2"
              style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
            >
              Status
            </p>
            <div className="flex gap-2">
              {LESE_STATUS.map((s) => (
                <button
                  key={s.verdi}
                  onClick={() => setLeseStatus(s.verdi)}
                  className="flex-1 py-2.5 rounded-[12px] text-sm font-medium"
                  style={{
                    backgroundColor:
                      leseStatus === s.verdi ? "var(--ink)" : "var(--card)",
                    color:
                      leseStatus === s.verdi ? "var(--surface)" : "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {s.etikett}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Knapper */}
        <div className="flex gap-2 pt-1">
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
          {valgt && (
            <button
              onClick={lagre}
              disabled={lagrer}
              className="flex-1 py-3 rounded-[14px] text-sm font-medium"
              style={{
                backgroundColor: "var(--ink)",
                color: "var(--surface)",
              }}
            >
              {lagrer ? "Lagrer…" : "Lagre"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
