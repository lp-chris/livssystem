import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { routineLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { iDagOslo } from "@/lib/dato";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const routineId = parseInt(id);
  if (isNaN(routineId)) {
    return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });
  }

  const iDagStr = iDagOslo();

  const eksisterende = await db
    .select()
    .from(routineLogs)
    .where(
      and(eq(routineLogs.routineId, routineId), eq(routineLogs.dato, iDagStr))
    );

  if (eksisterende.length > 0) {
    // Toggle: snu fullført-status
    const nyStatus = !eksisterende[0].fullført;
    await db
      .update(routineLogs)
      .set({ fullført: nyStatus })
      .where(eq(routineLogs.id, eksisterende[0].id));
    return NextResponse.json({ fullført: nyStatus });
  } else {
    await db.insert(routineLogs).values({
      routineId,
      dato: iDagStr,
      fullført: true,
    });
    return NextResponse.json({ fullført: true });
  }
}
