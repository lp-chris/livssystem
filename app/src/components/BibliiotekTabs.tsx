"use client";

import { useState } from "react";
import Link from "next/link";
import LeggTilBokKnapp from "@/components/LeggTilBokKnapp";

type Domene = { id: number; navn: string; farge: string };

type LibraryItem = {
  id: number;
  type: string;
  tittel: string | null;
  innhold: string | null;
  kilde: string | null;
  forfatter: string | null;
  leseStatus: string | null;
  format: string | null;
  omslagUrl: string | null;
  rating: number | null;
  favoritt: boolean;
  tags: string[] | null;
  domainId: number | null;
  opprettet: Date;
};

const leseStatusEtikett: Record<string, string> = {
  vil_lese: "Vil lese",
  leser: "Leser nå",
  fullført: "Lest",
};

type Fane = "notater" | "sitater" | "bøker";

export default function BibliiotekTabs({
  items,
  domener,
}: {
  items: LibraryItem[];
  domener: Domene[];
}) {
  const [aktivFane, setAktivFane] = useState<Fane>("notater");
  const [aktivTag, setAktivTag] = useState<string | null>(null);
  const [aktivDomene, setAktivDomene] = useState<number | null>(null);
  const [aktivBokStatus, setAktivBokStatus] = useState<string | null>(null);
  const [kunFavoritter, setKunFavoritter] = useState(false);

  const notater = items.filter((i) => i.type === "notat");
  const sitater = items.filter((i) => i.type === "sitat");
  const bøker = items.filter((i) => i.type === "bok");

  const faner: { key: Fane; label: string; antall: number }[] = [
    { key: "notater", label: "Notater", antall: notater.length },
    { key: "sitater", label: "Sitater", antall: sitater.length },
    { key: "bøker", label: "Bøker", antall: bøker.length },
  ];

  const domeneFraId = Object.fromEntries(domener.map((d) => [d.id, d]));

  const aktivItems =
    aktivFane === "notater"
      ? notater
      : aktivFane === "sitater"
      ? sitater
      : bøker;

  const alleTags =
    aktivFane === "notater"
      ? Array.from(new Set(notater.flatMap((n) => n.tags ?? []))).sort()
      : [];

  const filtrertNotater = notater.filter((n) => {
    if (aktivTag && !(n.tags ?? []).includes(aktivTag)) return false;
    if (aktivDomene !== null && n.domainId !== aktivDomene) return false;
    if (kunFavoritter && !n.favoritt) return false;
    return true;
  });

  const filtrertSitater = kunFavoritter
    ? sitater.filter((s) => s.favoritt)
    : sitater;

  const filtrertBøker = bøker.filter((b) => {
    if (aktivBokStatus && (b.leseStatus ?? "vil_lese") !== aktivBokStatus)
      return false;
    if (kunFavoritter && !b.favoritt) return false;
    return true;
  });

  // Favoritt-pillen vises kun når fanen faktisk har favoritter å filtrere på
  const harFavoritter = aktivItems.some((i) => i.favoritt);

  function byttFane(fane: Fane) {
    setAktivFane(fane);
    setAktivTag(null);
    setAktivDomene(null);
    setAktivBokStatus(null);
    setKunFavoritter(false);
  }

  function FavorittPille() {
    if (!harFavoritter) return null;
    return (
      <button
        onClick={() => setKunFavoritter(!kunFavoritter)}
        className="px-3 py-1 rounded-full text-sm"
        style={{
          backgroundColor: kunFavoritter ? "var(--ink)" : "var(--surface)",
          color: kunFavoritter ? "var(--surface)" : "var(--ink-3)",
          border: `1px solid ${kunFavoritter ? "var(--ink)" : "var(--border)"}`,
        }}
      >
        ★ Favoritter
      </button>
    );
  }

  return (
    <div>
      {/* Fane-rad */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-[14px]"
        style={{ backgroundColor: "var(--surface)" }}
      >
        {faner.map((f) => (
          <button
            key={f.key}
            onClick={() => byttFane(f.key)}
            className="flex-1 text-sm py-2 rounded-[11px] transition-colors"
            style={{
              backgroundColor:
                aktivFane === f.key ? "var(--card)" : "transparent",
              color:
                aktivFane === f.key ? "var(--ink)" : "var(--muted)",
              fontWeight: aktivFane === f.key ? 500 : 400,
              boxShadow:
                aktivFane === f.key
                  ? "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
            {f.label}
            {f.antall > 0 && (
              <span
                className="ml-1.5 text-[11px]"
                style={{ color: "var(--muted)", opacity: 0.7 }}
              >
                {f.antall}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notater */}
      {aktivFane === "notater" && (
        <div>
          {/* Filter */}
          {(alleTags.length > 0 ||
            harFavoritter ||
            domener.some((d) => notater.some((n) => n.domainId === d.id))) && (
            <div className="flex flex-wrap gap-2 mb-4">
              <FavorittPille />
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
                      className="rounded-full flex-none"
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
              {alleTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setAktivTag(aktivTag === tag ? null : tag)}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor:
                      aktivTag === tag ? "var(--ink)" : "var(--surface)",
                    color:
                      aktivTag === tag ? "var(--surface)" : "var(--ink-3)",
                    border: `1px solid ${aktivTag === tag ? "var(--ink)" : "var(--border)"}`,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {filtrertNotater.length === 0 && (
            <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
              {notater.length === 0
                ? "Ingen notater ennå."
                : "Ingen notater matcher filteret."}
            </p>
          )}

          <div className="space-y-2">
            {filtrertNotater.map((n) => {
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
        </div>
      )}

      {/* Sitater */}
      {aktivFane === "sitater" && (
        <div>
          {harFavoritter && (
            <div className="flex flex-wrap gap-2 mb-4">
              <FavorittPille />
            </div>
          )}
          {sitater.length === 0 && (
            <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
              Ingen sitater ennå.
            </p>
          )}
          {sitater.length > 0 && filtrertSitater.length === 0 && (
            <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
              Ingen favoritt-sitater.
            </p>
          )}
          <div className="space-y-2">
            {filtrertSitater.map((s) => (
              <Link
                key={s.id}
                href={`/bibliotek/${s.id}`}
                className="block px-4 py-4 rounded-[22px] transition-opacity active:opacity-70"
                style={{
                  backgroundColor: "#EBE6DB",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-sm leading-relaxed line-clamp-2"
                  style={{ color: "var(--ink-2)", fontStyle: "italic" }}
                >
                  "{s.innhold}"
                </p>
                {s.kilde && (
                  <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
                    — {s.kilde}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bøker */}
      {aktivFane === "bøker" && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            {bøker.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {[
                  { verdi: "vil_lese", etikett: "Vil lese" },
                  { verdi: "leser", etikett: "Leser nå" },
                  { verdi: "fullført", etikett: "Lest" },
                ].map((s) => {
                  const antall = bøker.filter(
                    (b) => (b.leseStatus ?? "vil_lese") === s.verdi
                  ).length;
                  const aktiv = aktivBokStatus === s.verdi;
                  return (
                    <button
                      key={s.verdi}
                      onClick={() => setAktivBokStatus(aktiv ? null : s.verdi)}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: aktiv ? "var(--ink)" : "var(--surface)",
                        color: aktiv ? "var(--surface)" : "var(--ink-3)",
                        border: `1px solid ${aktiv ? "var(--ink)" : "var(--border)"}`,
                      }}
                    >
                      {s.etikett}
                      <span className="ml-1.5 text-[11px]" style={{ opacity: 0.7 }}>
                        {antall}
                      </span>
                    </button>
                  );
                })}
                <FavorittPille />
              </div>
            ) : (
              <span />
            )}
            <LeggTilBokKnapp />
          </div>
          {bøker.length === 0 && (
            <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
              Ingen bøker ennå.
            </p>
          )}
          {bøker.length > 0 && filtrertBøker.length === 0 && (
            <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
              Ingen bøker matcher filteret.
            </p>
          )}
          <div className="space-y-2">
            {filtrertBøker.map((b) => (
              <Link
                key={b.id}
                href={`/bibliotek/${b.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-[22px] transition-opacity active:opacity-70"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                {b.omslagUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.omslagUrl}
                    alt=""
                    className="w-10 h-14 object-cover rounded-[6px] flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-14 rounded-[6px] flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "var(--surface)", color: "var(--hest)", fontSize: 18 }}
                  >
                    ❧
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--ink)" }}
                  >
                    {b.tittel}
                  </div>
                  {(b.forfatter || b.format === "lydbok") && (
                    <div
                      className="text-xs mt-0.5 flex items-center gap-1"
                      style={{ color: "var(--muted)" }}
                    >
                      {b.format === "lydbok" && <span title="Lydbok">🎧</span>}
                      {b.forfatter && <span>{b.forfatter}</span>}
                    </div>
                  )}
                  {b.rating != null && b.rating > 0 && (
                    <div className="text-xs mt-0.5" style={{ color: "var(--hest)" }}>
                      {"★".repeat(b.rating)}
                      <span style={{ color: "var(--border)" }}>
                        {"★".repeat(5 - b.rating)}
                      </span>
                    </div>
                  )}
                </div>
                {b.leseStatus && (
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: "var(--muted)" }}
                  >
                    {leseStatusEtikett[b.leseStatus] ?? b.leseStatus}
                  </span>
                )}
                {b.favoritt && (
                  <span style={{ color: "var(--hest)" }}>★</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
