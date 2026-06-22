# CLAUDE.md – Livssystem

Dette er kontekstfilen for prosjektet. Les den ved start av hver økt. Den definerer hva vi bygger, hvordan, og i hvilken rekkefølge. To andre dokumenter finnes: `livssystem-spec.md` (full kravspec) og `livssystem-design-brief.md` + eksporterte design-filer (visuell retning). Denne filen er den korte sannheten.

---

## Hva vi bygger

Et personlig, samlet livssystem for én bruker. Håndterer oppgaver, prosjekter, milepæler og rutiner under fire livsdomener, pluss et bibliotek (notater, sitater, bøker). Kjernen er **friksjonsfri fangst**: å legge inn noe – som regel via tale fra mobil – skal ta sekunder, og AI ruter det automatisk til riktig sted.

Mobil-først. Web-app lagret på iPhone-hjemskjerm (PWA). Én bruker, hele appen bak innlogging.

## Den hellige regelen

**Fangst-flyten er hele poenget. Alt annet er sekundært.** Vi bygger ikke videre forbi fangst-fasen før fangst funker sømløst fra mobil, deployet og testet i ekte bruk. Ikke foreslå å hoppe til "kule" funksjoner før kjernen er i daglig bruk.

---

## Stack

- **Frontend + backend:** Next.js (App Router, API-ruter for backend)
- **Database:** PostgreSQL
- **ORM:** Drizzle
- **Hosting:** Railway
- **Kildekontroll:** GitHub
- **AI:** Anthropic API (omskriving + ruting av fangst) + transkripsjon (Whisper e.l.)
- **Varsler:** Pushover (API)
- **Kalender:** Google Calendar API (KUN lesing, read-only)
- **Auth:** Brukernavn/passord + sesjon. Én bruker.

Lokalt først. Deploy til Railway allerede etter fangst-fasen for ekte mobiltesting.

---

## Datamodell

Hierarki:
```
Domene (4 faste: Meg, Oss, Stall, Hest)
  └── Prosjekt (har sluttdato)  ELLER  Område (løpende)
        └── Milepæl (valgfri, gir %-fremdrift på prosjekt)
              └── Oppgave
Rutine (egen entitet, knyttet til domene – IKKE et domene)
Bibliotek (notat / sitat / bok – separat fra hierarkiet)
```

Tabeller (utgangspunkt – finpuss ved behov):

- **domains**: id, navn (Meg|Oss|Stall|Hest), farge, rekkefølge
- **projects**: id, domain_id, navn, beskrivelse, type (`prosjekt`|`område`), status, start_date, end_date (null for område), opprettet, sist_rørt_at
- **milestones**: id, project_id, navn, forfall, fullført, rekkefølge
- **tasks**: id, domain_id, project_id (null), milestone_id (null), tittel, notat (markdown), prioritet, forfall, påminnelse_at, topp3 (bool), tilbakevendende-regel, neste_forekomst, status (`åpen`|`gjort`), opprettet, fullført_at
- **routines**: id, domain_id (null), navn, beskrivelse, tidspunkt (`morgen`|`ettermiddag`|`kveld`|`når_som_helst`), klokkeslett (null), type (`daglig`|`tidsbegrenset`), varighet_dager (null), start_date, send_varsel
- **routine_logs**: id, routine_id, dato, fullført
- **library_items**: id, type (`notat`|`sitat`|`bok`), tittel/innhold, kilde, tags (array), flagget_for_review, review_dato, favoritt, opprettet, + bok-felt (forfatter, omslag_url, lese_status, format, startet, fullført, rating, isbn, sammendrag)
- **library_thoughts**: id, item_id, tekst, opprettet (flere tanker per sitat)
- **captures**: id, rå_tekst, tolket_json, rutet_til (type+id), status, opprettet

Norsk i UI-labels og enum-verdier.

---

## Domener (kontekst)

- **Meg** – personlig: helse, trening, rutiner, lesing, utvikling
- **Oss** – familie og hjem
- **Stall** – Stall Engås: rideskole, drift, kurs
- **Hest** – egne hester: trening, konkurranse, avl

