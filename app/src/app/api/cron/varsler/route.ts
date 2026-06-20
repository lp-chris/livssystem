import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { and, eq, isNotNull, isNull, lte } from "drizzle-orm";
import { sendPushover } from "@/lib/pushover";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ feil: "Ikke autorisert" }, { status: 401 });
  }

  const nå = new Date();

  const forfalt = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.status, "åpen"),
        isNotNull(tasks.påminnelseAt),
        isNull(tasks.varsletAt),
        lte(tasks.påminnelseAt, nå)
      )
    );

  for (const oppgave of forfalt) {
    await sendPushover(oppgave.tittel, "Påminnelse");
    await db
      .update(tasks)
      .set({ varsletAt: nå })
      .where(eq(tasks.id, oppgave.id));
  }

  return NextResponse.json({ sendt: forfalt.length });
}
