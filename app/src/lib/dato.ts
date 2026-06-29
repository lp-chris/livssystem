// Lokal dato i Europe/Oslo som "YYYY-MM-DD".
// Hjemskjermen bruker toISOString() (UTC), som hopper feil rundt midnatt.
// Journalen (og senere review-perioder) trenger ekte lokal dato.
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
