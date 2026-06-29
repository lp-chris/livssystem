export const dynamic = "force-dynamic";

import { db } from "@/db";
import { journalEntries, journalImages } from "@/db/schema";
import { and, gte, lte, inArray } from "drizzle-orm";
import { iDagOslo } from "@/lib/dato";
import Link from "next/link";
import { notFound } from "next/navigation";

const MND_NAVN = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default async function JournalManedSide({
  params,
}: {
  params: Promise<{ "yyyy-mm": string }>;
}) {
  const { "yyyy-mm": yyyymm } = await params;
  const m = /^(\d{4})-(\d{2})$/.exec(yyyymm);
  if (!m) notFound();
  const aar = parseInt(m[1]);
  const mnd = parseInt(m[2]); // 1-12
  if (mnd < 1 || mnd > 12) notFound();

  const forsteDato = `${aar}-${pad(mnd)}-01`;
  const antDager = new Date(aar, mnd, 0).getDate();
  const sisteDato = `${aar}-${pad(mnd)}-${pad(antDager)}`;

  // Entries i måneden
  const entries = await db
    .select()
    .from(journalEntries)
    .where(
      and(
        gte(journalEntries.dato, forsteDato),
        lte(journalEntries.dato, sisteDato)
      )
    );

  const datoTilEntry = new Map(entries.map((e) => [e.dato, e]));

  // Bilder for disse entriene
  const entryIds = entries.map((e) => e.id);
  const bilder = entryIds.length
    ? await db
        .select()
        .from(journalImages)
        .where(inArray(journalImages.entryId, entryIds))
    : [];
  const entryTilBilde = new Map(bilder.map((b) => [b.entryId, b.url]));

  const iDag = iDagOslo();

  // Navigasjon mellom måneder
  const forrige =
    mnd === 1 ? `${aar - 1}-12` : `${aar}-${pad(mnd - 1)}`;
  const neste = mnd === 12 ? `${aar + 1}-01` : `${aar}-${pad(mnd + 1)}`;

  // Mandag-først forskyvning. getDay(): 0=søn..6=lør → 0=man..6=søn
  const ukedag = new Date(aar, mnd - 1, 1).getDay();
  const forskyv = (ukedag + 6) % 7;

  const celler: (number | null)[] = [
    ...Array(forskyv).fill(null),
    ...Array.from({ length: antDager }, (_, i) => i + 1),
  ];

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-2xl md:px-10 md:pt-10">
      <header className="mb-7">
        <Link
          href="/journal"
          className="text-sm inline-flex items-center min-h-[44px]"
          style={{ color: "var(--muted)" }}
        >
          ← Dagens journal
        </Link>
        <div className="flex items-center justify-between mt-2">
          <Link
            href={`/journal/maned/${forrige}`}
            className="w-11 h-11 flex items-center justify-center text-lg"
            style={{ color: "var(--muted)" }}
            aria-label="Forrige måned"
          >
            ‹
          </Link>
          <h1
            className="text-xl font-semibold capitalize"
            style={{ color: "var(--ink)" }}
          >
            {MND_NAVN[mnd - 1]} {aar}
          </h1>
          <Link
            href={`/journal/maned/${neste}`}
            className="w-11 h-11 flex items-center justify-center text-lg"
            style={{ color: "var(--muted)" }}
            aria-label="Neste måned"
          >
            ›
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1.5">
        {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold uppercase pb-1"
            style={{ color: "var(--muted)" }}
          >
            {d}
          </div>
        ))}

        {celler.map((dag, i) => {
          if (dag === null) return <div key={`tom-${i}`} />;

          const datoStr = `${aar}-${pad(mnd)}-${pad(dag)}`;
          const entry = datoTilEntry.get(datoStr);
          const bilde = entry ? entryTilBilde.get(entry.id) : undefined;
          const erIDag = datoStr === iDag;

          return (
            <div
              key={datoStr}
              className="relative rounded-[12px] overflow-hidden"
              style={{
                aspectRatio: "1 / 1",
                backgroundColor: "var(--card)",
                border: erIDag
                  ? "2px solid var(--ink)"
                  : "1px solid var(--border)",
              }}
            >
              {bilde ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bilde}
                    alt={`Bilde ${dag}.`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span
                    className="absolute bottom-0.5 right-1 text-[10px] font-semibold"
                    style={{
                      color: "white",
                      textShadow: "0 1px 2px rgba(0,0,0,0.7)",
                    }}
                  >
                    {dag}
                  </span>
                </>
              ) : (
                <span
                  className="absolute top-1 left-1.5 text-[11px]"
                  style={{
                    color: entry ? "var(--ink)" : "var(--muted)",
                    fontWeight: entry ? 600 : 400,
                  }}
                >
                  {dag}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
