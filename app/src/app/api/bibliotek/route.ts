import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { libraryItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let query = db
    .select()
    .from(libraryItems)
    .orderBy(desc(libraryItems.opprettet))
    .$dynamic();

  if (type && ["notat", "sitat", "bok"].includes(type)) {
    query = query.where(eq(libraryItems.type, type as "notat" | "sitat" | "bok"));
  }

  const items = await query;
  return NextResponse.json({ items });
}
