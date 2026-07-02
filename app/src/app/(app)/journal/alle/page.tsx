export const dynamic = "force-dynamic";

import { db } from "@/db";
import { journalEntries, journalAnswers, journalImages } from "@/db/schema";
import { desc, inArray } from "drizzle-orm";
import { iDagOslo } from "@/lib/dato";
import Link from "next/link";

function formaterDato(dato: string): string {
  const d = new Date(dato + "T12:00:00");
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AlleJournalSide() {
  const entries = await db
    .select()
    .from(journalEntries)
    .orderBy(desc(journalEntries.dato));

  const ids = entries.map((e) => e.id);
  const [svarRader, bilder] = await Promise.all([
    ids.length
      ? db.select().from(journalAnswers).where(inArray(journalAnswers.entryId, ids))
      : Promise.resolve([]),
    ids.length
      ? db.select().from(journalImages).where(inArray(journalImages.entryId, ids))
      : Promise.resolve([]),
  ]);

  // Bygg et kort utdrag per entry (første takknemlighetslinje, ellers annet svar).
  const svarPerEntry = new Map<number, Record<string, string>>();
  for (const r of svarRader) {
    const rec = svarPerEntry.get(r.entryId) ?? {};
    rec[r.questionKey] = r.svar ?? "";
    svarPerEntry.set(r.entryId, rec);
  }
  const bildePerEntry = new Map(bilder.map((b) => [b.entryId, b.url]));

  function utdrag(entryId: number): string {
    const s = svarPerEntry.get(entryId) ?? {};
    const gratitude = (s["morning.gratitude"] ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
    return (
      gratitude[0] ||
      (s["morning.great_day"] ?? "").trim() ||
      (s["morning.affirmation"] ?? "").trim() ||
      (s["evening.went_well"] ?? "").trim() ||
      ""
    );
  }

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-2xl md:px-10 md:pt-10">
      <header className="mb-7">
        <div className="flex items-center justify-between">
          <Link
            href="/journal"
            className="text-sm inline-flex items-center min-h-[44px]"
            style={{ color: "var(--muted)" }}
          >
            ← Dagens journal
          </Link>
          <Link
            href={`/journal/maned/${iDagOslo().slice(0, 7)}`}
            className="text-sm min-h-[44px] inline-flex items-center"
            style={{ color: "var(--muted)" }}
          >
            Måned
          </Link>
        </div>
        <h1 className="text-2xl font-semibold mt-2" style={{ color: "var(--ink)" }}>
          Alle oppføringer
        </h1>
      </header>

      {entries.length === 0 && (
        <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
          Ingen journaloppføringer ennå.
        </p>
      )}

      <div className="space-y-2">
        {entries.map((e) => {
          const tekst = utdrag(e.id);
          const bilde = bildePerEntry.get(e.id);
          return (
            <Link
              key={e.id}
              href={`/journal/${e.dato}`}
              className="flex items-center gap-3 px-4 py-3 rounded-[18px] transition-opacity active:opacity-70"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              {bilde ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bilde}
                  alt=""
                  className="w-12 h-12 object-cover rounded-[10px] flex-shrink-0"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: "var(--surface)", color: "var(--muted)", fontSize: 16 }}
                >
                  ✎
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize" style={{ color: "var(--ink)" }}>
                  {formaterDato(e.dato)}
                </p>
                {tekst && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--ink-3)" }}>
                    {tekst}
                  </p>
                )}
              </div>
              <span style={{ color: "var(--muted)", fontSize: 16 }}>→</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
