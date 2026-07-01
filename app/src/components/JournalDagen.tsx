"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type Props = {
  dato: string; // YYYY-MM-DD (Oslo)
  entryId: number | null;
  sted: string;
  svar: Record<string, string>;
  bildeUrl: string | null;
};

function formaterDato(dato: string): string {
  const d = new Date(dato + "T12:00:00");
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// Krymp bilde i nettleseren før lagring som data-URL (samme mønster som bokomslag).
async function komprimerBilde(fil: File, maksBredde = 900): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(fil);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const skala = Math.min(1, maksBredde / img.width);
  const w = Math.round(img.width * skala);
  const h = Math.round(img.height * skala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export default function JournalDagen({
  dato,
  entryId: initEntryId,
  sted: initSted,
  svar,
  bildeUrl: initBilde,
}: Props) {
  const [entryId, setEntryId] = useState<number | null>(initEntryId);
  const entryIdRef = useRef<number | null>(initEntryId);

  const startLinjer = (svar["morning.gratitude"] ?? "").split("\n");
  const [linjer, setLinjer] = useState<string[]>([
    startLinjer[0] ?? "",
    startLinjer[1] ?? "",
    startLinjer[2] ?? "",
  ]);

  const [bilde, setBilde] = useState<string | null>(initBilde);
  const [lasterBilde, setLasterBilde] = useState(false);
  const filInput = useRef<HTMLInputElement>(null);

  const harKveld = (svar["evening.went_well"] ?? "").trim().length > 0;
  const [visKveld, setVisKveld] = useState(harKveld);

  // Sørg for at dagens entry finnes; opprett først ved første lagring.
  async function sikreEntry(): Promise<number | null> {
    if (entryIdRef.current) return entryIdRef.current;
    const res = await fetch("/api/journal", { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    const id = data.entry?.id ?? null;
    entryIdRef.current = id;
    setEntryId(id);
    return id;
  }

  async function lagreSvar(questionKey: string, verdi: string) {
    const id = await sikreEntry();
    if (!id) return;
    await fetch(`/api/journal/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionKey, svar: verdi }),
    });
  }

  async function lagreSted(verdi: string) {
    const id = await sikreEntry();
    if (!id) return;
    await fetch(`/api/journal/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sted: verdi }),
    });
  }

  function lagreGratitude(nyeLinjer: string[]) {
    const samlet = nyeLinjer.map((l) => l.trim()).filter(Boolean).join("\n");
    lagreSvar("morning.gratitude", samlet);
  }

  async function velgBilde(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setLasterBilde(true);
    try {
      const url = await komprimerBilde(fil);
      const id = await sikreEntry();
      if (!id) return;
      const res = await fetch(`/api/journal/${id}/bilde`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) setBilde(url);
    } finally {
      setLasterBilde(false);
      if (filInput.current) filInput.current.value = "";
    }
  }

  async function fjernBilde() {
    if (!entryIdRef.current) {
      setBilde(null);
      return;
    }
    await fetch(`/api/journal/${entryIdRef.current}/bilde`, {
      method: "DELETE",
    });
    setBilde(null);
  }

  const maaned = dato.slice(0, 7);

  const feltStil = {
    color: "var(--ink)",
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
  } as const;

  return (
    <main className="pb-40 px-4 pt-12 max-w-md mx-auto md:max-w-2xl md:px-10 md:pt-10">
      <header className="mb-7 flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-semibold capitalize"
            style={{ color: "var(--ink)" }}
          >
            {formaterDato(dato)}
          </h1>
          <div className="flex gap-3 mt-1.5">
            <Link
              href="/journal/alle"
              className="text-sm"
              style={{ color: "var(--muted)" }}
            >
              Alle
            </Link>
            <Link
              href={`/journal/maned/${maaned}`}
              className="text-sm"
              style={{ color: "var(--muted)" }}
            >
              Måned
            </Link>
            <Link
              href="/journal/arkiv"
              className="text-sm"
              style={{ color: "var(--muted)" }}
            >
              Arkiv
            </Link>
          </div>
        </div>
      </header>

      {/* Takknemlighet */}
      <section className="mb-7">
        <h2
          className="text-[11px] font-semibold uppercase mb-2.5"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Jeg er takknemlig for…
        </h2>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              defaultValue={linjer[i]}
              onBlur={(e) => {
                const nye = [...linjer];
                nye[i] = e.target.value;
                setLinjer(nye);
                lagreGratitude(nye);
              }}
              placeholder={`${i + 1}.`}
              className="w-full rounded-[14px] px-4 py-3 text-[15px] focus:outline-none"
              style={feltStil}
            />
          ))}
        </div>
      </section>

      {/* Hva ville gjort dagen god */}
      <section className="mb-7">
        <h2
          className="text-[11px] font-semibold uppercase mb-2.5"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Hva ville gjort dagen god?
        </h2>
        <textarea
          defaultValue={svar["morning.great_day"] ?? ""}
          onBlur={(e) => lagreSvar("morning.great_day", e.target.value)}
          placeholder="Skriv her…"
          rows={3}
          className="w-full rounded-[14px] px-4 py-3 text-[15px] leading-relaxed resize-none focus:outline-none"
          style={feltStil}
        />
      </section>

      {/* Affirmasjon */}
      <section className="mb-7">
        <h2
          className="text-[11px] font-semibold uppercase mb-2.5"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Dagens affirmasjon
        </h2>
        <textarea
          defaultValue={svar["morning.affirmation"] ?? ""}
          onBlur={(e) => lagreSvar("morning.affirmation", e.target.value)}
          placeholder="Jeg er…"
          rows={2}
          className="w-full rounded-[14px] px-4 py-3 text-[15px] leading-relaxed resize-none focus:outline-none"
          style={feltStil}
        />
      </section>

      {/* Dagens bilde */}
      <section className="mb-7">
        <h2
          className="text-[11px] font-semibold uppercase mb-2.5"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          Dagens bilde
        </h2>
        {bilde ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bilde}
              alt="Dagens bilde"
              className="w-full rounded-[18px] object-cover"
              style={{ maxHeight: 360 }}
            />
            <button
              onClick={fjernBilde}
              className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{
                backgroundColor: "rgba(0,0,0,0.55)",
                color: "white",
              }}
              aria-label="Fjern bilde"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => filInput.current?.click()}
            disabled={lasterBilde}
            className="w-full rounded-[18px] py-8 text-sm flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--card)",
              border: "1px dashed var(--border)",
              color: "var(--muted)",
            }}
          >
            {lasterBilde ? "Laster…" : "＋ Legg til bilde"}
          </button>
        )}
        <input
          ref={filInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={velgBilde}
        />
      </section>

      {/* Sted (valgfritt) */}
      <section className="mb-7">
        <input
          type="text"
          defaultValue={initSted}
          onBlur={(e) => lagreSted(e.target.value)}
          placeholder="Sted (valgfritt)…"
          className="w-full rounded-[14px] px-4 py-3 text-[15px] focus:outline-none"
          style={feltStil}
        />
      </section>

      {/* Kveld — frivillig. En kveld-løs dag skal se komplett ut. */}
      <section
        className="mt-10 pt-7"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {visKveld ? (
          <>
            <h2
              className="text-[11px] font-semibold uppercase mb-2.5"
              style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
            >
              Hva gikk bra i dag?
            </h2>
            <textarea
              autoFocus={!harKveld}
              defaultValue={svar["evening.went_well"] ?? ""}
              onBlur={(e) => lagreSvar("evening.went_well", e.target.value)}
              placeholder="Tre ting som gikk bra…"
              rows={4}
              className="w-full rounded-[14px] px-4 py-3 text-[15px] leading-relaxed resize-none focus:outline-none"
              style={feltStil}
            />
          </>
        ) : (
          <button
            onClick={() => setVisKveld(true)}
            className="text-sm min-h-[44px]"
            style={{ color: "var(--muted)" }}
          >
            ＋ Legg til kveldsnotat
          </button>
        )}
      </section>
    </main>
  );
}
