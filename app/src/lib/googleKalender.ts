import { google } from "googleapis";

export type KalenderHendelse = {
  id: string;
  tittel: string;
  start: string;
  slutt: string;
  helDag: boolean;
  sted?: string;
};

function lagOAuthKlient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

export async function hentDagensHendelser(): Promise<KalenderHendelse[]> {
  const oauth2 = lagOAuthKlient();
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const kalender = google.calendar({ version: "v3", auth: oauth2 });

  const nå = new Date();
  const startAvDag = new Date(nå);
  startAvDag.setHours(0, 0, 0, 0);
  const sluttAvDag = new Date(nå);
  sluttAvDag.setHours(23, 59, 59, 999);

  const svar = await kalender.events.list({
    calendarId: "primary",
    timeMin: startAvDag.toISOString(),
    timeMax: sluttAvDag.toISOString(),
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
