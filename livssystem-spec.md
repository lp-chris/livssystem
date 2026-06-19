# Livssystem – Kravspesifikasjon (v1)

> Et samlet, friksjonsfritt system for oppgaver, prosjekter, planer, rutiner og et personlig bibliotek. Bygget for én bruker (Lars). Inspirert av Jared Hills "livs-OS", tilpasset Lars' liv og stack.

---

## 1. Designprinsipp (det viktigste i hele dokumentet)

**Friksjon inn dreper systemet. Alt annet er sekundært.**

- Å fange noe skal ta sekunder, fra hvor som helst, uten å åpne Mac.
- AI rydder opp og ruter automatisk – men ingenting lagres usett. Hver fangst gir en synlig kvittering.
- Systemet skal komme seg ut av veien, ikke kreve vedlikehold.

Suksesskriterium: Lars bruker det daglig i 3 uker uten å falle tilbake til gamle vaner. Hvis fangst-flyten ikke er sømløs, er resten irrelevant.

---

## 2. Omfang

### Med i v1
- Samlet håndtering av **oppgaver, prosjekter, områder, milepæler, rutiner** under 4 livsdomener.
- **Friksjonsfri fangst** via (a) iOS Shortcut → API og (b) mobil web-app med mikrofon/tekst.
- **AI-omskriving og auto-ruting** av rå stemmefangst (Anthropic API).
- **Bibliotek** (egen database): notater, sitater, bøker – med gjenoppdukking ("resurfacing").
- **Google Calendar lesing** (read-only, via API) vist på "I dag"-skjerm.
- **Push-varsler** via Pushover.

### Eksplisitt UTE av v1 (legges til senere ved reelt behov)
- Chat-med-databasen (AI Q&A). Bygges når biblioteket er stort nok til å ha verdi.
- Folk/CRM-modul.
- Inventar-modul.
- Innhold/content-pipeline.
- Apple Watch-app (Shortcut funker på watch, men ingen dedikert watch-flyt i v1).

---

## 3. Teknisk stack

| Lag | Valg |
|-----|------|
| Frontend + backend | Next.js (App Router, API-ruter for backend) |
| Database | PostgreSQL |
| ORM | Drizzle |
| Hosting | Railway |
| Kildekontroll | GitHub |
| AI | Anthropic API (omskriving + ruting) + transkripsjon (Whisper eller tilsv.) |
| Varsler | Pushover (API) |
| Kalender | Google Calendar API (read-only) |
| Auth | Brukernavn/passord + sesjon. Én bruker. Hele appen bak innlogging. |
| PWA | Web-app lagres på hjemskjerm (manifest + service worker) |

Bygges med Claude Code. Lokalt først, deploy til Railway når kjernen funker.

---

## 4. Datamodell

### Hierarki
```
Domene (4 faste: Meg, Oss, Stall, Hest)
  └── Prosjekt (har sluttdato)  ELLER  Område (løpende)
        └── Milepæl (valgfri, gir %-fremdrift på prosjekt)
              └── Oppgave
Rutine (egen entitet, knyttet til domene – IKKE et domene)
Bibliotek (notat / sitat / bok – separat fra hierarkiet)
```

### Tabeller (utgangspunkt – Claude Code finpusser)

**domains**
- id, navn (Meg | Oss | Stall | Hest), farge, rekkefølge

**projects**
- id, domain_id, navn, beskrivelse
- type: `prosjekt` (har end_date) | `område` (løpende)
- status, start_date, end_date (null for område), opprettet, sist_rørt_at

**milestones**
- id, project_id, navn, forfall, fullført (bool), rekkefølge
- (prosent fullført regnes ut fra milepæler på prosjektet)

**tasks**
- id, domain_id, project_id (nullable), milestone_id (nullable)
- tittel, notat (markdown), prioritet, forfall, påminnelse_at
- topp3 (bool – for "I dag"-skjerm)
- tilbakevendende: regel (ukentlig/månedlig/ingen), neste_forekomst
- status (åpen | gjort), opprettet, fullført_at

**routines**
- id, domain_id (nullable), navn, beskrivelse
- tidspunkt: morgen | ettermiddag | kveld | når_som_helst, valgfri klokkeslett
- type: `daglig` (ongoing streak) | `tidsbegrenset` (X dager)
- varighet_dager (null for ongoing), start_date
- send_varsel (bool)

**routine_logs**
- id, routine_id, dato, fullført (bool)
- (driver streak-teller og graf)

**library_items**
- id, type: `notat` | `sitat` | `bok`
- tittel/innhold, kilde, tags (array)
- flagget_for_review (bool), review_dato (nullable)
- favoritt (bool – kandidat for daglig resurfacing)
- opprettet
- bok-felt (når type=bok): forfatter, omslag_url, lese_status, format, startet, fullført, rating, isbn, sammendrag
- sitat-felt: kan ha flere "tanker" (egen tabell library_thoughts: id, item_id, tekst, opprettet)

