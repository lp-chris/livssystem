// Offline-kø for fangst: mislykkede POST /api/capture lagres i localStorage
// og sendes automatisk når nettet er tilbake. Kun klient-side.

const NOKKEL = "fangst-ko";

export type KoElement = {
  id: string;
  tekst: string;
  opprettet: string;
};

export function hentKo(): KoElement[] {
  if (typeof window === "undefined") return [];
  try {
    const rå = localStorage.getItem(NOKKEL);
    const liste = rå ? JSON.parse(rå) : [];
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

function lagreKo(ko: KoElement[]) {
  try {
    localStorage.setItem(NOKKEL, JSON.stringify(ko));
  } catch {
    // full/utilgjengelig localStorage — da mister vi køen, men appen skal ikke krasje
  }
}

export function leggIKo(tekst: string): number {
  const ko = hentKo();
  ko.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tekst,
    opprettet: new Date().toISOString(),
  });
  lagreKo(ko);
  return ko.length;
}

let sender = false;

// Prøver å sende hele køen, eldst først. Stopper ved første feil
// (fortsatt uten nett) og beholder resten. Returnerer antall sendt.
export async function provSendKo(): Promise<number> {
  if (sender) return 0;
  sender = true;
  let sendt = 0;
  try {
    let ko = hentKo();
    while (ko.length > 0) {
      const første = ko[0];
      try {
        const svar = await fetch("/api/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tekst: første.tekst }),
        });
        if (!svar.ok) break;
      } catch {
        break;
      }
      ko = hentKo().filter((e) => e.id !== første.id);
      lagreKo(ko);
      sendt++;
    }
  } finally {
    sender = false;
  }
  return sendt;
}
