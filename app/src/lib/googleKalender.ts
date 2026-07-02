import { google } from "googleapis";
import { iDagOslo, osloOffset } from "@/lib/dato";

export type KalenderHendelse = {
  id: string;
  tittel: string;
  start: string;
  slutt: string;
  helDag: boolean;
  sted?: string;
};

// Leser kalenderen via en service account (utløper aldri).
// Forutsetter at kalenderen er delt med service account-ens e-post
// med tilgang "Se alle detaljer i hendelser".
function lagAuth() {
  const rå = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rå) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY mangler");
  }
  // Lagres base64-kodet for å unngå problemer med fnutter/linjeskift
  // i env-variabler. Faller tilbake til rå JSON for bakoverkompatibilitet.
  const json = rå.trim().startsWith("{")
    ? rå
    : Buffer.from(rå, "base64").toString("utf8");
  const creds = JSON.parse(json) as {
    client_email: string;
    private_key: string;
  };
  return new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });
}

export async function hentDagensHendelser(): Promise<KalenderHendelse[]> {
  const auth = lagAuth();
  const kalender = google.calendar({ version: "v3", auth });

  // Service account har ingen "primary"-kalender — vi må peke på den
  // delte kalenderen eksplisitt (som regel Google-konto-e-posten).
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID mangler");
  }

  // Dagens vindu i norsk tid — serveren kjører i UTC, så vi må
  // bygge tidsstemplene med eksplisitt Oslo-offset.
  const dag = iDagOslo();
  const offset = osloOffset();

  const svar = await kalender.events.list({
    calendarId,
    timeMin: `${dag}T00:00:00${offset}`,
    timeMax: `${dag}T23:59:59${offset}`,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 10,
  });

  return (svar.data.items ?? []).map((e) => {
    const helDag = !!e.start?.date;
    return {
      id: e.id ?? "",
      tittel: e.summary ?? "(uten tittel)",
      start: e.start?.dateTime ?? e.start?.date ?? "",
      slutt: e.end?.dateTime ?? e.end?.date ?? "",
      helDag,
      sted: e.location ?? undefined,
    };
  });
}
