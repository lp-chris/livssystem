"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Post = {
  id: number;
  tittel: string | null;
  innhold: string | null;
  opprettet: Date;
  favoritt: boolean;
};

function formaterDato(d: Date): string {
  return new Date(d).toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function JournalpostDetalj({ post: init }: { post: Post }) {
  const [post, setPost] = useState(init);
  const [visSlettBekreft, setVisSlettBekreft] = useState(false);
  const router = useRouter();

  async function lagre(felt: "tittel" | "innhold", verdi: string | null) {
    await fetch(`/api/bibliotek/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [felt]: verdi }),
    });
  }

  async function toggleFavoritt() {
    const ny = !post.favoritt;
    setPost((p) => ({ ...p, favoritt: ny }));
    await fetch(`/api/bibliotek/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favoritt: ny }),
    });
  }

  async function slett() {
    await fetch(`/api/bibliotek/${post.id}`, { method: "DELETE" });
    router.push("/journal/arkiv");
    router.refresh();
  }

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/journal/arkiv"
          className="min-w-[44px] min-h-[44px] flex items-center"
          style={{ color: "var(--muted)", fontSize: 18 }}
        >
          ←
        </Link>
        <button
          onClick={toggleFavoritt}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xl"
          aria-label={post.favoritt ? "Fjern favoritt" : "Marker som favoritt"}
        >
          <span style={{ color: post.favoritt ? "var(--hest)" : "var(--border)" }}>★</span>
        </button>
      </header>

      <p className="text-[11px] font-medium uppercase mb-4" style={{ letterSpacing: "0.08em", color: "var(--muted)" }}>
        {formaterDato(post.opprettet)}
      </p>

      <input
        type="text"
        defaultValue={post.tittel ?? ""}
        onBlur={(e) => {
          const v = e.target.value.trim() || null;
          setPost((p) => ({ ...p, tittel: v }));
          lagre("tittel", v);
        }}
        placeholder="Tittel (valgfritt)…"
        className="w-full bg-transparent font-semibold mb-4 focus:outline-none"
        style={{
          fontSize: 22,
          color: "var(--ink)",
          borderBottom: "2px solid var(--border)",
          paddingBottom: 8,
        }}
      />

      <textarea
        defaultValue={post.innhold ?? ""}
        onBlur={(e) => {
          const v = e.target.value.trim() || null;
          setPost((p) => ({ ...p, innhold: v }));
          lagre("innhold", v);
        }}
        placeholder="Skriv her…"
        rows={14}
        className="w-full bg-transparent text-sm leading-relaxed resize-none focus:outline-none"
        style={{
          color: "var(--ink)",
        }}
      />

      <div className="mt-12 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        {!visSlettBekreft ? (
          <button
            onClick={() => setVisSlettBekreft(true)}
            className="text-sm min-h-[44px] px-2"
            style={{ color: "var(--muted)" }}
          >
            Slett post
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setVisSlettBekreft(false)}
              className="flex-1 py-3 rounded-[14px] text-sm"
              style={{
                backgroundColor: "var(--card)",
                color: "var(--ink)",
                border: "1px solid var(--border)",
              }}
            >
              Avbryt
            </button>
            <button
              onClick={slett}
              className="flex-1 py-3 rounded-[14px] text-sm font-medium"
              style={{ backgroundColor: "#e53e3e", color: "white" }}
            >
              Ja, slett
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
