import { NextResponse } from "next/server";
import { db } from "@/db";
import { captures } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const siste = await db
    .select()
    .from(captures)
    .orderBy(desc(captures.opprettet))
    .limit(5);

  return NextResponse.json({ fangster: siste });
}
