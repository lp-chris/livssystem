export const dynamic = "force-dynamic";

import { db } from "@/db";
import { libraryItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

function formaterDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function kortUtdrag(innhold: string | null, maks = 120): string {
  if (!innhold) return "";
  return innhold.length > maks ? innhold.slice(0, maks).trimEnd() + "…" : innhold;
}

export default async function JournalArkivSide() {
  const poster = await db
    .select()
    .from(libraryItems)
    .where(eq(libraryItems.type, "journal"))
    .orderBy(desc(libraryItems.opprettet));

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-3xl md:px-10 md:pt-10">
      <header className="mb-8">
        <Link
          href="/journal"
          className="text-sm inline-flex items-center min-h-[44px]"
          style={{ color: "var(--muted)" }}
        >
          ← Dagens journal
        </Link>
        <h1 className="text-2xl font-semibold mt-2" style={{ color: "var(--ink)" }}>
          Arkiv
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
          Eldre fritekst-poster · {poster.length}{" "}
          {poster.length === 1 ? "post" : "poster"}
        </p>
      </header>

      {poster.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Ingen poster i arkivet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {poster.map((p) => (
            <Link
              key={p.id}
              href={`/journal/arkiv/${p.id}`}
              className="block px-4 py-4 rounded-[18px]"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-[11px] font-medium uppercase mb-1.5"
                style={{ letterSpacing: "0.08em", color: "var(--muted)" }}
              >
                {formaterDato(new Date(p.opprettet))}
              </p>
              {p.tittel && (
                <p className="text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
                  {p.tittel}
                </p>
              )}
              {p.innhold && (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: p.tittel ? "var(--muted)" : "var(--ink)" }}
                >
                  {kortUtdrag(p.innhold)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
