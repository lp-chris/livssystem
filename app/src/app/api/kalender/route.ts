import { NextResponse } from "next/server";
import { hentDagensHendelser } from "@/lib/googleKalender";

export async function GET() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_CALENDAR_ID) {
    return NextResponse.json({ hendelser: [], ikkeKonfigurert: true });
  }

  try {
    const hendelser = await hentDagensHendelser();
    return NextResponse.json({ hendelser });
  } catch (err) {
    console.error("Kalender-feil:", err);
    return NextResponse.json({ hendelser: [], feil: true });
  }
}
