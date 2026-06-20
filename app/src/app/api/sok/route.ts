import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, libraryItems } from "@/db/schema";
import { ilike, or, eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ oppgaver: [], bibliotek: [] });
  }

  const mønster = `%${q}%`;

  const oppgaver = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.status, "åpen"),
        or(ilike(tasks.tittel, mønster), ilike(tasks.notat, mønster))
      )
    )
    .limit(20);

  const bibliotek = await db
    .select()
    .from(libraryItems)
    .where(
      or(
        ilike(libraryItems.tittel, mønster),
        ilike(libraryItems.innhold, mønster),
        ilike(libraryItems.kilde, mønster),
        ilike(libraryItems.forfatter, mønster)
      )
    )
    .limit(20);

  return NextResponse.json({ oppgaver, bibliotek });
}