Habits og trening er rutiner under Meg, ikke eget domene.

---

## Fangst-flyt (kjernen)

Inngang A – **iOS Shortcut** (fart): tar opp tale → `POST /api/capture` → kort bekreftelse tilbake.
Inngang B – **Mobil web-app** (fart + redigering): mikrofon-knapp eller tekstfelt → samme endepunkt → resultat i "nylig lagt til".

Server `/api/capture`:
1. Hvis lyd: transkriber.
2. Send tekst til Anthropic API med ruting-prompt: rens fyllord, klassifiser (oppgave/rutine/notat/sitat/bok), trekk ut domene, prosjekt, forfall, klokkeslett, prioritet. Standard: legg til påminnelse automatisk med mindre annet sies.
3. Lagre ferdig rutet i riktig tabell.
4. Skriv rad i `captures`.
5. Returner kvittering.

**Ruting-filosofi:** AI ruter automatisk uten bekreftelse i øyeblikket, MEN hver fangst er synlig i "nylig lagt til" så feilruting fanges i ettertid. Lavest friksjon UTEN at noe forsvinner usett.

---

## Skjermer

- **I dag** (hjemskjerm, viktigst): fremtredende fangst-knapp, topp 3, dagens rutiner m/streak, kalender i dag (read-only), det som haster, resurfacing (ett roterende sitat/notat daglig). Sekundært bak ett tapp: slipping, til review. Skal være ROLIG, ikke en vat av ting.
- **Oppgaver**: liste sortert på forfall, filtre, detalj med koblinger.
- **Prosjekter**: prosjekter vs. områder per domene, milepæler m/%-fremdrift, sjekklister, aktivitetslogg.
- **Rutiner**: daglige m/streak+graf, tidsbegrensede streaks, arkiv.
- **Bibliotek**: notater/sitater/bøker, sitat med flere tanker, bok med metadata+høydepunkter.
- **Innstillinger**: integrasjonsstatus, kalender-sync, tidssone.

Følg de eksporterte design-filene for utseende. Lyst, rent, skandinavisk. Dempede domenefarger som prikk/kantstripe, ikke flatefyll.

---

## Byggerekkefølge (følg denne, ikke hopp)

1. **Skjelett:** Next.js + Drizzle + Postgres lokalt. Domener, prosjekter, oppgaver. Manuell oppretting. Auth. Bevis at stacken kjører.
2. **Fangst:** `/api/capture` med Anthropic-ruting (tekst først, lyd etterpå). "Nylig lagt til"-kvittering. iOS Shortcut. **Deploy til Railway og test fra mobil. STOPP her til dette funker sømløst.**
3. **Rutiner:** streaks, logg, graf.
4. **I dag komplett:** topp 3, slipping, resurfacing, review, Google Calendar read-only.
5. **Bibliotek:** notater/sitater/bøker + resurfacing-kobling.
6. **Varsler + deploy:** Pushover, PWA på hjemskjerm.

Senere (IKKE nå): chat-med-data, folk/CRM, inventar, innhold, Kindle-import.

---

## Idéliste (notert 2026-06-22 — ikke prioritert)

### Oppgaver og prosjekter
- **Tilbakevendende oppgaver** — Schemaet har allerede `tilbakevendende_regel`-feltet, men logikken er ikke implementert. Eks: "Vei hestene" månedlig, "Ring lege" halvårlig.
- **"Denne uken"-modus** — Ukesplanlegging: dra oppgaver inn i en "denne uken"-bøtte. Vises på hjemskjermen i stedet for/under topp 3. Mer fleksibel enn fast topp 3.
- **Slipp-score** — Vis antall dager en oppgave har ligget forfalt. Gjør det åpenbart hva som aldri blir gjort og bør slettes eller arkiveres.

### Hestespesifikt
- **Helselogg per hest** — Notatfelt koblet til en hest-entitet: skoing, vaksine, vet-besøk, hvileperioder. Tidslinje-visning. Mer målrettet enn å drukne dette i oppgaver.
- **Treningslogg** — Logg trening per hest med dato, type og kommentar. Graf over treningsfrekvens. Kan bygges på bibliotek-strukturen.

