export const dynamic = "force-dynamic";

import { db } from "@/db";
import { journalEntries, journalAnswers, journalImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { iDagOslo } from "@/lib/dato";
import Link from "next/link";
import { notFound } from "next/navigation";

function formaterDato(dato: string): string {
  const d = new Date(dato + "T12:00:00");
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Seksjon({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2
        className="text-[11px] font-semibold uppercase mb-2.5"
        style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
      >
        {tittel}
      </h2>
      {children}
    </section>
  );
}

function Tekstkort({ tekst }: { tekst: string }) {
  return (
    <div
      className="rounded-[14px] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap"
      style={{
        color: "var(--ink)",
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      {tekst}
    </div>
  );
}

export default async function JournalDagSide({
  params,
}: {
  params: Promise<{ dato: string }>;
}) {
  const { dato } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dato)) notFound();

  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.dato, dato));
  if (!entry) notFound();

  const [svarRader, bilder] = await Promise.all([
    db.select().from(journalAnswers).where(eq(journalAnswers.entryId, entry.id)),
    db.select().from(journalImages).where(eq(journalImages.entryId, entry.id)),
  ]);

  const svar: Record<string, string> = Object.fromEntries(
    svarRader.map((r) => [r.questionKey, r.svar ?? ""])
  );
  const bildeUrl = bilder[0]?.url ?? null;

  const gratitude = (svar["morning.gratitude"] ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const greatDay = (svar["morning.great_day"] ?? "").trim();
  const affirmation = (svar["morning.affirmation"] ?? "").trim();
  const kveld = (svar["evening.went_well"] ?? "").trim();

  const maaned = dato.slice(0, 7);
  const erIDag = dato === iDagOslo();

  const harInnhold =
    gratitude.length > 0 || greatDay || affirmation || kveld || bildeUrl;

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-2xl md:px-10 md:pt-10">
      <header className="mb-7">
        <div className="flex items-center justify-between">
          <Link
            href="/journal/alle"
            className="text-sm inline-flex items-center min-h-[44px]"
            style={{ color: "var(--muted)" }}
          >
            ← Alle
          </Link>
          <div className="flex gap-3">
            <Link
              href={`/journal/maned/${maaned}`}
              className="text-sm min-h-[44px] inline-flex items-center"
              style={{ color: "var(--muted)" }}
            >
              Måned
            </Link>
            {erIDag && (
              <Link
                href="/journal"
                className="text-sm min-h-[44px] inline-flex items-center"
                style={{ color: "var(--ink-3)" }}
              >
                Rediger
              </Link>
            )}
          </div>
        </div>
        <h1
          className="text-2xl font-semibold capitalize mt-2"
          style={{ color: "var(--ink)" }}
        >
          {formaterDato(dato)}
        </h1>
        {entry.sted && (
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {entry.sted}
          </p>
        )}
      </header>

      {!harInnhold && (
        <p className="text-sm py-4" style={{ color: "var(--muted)" }}>
          Ingen notater denne dagen.
        </p>
      )}

      {gratitude.length > 0 && (
        <Seksjon tittel="Jeg er takknemlig for…">
          <div className="space-y-2">
            {gratitude.map((linje, i) => (
              <Tekstkort key={i} tekst={linje} />
            ))}
          </div>
        </Seksjon>
      )}

      {greatDay && (
        <Seksjon tittel="Hva ville gjort dagen god?">
          <Tekstkort tekst={greatDay} />
        </Seksjon>
      )}

      {affirmation && (
        <Seksjon tittel="Dagens affirmasjon">
          <Tekstkort tekst={affirmation} />
        </Seksjon>
      )}

      {bildeUrl && (
        <Seksjon tittel="Dagens bilde">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bildeUrl}
            alt="Dagens bilde"
            className="w-full rounded-[18px] object-cover"
            style={{ maxHeight: 360 }}
          />
        </Seksjon>
      )}

      {kveld && (
        <section
          className="mt-10 pt-7"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <h2
            className="text-[11px] font-semibold uppercase mb-2.5"
            style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
          >
            Hva gikk bra i dag?
          </h2>
          <Tekstkort tekst={kveld} />
        </section>
      )}
    </main>
  );
}
