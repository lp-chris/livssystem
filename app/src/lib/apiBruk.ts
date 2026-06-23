import { db } from "@/db";
import { apiUsage } from "@/db/schema";

// Prisliste i USD per 1 million tokens. Oppdater her hvis modell/pris endres.
// Kilde: Anthropic-prising (Haiku 4.5: $1 input / $5 output per MTok).
export const MODELL_PRISER: Record<string, { input: number; output: number }> =
  {
    "claude-haiku-4-5": { input: 1.0, output: 5.0 },
    "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
    "claude-opus-4-8": { input: 5.0, output: 25.0 },
  };

// Omtrentlig vekslingskurs USD → NOK. Kostnadene er uansett bittesmå;
// dette gir bare et grovt anslag i kroner.
export const USD_TIL_NOK = 11.0;

export type BrukRad = {
  modell: string;
  inputTokens: number;
  outputTokens: number;
};

/** Kostnad i kroner (NOK) for én rad med token-bruk. */
export function kostnadNok(rad: BrukRad): number {
  const pris = MODELL_PRISER[rad.modell];
  if (!pris) return 0;
  const usd =
    (rad.inputTokens / 1_000_000) * pris.input +
    (rad.outputTokens / 1_000_000) * pris.output;
  return usd * USD_TIL_NOK;
}

/** Logg ett API-kall. Feiler aldri hardt — kostnadslogging skal ikke
 * velte selve fangst-flyten. */
export async function loggApiBruk(rad: {
  tjeneste: string;
  modell: string;
  endepunkt: string;
  inputTokens: number;
  outputTokens: number;
}): Promise<void> {
  try {
    await db.insert(apiUsage).values(rad);
  } catch (err) {
    console.error("Klarte ikke logge API-bruk:", err);
  }
}
