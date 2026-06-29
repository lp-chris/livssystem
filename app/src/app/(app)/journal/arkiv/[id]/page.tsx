export const dynamic = "force-dynamic";

import { db } from "@/db";
import { libraryItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import JournalpostDetalj from "@/components/JournalpostDetalj";

export default async function JournalpostDetaljSide({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = parseInt(id);

  const [post] = await db
    .select()
    .from(libraryItems)
    .where(and(eq(libraryItems.id, itemId), eq(libraryItems.type, "journal")));

  if (!post) notFound();

  return <JournalpostDetalj post={post} />;
}