### Journal og bibliotek
- **"Du skrev dette i går"** — Øverst på journalsiden: gårsdagens post som stille refleksjonspåminnelse.
- **Bok-fremgang** — Logg sider eller prosent mens du leser. Fremgangsbar på bokkortene.

### Hjemskjerm og innsikt
- **Domene-balanse** — Visuelt hint (fire fargede streker) som viser om ett domene har vært ignorert en stund. Eks: "Du har ikke gjort noe i Meg på 9 dager."
- **Ukesgjennomgang** — Dedikert fredag-visning: hva ble fullført, hva ble ikke gjort, hva nærmer seg neste uke. Ingen AI — aggregert data presentert pent.
- **Mørk modus** — Praktisk i stall-kontekst om kvelden eller tidlig morgen.

### Mer ambisiøst
- **AI ukesoppsummering på Pushover** — Automatisk søndag kveld via cron: "5 oppgaver fullført, 3 forfalt, 2 milepæler nærmer seg."
- **Fangst-korreksjon** — Én knapp i "nylig fanget" for å flytte feilrutet innhold til riktig sted, uten å måtte lete det opp manuelt.

---

## Arbeidsmåte

- Bygg én fase ferdig og testet før neste.
- Hold endringer små og testbare. Commit ofte til GitHub.
- Spør hvis noe i datamodellen er uklart heller enn å gjette stort.
- Norsk i alt brukervendt.

---

## Siste endringer

### 2026-06-22
- **Bibliotek: legg til bok** — Ny `LeggTilBokKnapp.tsx` med Open Library-søk (gratis API, ingen nøkkel) og autoutfylling av tittel/forfatter/omslag/ISBN. POST `/api/bibliotek` oppretter boken. Lese-status velges (Vil lese / Leser nå / Lest).
- **Bok: manuell fallback + z-index** — Når Open Library ikke finner boken kan den legges inn manuelt (tittel + valgfri forfatter). Lagre-knapp styres av `kanLagre` (manuell tittel utfylt ELLER bok valgt). Modalen løftet fra `z-50` til `z-[60]` så den flytende fangst-knappen ikke dekker søkefeltet.
- **gitignore** — La til `.next/` på rotnivå (strø-build havnet utenfor `app/`).
- **Oppgaver: domenefiltere** — Pillerad (Alle / Meg / Oss / Stall / Hest) øverst på oppgaversiden. URL-basert (`?domene=Meg`), kombineres med sortering.
- **Oppgaver: sortering** — Sorteringsknapper (Forfall / Prioritet / Domene / Nyeste) ved siden av «Øvrige»-overskriften på mobil. Desktop: klikke kolonneheader. Sorteres i JS etter henting, ingen ekstra DB-kall.
- **Journal: prompts** — `NyJournalpostKnapp` viser et tilfeldig spørsmål ved åpning. Knapp for nytt spørsmål ↺. Pool på 12 norske journalprompts i komponenten.
- **PWA-ikon** — Fikset `apple-touch-icon`-URL i `layout.tsx` og `manifest.json` til `/apple-icon` (uten `.png`). Tidligere pekte begge på `/apple-icon.png` → 404 → iOS viste fallback-bokstav.
- **Rydde API-ruter** — Slettet duplikat-mapper med norske tegn (`api/milepæler/`, `api/prosjekter/[id]/milepæler/`). Kun ASCII-versjonene (`milestone/`, `milestones/`) beholdt.

### 2026-06-21
- **UX: Kompakt avhuking i OppgaveKort** — `OppgaveKort.tsx` oppdatert til samme mønster som hjemskjerm-komponentene (Topp3, DetSomHaster): knapp er nå ren 44px touch-target, visuell sirkel er separat 22px `<div>` inni. Rad-padding redusert til `px-2 py-1`.
- **Data: 36 oppgaver importert** — Oppgaver fra `✱ Prosjekter.md` lagt inn i databasen (Railway) uten domene/prosjekt-tilknytning. Lars kobler dem til riktige steder i ettertid.
