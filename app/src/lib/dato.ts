// Lokal dato i Europe/Oslo som "YYYY-MM-DD".
// Serveren (Railway) kjører i UTC — toISOString() gir feil dato
// mellom midnatt og kl. 01/02 norsk tid. Bruk alltid disse hjelperne.
export function iDagOslo(): string {
  return datoOslo(new Date());
}

export function datoOslo(d: Date): string {
  // en-CA gir ISO-format (YYYY-MM-DD), tidssone-justert til Oslo.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// Gjeldende UTC-offset for Oslo, f.eks. "+02:00" (sommertid) eller "+01:00".
// Brukes til RFC3339-tidsstempler (Google Calendar).
export function osloOffset(d: Date = new Date()): string {
  const deler = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Oslo",
    timeZoneName: "longOffset",
  }).formatToParts(d);
  const navn = deler.find((p) => p.type === "timeZoneName")?.value ?? "GMT+01:00";
  const offset = navn.replace("GMT", "");
  return offset || "+00:00";
}

// Hele dager siden en YYYY-MM-DD-dato (0 = i dag, negativ = frem i tid).
export function dagerSiden(dato: string): number {
  const ms = Date.parse(iDagOslo()) - Date.parse(dato);
  return Math.round(ms / 86400000);
}

// Slipp-score: "forfalt i går" / "forfalt i N dager" for en forfalt frist.
export function forfaltEtikett(forfall: string): string {
  const n = dagerSiden(forfall);
  if (n <= 0) return forfall;
  return n === 1 ? "forfalt i går" : `forfalt i ${n} dager`;
}

// Klokketime (0–23) i Oslo akkurat nå. Serveren kjører i UTC,
// så new Date().getHours() gir feil time på Railway.
export function timeOslo(): number {
  return Number(
    new Intl.DateTimeFormat("en", {
      timeZone: "Europe/Oslo",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date())
  );
}
