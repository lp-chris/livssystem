import Anthropic from "@anthropic-ai/sdk";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { hentDagensHendelser } from "@/lib/googleKalender";

export type Tilstand = "ok" | "advarsel" | "feil";

export type Integrasjonsstatus = {
  navn: string;
  tilstand: Tilstand;
  detalj: string;
};

function harEnv(navn: string): boolean {
  return !!process.env[navn] && process.env[navn]!.trim().length > 0;
}

async function sjekkDatabase(): Promise<Integrasjonsstatus> {
  try {
    await db.execute(sql`SELECT 1`);
    return {
      navn: "Database (Postgres)",
      tilstand: "ok",
      detalj: "Tilkobling svarer.",
    };
  } catch (err) {
    return {
      navn: "Database (Postgres)",
      tilstand: "feil",
      detalj: err instanceof Error ? err.message : "Ukjent feil.",
    };
  }
}

async function sjekkGoogleKalender(): Promise<Integrasjonsstatus> {
  const navn = "Google Calendar (lesing)";
  const manglerEnv = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REFRESH_TOKEN",
  ].filter((n) => !harEnv(n));

  if (manglerEnv.length) {
    return {
      navn,
      tilstand: "advarsel",
      detalj: `Mangler: ${manglerEnv.join(", ")}`,
    };
  }

  try {
    const hendelser = await hentDagensHendelser();
    return {
      navn,
      tilstand: "ok",
      detalj: `Henter kalender. ${hendelser.length} hendelse(r) i dag.`,
    };
  } catch (err) {
    return {
      navn,
      tilstand: "feil",
      detalj: err instanceof Error ? err.message : "Klarte ikke hente kalender.",
    };
  }
}

async function sjekkAnthropic(): Promise<Integrasjonsstatus> {
  const navn = "Anthropic (AI-ruting)";
  if (!harEnv("ANTHROPIC_API_KEY")) {
    return {
      navn,
      tilstand: "feil",
      detalj: "Mangler ANTHROPIC_API_KEY.",
    };
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    await client.models.list({ limit: 1 });
    return { navn, tilstand: "ok", detalj: "API-nøkkel virker." };
  } catch (err) {
    return {
      navn,
      tilstand: "feil",
      detalj: err instanceof Error ? err.message : "API-nøkkel avvist.",
    };
  }
}

function sjekkPushover(): Integrasjonsstatus {
  const navn = "Pushover (varsler)";
  const manglerEnv = ["PUSHOVER_APP_TOKEN", "PUSHOVER_USER_KEY"].filter(
    (n) => !harEnv(n)
  );
  if (manglerEnv.length) {
    return {
      navn,
      tilstand: "advarsel",
      detalj: `Mangler: ${manglerEnv.join(", ")} — varsler sendes ikke.`,
    };
  }
  return {
    navn,
    tilstand: "ok",
    detalj: "Nøkler satt. (Sender kun ved faktisk varsel.)",
  };
}

function sjekkCron(): Integrasjonsstatus {
  const navn = "Cron (påminnelser)";
  if (!harEnv("CRON_SECRET")) {
    return {
      navn,
      tilstand: "advarsel",
      detalj: "Mangler CRON_SECRET — påminnelses-jobben er ikke beskyttet.",
    };
  }
  return { navn, tilstand: "ok", detalj: "Hemmelighet satt." };
}

export async function hentIntegrasjonsstatus(): Promise<Integrasjonsstatus[]> {
  const [database, kalender, anthropic] = await Promise.all([
    sjekkDatabase(),
    sjekkGoogleKalender(),
    sjekkAnthropic(),
  ]);
  return [database, kalender, anthropic, sjekkPushover(), sjekkCron()];
}
