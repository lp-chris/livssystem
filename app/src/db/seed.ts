import { db } from "./index";
import { domains } from "./schema";

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
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
