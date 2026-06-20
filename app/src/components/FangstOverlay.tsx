"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Fase = "lukket" | "venter" | "lytter" | "behandler" | "kvittering";
type Modus = "mikrofon" | "tekst";

type Kvittering = {
  rutetTil: { type: string } | null;
  capture: { råTekst: string };
};

const RUTETYPE_ETIKETT: Record<string, string> = {
  oppgave: "Oppgave",
  rutine: "Rutine",
  notat: "Notat",
  sitat: "Sitat",
  bok: "Bok",
};

export default function FangstOverlay() {
  const [fase, setFase] = useState<Fase>("lukket");
  const [modus, setModus] = useState<Modus>("mikrofon");
  const [tekstInput, setTekstInput] = useState("");
  const [kvittering, setKvittering] = useState<Kvittering | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const transkriptRef = useRef("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  const åpne = useCallback(() => {
    setFase("venter");
    setFeil(null);
    setTekstInput("");
    transkriptRef.current = "";
  }, []);

  const lukk = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setFase("lukket");
    setModus("mikrofon");
    setFeil(null);
  }, []);

  useEffect(() => {
    if (fase === "kvittering") {
      const timer = setTimeout(() => lukk(), 2500);
      return () => clearTimeout(timer);
    }
  }, [fase, lukk]);

  // ESC for å lukke
  useEffect(() => {
    if (fase === "lukket") return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") lukk();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fase, lukk]);

  async function sendCapture(tekst: string) {
    if (!tekst.trim()) return;
    setFeil(null);
    setFase("behandler");
    try {
      const svar = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tekst: tekst.trim() }),
      });
      if (!svar.ok) throw new Error("Serverfeil");
      const data = await svar.json();
      setKvittering(data);
      setFase("kvittering");
      router.refresh();
    } catch {
      setFeil("Noe gikk galt. Prøv igjen.");
      setFase("venter");
    }
  }

  function startLytting() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SR) {
      setModus("tekst");
      return;
    }

    transkriptRef.current = "";
    const recognition = new SR();
    recognition.lang = "nb-NO";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      transkriptRef.current = event.results[0][0].transcript;
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (transkriptRef.current) {
        sendCapture(transkriptRef.current);
      } else {
        setFase("venter");
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      recognitionRef.current = null;
      if (event.error === "not-allowed") {
        setFeil("Mikrofonttilgang avvist. Bytt til tekstmodus.");
      } else if (event.error !== "no-speech") {
        setFeil("Lydopptak feilet. Prøv tekstmodus.");
      }
      setFase("venter");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setFase("lytter");
    } catch {
      setFase("venter");
    }
  }

  function stoppLytting() {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setFase("venter");
  }

  function sendTekst(e: React.FormEvent) {
    e.preventDefault();
    if (tekstInput.trim()) sendCapture(tekstInput);
  }

  if (fase === "lukket") {
    return (
      <button
        onClick={åpne}
        aria-label="Fang inn noe nytt"
        className="fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
        style={{
          width: 66,
          height: 66,
          bottom: 63,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "var(--ink)",
          color: "white",
          fontSize: 28,
        }}
      >
        ⊕
      </button>
    );
  }

  return (
    <>
      {/* Flytende mic-knapp er skjult når overlay er åpen */}
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ backgroundColor: "#211F1A" }}
      >
        {/* Topplinje */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <span
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}
          >
            {fase === "lytter"
              ? "LYTTER"
              : fase === "behandler"
              ? "ANALYSERER"
              : fase === "kvittering"
              ? "LAGT TIL"
              : modus === "mikrofon"
              ? "FANGST"
              : "SKRIV"}
          </span>
          <button
            onClick={lukk}
            className="flex items-center justify-center rounded-full min-w-[44px] min-h-[44px]"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: 22 }}
          >
            ✕
          </button>
        </div>

        {/* Innhold */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Kvittering */}
          {fase === "kvittering" && kvittering && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: "rgba(137, 154, 120, 0.2)",
                  color: "#899A78",
                  fontSize: 36,
                }}
              >
                ✓
              </div>
              <div>
                <p className="text-white text-lg font-medium mb-1">
                  {kvittering.rutetTil
                    ? RUTETYPE_ETIKETT[kvittering.rutetTil.type] ?? "Element"
                    : "Element"}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {kvittering.capture.råTekst.slice(0, 80)}
                  {kvittering.capture.råTekst.length > 80 ? "…" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Behandler */}
          {fase === "behandler" && (
            <div className="flex flex-col items-center gap-4">
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 28,
                }}
              >
                ⟳
              </div>
              <p
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Analyserer…
              </p>
            </div>
          )}

          {/* Mikrofon-modus */}
          {(fase === "venter" || fase === "lytter") &&
            modus === "mikrofon" && (
              <div className="flex flex-col items-center gap-8 w-full">
                {/* Mic-sirkel med puls */}
                <div className="relative flex items-center justify-center">
                  {fase === "lytter" && (
                    <>
                      <div
                        className="puls-ring absolute rounded-full"
                        style={{
                          width: 100,
                          height: 100,
                          backgroundColor: "rgba(255,255,255,0.12)",
                        }}
                      />
                      <div
                        className="puls-ring2 absolute rounded-full"
                        style={{
                          width: 100,
                          height: 100,
                          backgroundColor: "rgba(255,255,255,0.07)",
                        }}
                      />
                    </>
                  )}
                  <button
                    onClick={fase === "lytter" ? stoppLytting : startLytting}
                    className="relative flex items-center justify-center rounded-full transition-transform active:scale-95"
                    style={{
                      width: 100,
                      height: 100,
                      backgroundColor:
                        fase === "lytter"
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(255,255,255,0.1)",
                      color: "white",
                      fontSize: 40,
                    }}
                  >
                    🎙
                  </button>
                </div>

                <p
                  className="text-sm text-center"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {fase === "lytter"
                    ? "Trykk for å stoppe"
                    : "Trykk for å ta opp"}
                </p>

                {feil && (
                  <p
                    className="text-sm text-center"
                    style={{ color: "#C28568" }}
                  >
                    {feil}
                  </p>
                )}
              </div>
            )}

          {/* Tekst-modus */}
          {(fase === "venter" || fase === "lytter") && modus === "tekst" && (
            <form
              onSubmit={sendTekst}
              className="flex flex-col gap-4 w-full max-w-sm"
            >
              <textarea
                autoFocus
                value={tekstInput}
                onChange={(e) => setTekstInput(e.target.value)}
                placeholder="Hva vil du fange inn?"
                rows={4}
                className="w-full rounded-2xl px-4 py-3 text-base resize-none focus:outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey) sendTekst(e as unknown as React.FormEvent);
                }}
              />
              {feil && (
                <p className="text-sm text-center" style={{ color: "#C28568" }}>
                  {feil}
                </p>
              )}
              <button
                type="submit"
                disabled={!tekstInput.trim()}
                className="w-full py-4 rounded-2xl text-base font-medium transition-opacity disabled:opacity-30"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  color: "white",
                }}
              >
                Send
              </button>
            </form>
          )}
        </div>

        {/* Bunnlinje — bytt modus */}
        {(fase === "venter" || fase === "lytter") && (
          <div className="flex justify-center pb-16 pt-4">
            <button
              onClick={() =>
                setModus((m) => (m === "mikrofon" ? "tekst" : "mikrofon"))
              }
              className="flex items-center gap-2 px-4 py-2 rounded-full min-h-[44px]"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
              }}
            >
              {modus === "mikrofon" ? (
                <>⌨ Bytt til tekst</>
              ) : (
                <>🎙 Bytt til mikrofon</>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
