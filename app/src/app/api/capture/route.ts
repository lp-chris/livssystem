import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import { captures, tasks, routines, libraryItems, domains } from "@/db/schema";
import { eq } from "drizzle-orm";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RUTING_PROMPT = `Du er en intelligent ruter for et personlig livssystem. Brukeren sender deg en uformell tekst (som regel en talebeskjed transkribert til tekst, muligens med fyllord).

Din jobb:
1. Rens fyllord og transkripsjonsartefakter
2. Klassifiser innholdet som én av: oppgave, rutine, notat, sitat, bok, journal
3. Trekk ut all relevant metadata

Domener:
- "Meg" – personlig: helse, trening, rutiner, lesing, personlig utvikling
- "Oss" – familie og hjem
- "Stall" – ridestall og rideskole
- "Hest" – egne hester: trening, konkurranse, stell

Regler:
- Prioritet: standard er "normal" med mindre brukeren sier "viktig", "haster" → "høy", eller "ikke viktig" → "lav"
- Påminnelse: legg alltid til påminnelseAt HVIS brukeren nevner et klokkeslett eller "husk" – ellers null
- Forfall: sett til ISO-dato hvis nevnt, ellers null
- Domene: gjett fra kontekst – Hest hvis noe med hest/ridning, Stall hvis stall/rideskole/elever, Oss hvis familie/hjem, ellers Meg
- Journal: bruk type "journal" hvis brukeren beskriver noe som skjedde, en opplevelse, en dag, en refleksjon, eller sier ord som "journal", "dagbok", "i dag skjedde", "tenker på"

Svar KUN med gyldig JSON på dette formatet (ingen markdown, ingen forklaring):
{
  "type": "oppgave" | "rutine" | "notat" | "sitat" | "bok" | "journal",
  "tittel": "Renset, kortfattet tittel/innhold",
  "notat": "Ytterligere detaljer hvis relevant, ellers null",
  "domene": "Meg" | "Oss" | "Stall" | "Hest",
  "prioritet": "høy" | "normal" | "lav",
  "forfall": "YYYY-MM-DD" | null,
  "påminnelseAt": "YYYY-MM-DDTHH:MM:SS" | null,
  "forfatter": "For bøker: forfatternavn, ellers null",
  "kilde": "For sitater: hvem som sa det, ellers null",
  "tidspunkt": "morgen" | "ettermiddag" | "kveld" | "når_som_helst" (kun for rutiner),
  "topp3": false
}`;

async function rutMedAI(tekst: string) {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    system: RUTING_PROMPT,
    messages: [{ role: "user", content: tekst }],
  });

  let jsonTekst = "";
  for (const block of response.content) {
    if (block.type === "text") {
      jsonTekst = block.text.trim();
      break;
    }
  }

  // Strip markdown code blocks if model wraps response despite instructions
  if (jsonTekst.startsWith("```")) {
    jsonTekst = jsonTekst.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  return JSON.parse(jsonTekst);
}

async function lagreRutet(tolket: Record<string, unknown>) {
  const alleDomener = await db.select().from(domains);
  const domene = alleDomener.find((d) => d.navn === tolket.domene);
  const domainId = domene?.id ?? null;

  switch (tolket.type) {
    case "oppgave": {
      const [rad] = await db
        .insert(tasks)
        .values({
          domainId,
          tittel: String(tolket.tittel),
          notat: tolket.notat ? String(tolket.notat) : null,
          prioritet: (tolket.prioritet as "høy" | "normal" | "lav") ?? "normal",
          forfall: tolket.forfall ? String(tolket.forfall) : null,
          påminnelseAt: tolket.påminnelseAt
            ? new Date(String(tolket.påminnelseAt))
            : null,
          topp3: Boolean(tolket.topp3),
          status: "åpen",
        })
        .returning();
      return { type: "oppgave", id: rad.id };
    }

    case "rutine": {
      const [rad] = await db
        .insert(routines)
        .values({
          domainId,
          navn: String(tolket.tittel),
          beskrivelse: tolket.notat ? String(tolket.notat) : null,
          tidspunkt:
            (tolket.tidspunkt as
              | "morgen"
              | "ettermiddag"
              | "kveld"
              | "når_som_helst") ?? "når_som_helst",
          type: "daglig",
          startDate: new Date().toISOString().split("T")[0],
          sendVarsel: false,
        })
        .returning();
      return { type: "rutine", id: rad.id };
    }

    case "notat": {
      const [rad] = await db
        .insert(libraryItems)
        .values({
          type: "notat",
          tittel: String(tolket.tittel),
          innhold: tolket.notat ? String(tolket.notat) : null,
        })
        .returning();
      return { type: "notat", id: rad.id };
    }

    case "sitat": {
      const [rad] = await db
        .insert(libraryItems)
        .values({
          type: "sitat",
          innhold: String(tolket.tittel),
          kilde: tolket.kilde ? String(tolket.kilde) : null,
        })
        .returning();
      return { type: "sitat", id: rad.id };
    }

    case "bok": {
      const [rad] = await db
        .insert(libraryItems)
        .values({
          type: "bok",
          tittel: String(tolket.tittel),
          forfatter: tolket.forfatter ? String(tolket.forfatter) : null,
          leseStatus: "vil_lese",
        })
        .returning();
      return { type: "bok", id: rad.id };
    }

    case "journal": {
      const [rad] = await db
        .insert(libraryItems)
        .values({
          type: "journal",
          tittel: tolket.tittel ? String(tolket.tittel) : null,
          innhold: tolket.notat
            ? `${String(tolket.tittel)}\n\n${String(tolket.notat)}`
            : String(tolket.tittel),
        })
        .returning();
      return { type: "journal", id: rad.id };
    }

    default:
      throw new Error(`Ukjent type: ${tolket.type}`);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.tekst !== "string" || !body.tekst.trim()) {
    return NextResponse.json({ feil: "Mangler tekst" }, { status: 400 });
  }

  const råTekst = body.tekst.trim();

  const [capture] = await db
    .insert(captures)
    .values({ råTekst, status: "venter" })
    .returning();

  try {
    const tolket = await rutMedAI(råTekst);
    const rutetTil = await lagreRutet(tolket);

    await db
      .update(captures)
      .set({ tolketJson: tolket, rutetTil, status: "behandlet" })
      .where(eq(captures.id, capture.id));

    return NextResponse.json({
      ok: true,
      capture: { id: capture.id, ...tolket },
      rutetTil,
    });
  } catch (err) {
    await db
      .update(captures)
      .set({ status: "feil" })
      .where(eq(captures.id, capture.id));

    console.error("Capture-feil:", err);
    return NextResponse.json(
      { feil: "Klarte ikke rute innholdet" },
      { status: 500 }
    );
  }
}
