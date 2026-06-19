export const dynamic = "force-dynamic";

import { db } from "@/db";
import { domains } from "@/db/schema";
import { asc } from "drizzle-orm";
import LoggUtKnapp from "@/components/LoggUtKnapp";
import FangstSeksjon from "@/components/FangstSeksjon";

export default async function Hjem() {
  const alleDomener = await db
    .select()
    .from(domains)
    .orderBy(asc(domains.rekkefølge));

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Livssystem</h1>
          <LoggUtKnapp />
        </div>

        <FangstSeksjon />

        <section className="mt-6">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Domener
          </h2>
          <div className="space-y-2">
            {alleDomener.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.farge }}
                />
                <span className="text-gray-900 text-sm font-medium">
                  {d.navn}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
