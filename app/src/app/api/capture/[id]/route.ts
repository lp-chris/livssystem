import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { captures, domains, tasks, routines, libraryItems } from "@/db/schema";
import { eq } from "drizzle-orm";

// Retter domenet på en feilrutet fangst — oppdaterer både det underliggende
// elementet (oppgave/rutine/bibliotek) og fangst-raden så visningen stemmer.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const captureId = parseInt(id);
  if (isNaN(captureId))
    return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body || body.domene === undefined)
    return NextResponse.json({ feil: "Mangler domene" }, { status: 400 });

  const [fangst] = await db
    .select()
    .from(captures)
    .where(eq(captures.id, captureId));
  if (!fangst) return NextResponse.json({ feil: "Ikke funnet" }, { status: 404 });

  const rutet = fangst.rutetTil as { type: string; id: number } | null;
  if (!rutet?.id)
    return NextResponse.json(
      { feil: "Fangsten er ikke rutet til et element" },
      { status: 400 }
    );

  // Finn domainId fra navn (null = fjern domene)
  let domainId: number | null = null;
  if (body.domene) {
    const [domene] = await db
      .select()
      .from(domains)
      .where(eq(domains.navn, body.domene));
    if (!domene)
      return NextResponse.json({ feil: "Ukjent domene" }, { status: 400 });
    domainId = domene.id;
  }

  // Oppdater riktig tabell basert på hva fangsten ble rutet til
  switch (rutet.type) {
    case "oppgave":
      await db.update(tasks).set({ domainId }).where(eq(tasks.id, rutet.id));
      break;
    case "rutine":
      await db.update(routines).set({ domainId }).where(eq(routines.id, rutet.id));
      break;
    case "notat":
    case "sitat":
    case "bok":
    case "journal":
      await db
        .update(libraryItems)
        .set({ domainId })
        .where(eq(libraryItems.id, rutet.id));
      break;
    default:
      return NextResponse.json(
        { feil: `Kan ikke flytte type ${rutet.type}` },
        { status: 400 }
      );
  }

  // Oppdater fangst-raden så «nylig fanget» viser riktig domene
  const nyTolket = {
    ...(fangst.tolketJson as Record<string, unknown> | null),
    domene: body.domene || null,
  };
  await db
    .update(captures)
    .set({ tolketJson: nyTolket })
    .where(eq(captures.id, captureId));

  return NextResponse.json({ ok: true });
}
