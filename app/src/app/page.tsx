export const dynamic = "force-dynamic";

import { db } from "@/db";
import { domains } from "@/db/schema";
import { asc } from "drizzle-orm";
import LoggUtKnapp from "@/components/LoggUtKnapp";

export default async function Hjem() {
  const alleDomener = await db.select().from(domains).orderBy(asc(domains.rekkefølge));

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Livssystem</h1>
          <LoggUtKnapp />
        </div>

        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Domener
          </h2>
          <div className="space-y-2">
            {alleDomener.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.farge }}
                />
                <span className="text-gray-900 font-medium">{d.navn}</span>
              </div>
            ))}
          </div>
          {alleDomener.length === 0 && (
            <p className="text-gray-500 text-sm">
              Ingen domener funnet. Kjør seed-scriptet.
            </p>
          )}
        </section>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Stack: Next.js · Drizzle · PostgreSQL · iron-session ✓
        </p>
      </div>
    </main>
  );
}
