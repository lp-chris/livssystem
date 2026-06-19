import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { domains } from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool);

async function seed() {
  console.log("Seeder domener...");

  await db
    .insert(domains)
    .values([
      { navn: "Meg", farge: "#6B7280", rekkefølge: 1 },
      { navn: "Oss", farge: "#10B981", rekkefølge: 2 },
      { navn: "Stall", farge: "#F59E0B", rekkefølge: 3 },
      { navn: "Hest", farge: "#8B5CF6", rekkefølge: 4 },
    ])
    .onConflictDoNothing();

  console.log("✓ Domener seeded");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
