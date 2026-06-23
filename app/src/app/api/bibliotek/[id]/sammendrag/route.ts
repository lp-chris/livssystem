import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import { libraryItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loggApiBruk } from "@/lib/apiBruk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SAMMENDRAG_PROMPT = `Du lager korte, nyttige bok-sammendrag på norsk bokmål.

Du får tittel og (hvis kjent) forfatter på en bok. Lag:
1. En kort oppsummering (3-5 setninger) av hva boken handler om og hovedbudskapet.
2. 3-6 konkrete "key take-outs" – de viktigste lærdommene eller poengene man tar med seg. Hvert punkt skal være én kortfattet setning.

Hvis du ikke kjenner boken sikkert, si det ærlig i oppsummeringen i stedet for å dikte. Ikke finn på innhold.

Svar KUN med gyldig JSON (ingen markdown, ingen forklaring):
{
  "oppsummering": "...",
  "takeaways": ["...", "...", "..."]
}`;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = parseInt(id);
  if (isNaN(itemId)) return NextResponse.json({ feil: "Ugyldig id" }, { status: 400 });

  const [item] = await db.select().from(libraryItems).where(eq(libraryItems.id, itemId));
  if (!item) return NextResponse.json({ feil: "Ikke funnet" }, { status: 404 });
  if (item.type !== "bok") return NextResponse.json({ feil: "Ikke en bok" }, { status: 400 });

  const bokInfo = item.forfatter
    ? `Tittel: ${item.tittel}\nForfatter: ${item.forfatter}`
    : `Tittel: ${item.tittel}`;

  let jsonTekst = "";
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SAMMENDRAG_PROMPT,
      messages: [{ role: "user", content: bokInfo }],
    });

    for (const block of response.content) {
      if (block.type === "text") {
        jsonTekst = block.text.trim();
        break;
      }
    }

    await loggApiBruk({
      tjeneste: "anthropic",
      modell: "claude-haiku-4-5",
      endepunkt: "bok-sammendrag",
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });
  } catch {
    return NextResponse.json({ feil: "AI-kall feilet" }, { status: 502 });
  }

  if (jsonTekst.startsWith("```")) {
    jsonTekst = jsonTekst.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  let tolket: { oppsummering?: string; takeaways?: string[] };
  try {
    tolket = JSON.parse(jsonTekst);
  } catch {
    return NextResponse.json({ feil: "Kunne ikke tolke AI-svar" }, { status: 502 });
  }

  const aiSammendrag = tolket.oppsummering?.trim() || null;
  const aiTakeaways = Array.isArray(tolket.takeaways)
    ? tolket.takeaways.map((t) => String(t).trim()).filter(Boolean)
    : [];

  const [oppdatert] = await db
    .update(libraryItems)
    .set({ aiSammendrag, aiTakeaways })
    .where(eq(libraryItems.id, itemId))
    .returning();

  return NextResponse.json({ item: oppdatert });
}