**captures** (rå fangst-logg, for sporbarhet og kvittering)
- id, rå_tekst, tolket_json, rutet_til (type+id), opprettet, status

---

## 5. Fangst-flyt (kjernen)

### Inngang A: iOS Shortcut (fart)
1. Lars trigger Shortcut (hjemskjerm/Tilbake-tapp/Siri).
2. Shortcut tar opp tale → sender lyd (eller iOS-transkribert tekst) til `POST /api/capture`.
3. Svar tilbake til Shortcut: kort bekreftelse ("Lagt til: Bestille høy → Stall, fredag").

### Inngang B: Mobil web-app (fart + redigering)
1. Mikrofon-knapp eller tekstfelt i web-appen.
2. Samme `/api/capture`-endepunkt.
3. Resultat vises umiddelbart i "nylig lagt til"-lista med mulighet for å redigere.

### Server-prosessering (`/api/capture`)
1. Hvis lyd: transkriber (Whisper).
2. Send tekst til Anthropic API med ruting-prompt:
   - Rens bort fyllord/«eee»/tenkning.
   - Klassifiser: oppgave / rutine / notat / sitat / bok.
   - Trekk ut: domene, prosjekt (hvis nevnt), forfallsdato, klokkeslett, prioritet.
   - Standard: legg til påminnelse automatisk MED MINDRE annet er sagt.
3. Lagre i riktig tabell, ferdig rutet.
4. Skriv rad i `captures` med tolkning.
5. Returner kvittering.

**Ruting-filosofi:** AI ruter automatisk (ingen bekreftelse i øyeblikket), men hver fangst er synlig i "nylig lagt til" slik at feilruting fanges i ettertid. Lavest friksjon UTEN at noe forsvinner.

---

## 6. Skjermer / UI

### "I dag" (hjemskjerm)
- **Topp 3** dagens viktigste (stjernemarkerte oppgaver).
- **Kalender** (read-only fra Google Calendar).
- **Åpne oppgaver** sortert på forfall.
- **Slipping**: prosjekter/oppgaver som ikke er rørt på X dager (henter `sist_rørt_at`).
- **Rutine-sjekkliste** (morgen/ettermiddag/kveld) med streak-indikator.
- **Resurfacing**: ett favoritt-sitat/notat roterer daglig.
- **Til review**: items AI har flagget for senere gjennomgang.
- **Nylig lagt til** / varsler (fangst-kvitteringer).

### Oppgaver
- Sorter: åpne / gjort / alle; etter prosjekt/domene; etter forfall.
- Detalj: knytt til domene+prosjekt+milepæl, prioritet, påminnelse, tilbakevendende.

### Prosjekter
- Aktive prosjekter / områder per domene.
- Prosjekt-detalj: milepæler (%-fremdrift), knyttede oppgaver, sjekklister, sjekkliste-maler, aktivitetslogg (timer valgfritt).

### Rutiner
- Daglige rutiner med streak + graf.
- Tidsbegrensede streaks (X dager), arkiv av fullførte.

### Bibliotek
- Notater / sitater / bøker, hver med egne sorteringer og tags.
- Sitat-detalj: quote + flere "tanker" over tid.
- Bok-detalj: omslag, metadata, høydepunkter/sitater knyttet til boka.

### Innstillinger
- Google Calendar-tilkobling (siste sync, tving sync), tidssone.
- Integrasjonsstatus (Pushover, Anthropic, Calendar) med grønn hake.

---

## 7. Varsler (Pushover)
- Per-oppgave påminnelser (push).
- Daglig oppsummering.
- Varsel ved bommet rutine.

---

## 8. Byggerekkefølge (anbefalt for Claude Code)

**Fase 1 – Skjelett.** Next.js + Drizzle + Postgres lokalt. Domener, prosjekter, oppgaver. Manuell oppretting via web. Auth.

**Fase 2 – Fangst.** `/api/capture` med Anthropic-ruting (tekst først, lyd etterpå). "Nylig lagt til"-kvittering. iOS Shortcut.

**Fase 3 – Rutiner.** Streaks, logg, graf, "I dag"-rutiner.

**Fase 4 – I dag-skjerm komplett.** Topp 3, slipping, resurfacing, review. Google Calendar read-only.

**Fase 5 – Bibliotek.** Notater/sitater/bøker + resurfacing-kobling.

**Fase 6 – Varsler.** Pushover. Deploy til Railway. PWA på hjemskjerm.

**Senere (ikke v1):** Chat-med-data, Folk/CRM, Inventar, Innhold, Kindle-import.

---

## 9. Det Lars må passe på (ærlig påminnelse)
- Bygg fasene i rekkefølge. Ikke hopp til de kule AI-funksjonene før kjernen brukes daglig.
- Fase 2 (fangst) er hele poenget. Hvis den ikke er sømløs, stopp og fiks den før noe annet.
- Mål suksess på *bruk*, ikke på hvor pent systemet er designet.
