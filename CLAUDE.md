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
- ✅ **Tilbakevendende oppgaver** — Implementert: `tilbakevendendeRegel` på oppgaver, og `/api/oppgaver/[id]` oppretter neste forekomst når en tilbakevendende oppgave fullføres.
- ✅ **Fangst-korreksjon** — Implementert 2026-06-23. Trykk på en rad i «Nylig fanget» → flytt til riktig domene (Meg/Oss/Stall/Hest eller uten). `PATCH /api/capture/[id]` oppdaterer både elementet (via `rutetTil`) og fangst-raden.
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

### 2026-06-30
- **Google Calendar: byttet fra OAuth refresh-token til service account** — Kalenderen feilet med `invalid_grant` fordi refresh-tokenen var død (OAuth-appen sto i «Testing»-modus → refresh-tokens utløper etter 7 dager). Byttet til en service account (`livssystem-kalender@livssystem.iam.gserviceaccount.com`, fantes allerede) som aldri utløper. `lib/googleKalender.ts` bruker nå `google.auth.JWT` med to nye env-variabler: `GOOGLE_SERVICE_ACCOUNT_KEY` (hele JSON-nøkkelen som én streng) og `GOOGLE_CALENDAR_ID` (Google-konto-e-posten — service account har ingen `primary`-kalender, så vi peker eksplisitt på den delte kalenderen). Forutsetter at kalenderen er delt med service account-ens e-post (tilgang «Se alle detaljer i hendelser»). Oppdaterte env-sjekkene i `lib/integrasjonsstatus.ts` og `api/kalender/route.ts`. De gamle `GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN` brukes ikke lenger av koden.

### 2026-06-29
- **Journal-modul (5 Minute Journal-stil) — Del 1 av 2** — Ny daglig journal som egen datamodell ved siden av den gamle fritekst-journalen. Tre nye tabeller i `schema.ts`: `journal_entries` (én rad pr dag, unik `dato`, valgfritt `sted`), `journal_answers` (svar pr `question_key`: `morning.gratitude` / `morning.great_day` / `morning.affirmation` / `evening.went_well` — gratitude lagres som én tekst med linjeskift), `journal_images` (ett komprimert data-URL-bilde pr dag, samme mønster som bokomslag). Dyttet med `db:push`.
  - **Lazy entry + Oslo-dato:** dagens entry opprettes først når noe faktisk lagres (så dager man bare kikker innom forblir tomme og månedsoppslaget rent). Ny `lib/dato.ts` med `iDagOslo()` (Intl `Europe/Oslo`) — hjemskjermen brukte `toISOString()` (UTC) som hopper feil rundt midnatt; journalen bruker ekte lokal dato.
  - **API:** `POST /api/journal` (get-or-create dagens entry, idempotent via unik dato), `PATCH /api/journal/[id]` (autosave: `{questionKey, svar}` upsert eller `{sted}`), `POST/DELETE /api/journal/[id]/bilde` (ett bilde pr dag, erstatter forrige).
  - **Skjermer:** `/journal` = dagens entry (`JournalDagen.tsx`, client, autosave-på-blur, bildekomprimering i canvas → JPEG q0.7 maks 900px). Morgenfeltene står som standard; kveld (`evening.went_well`) er en **frivillig** «＋ Legg til kveldsnotat»-utfolding — en kveld-løs dag ser bevisst komplett ut, ingen «mangler»-markør (kjerneprinsipp fra spec). `/journal/maned/[yyyy-mm]` = månedsrutenett der hver dag viser bildet eller en rolig placeholder (dagens dato uthevet, måneds-navigasjon, mandag-først). `/journal/arkiv` (+ `/journal/arkiv/[id]`) = de gamle fritekst-postene (`library_items` type=`journal`), uendret og lesbare — den gamle `/journal/[id]`-ruten flyttet hit, `JournalpostDetalj` peker nå tilbake til arkivet.
  - **Hjemskjerm:** diskret «Dagens journal»-kort i høyre kolonne på «I dag», tekst bytter mellom «Skriv morgenrefleksjonen» / «Fortsett dagens notat» avhengig av om gratitude er fylt.
  - **Gjenstår (Del 2):** review-flow (rolle-basert måneds-/kvartalsreview, `review-flow-spec.md`) bygges etter at journalen er i daglig bruk, per plan. `NyJournalpostKnapp.tsx` er nå ubrukt (gammel arkiv-oppretting) men urørt.

### 2026-06-26
- **Oppgaver: domenefilter-piller virket ikke fra «Alle»** — Pillraden (Alle / Meg / Oss / Stall / Hest) la bare til `?domene=`-parameteren i URL-en hvis et domene allerede var valgt (`lagUrl` hadde `if (valgtDomeneNavn && ...)`). Så fra utgangstilstanden «Alle» gjorde et trykk på et domene ingenting. `lagUrl` i `oppgaver/page.tsx` skrevet om: oppgitt verdi brukes alltid (tom streng = fjern filter), ellers beholdes gjeldende — gjelder både domene og sortering, så de to kombineres riktig.
- **Oppgaver: sortering virket ikke i desktop-tabellen** — Kolonnesortering (Forfall / Domene / Prioritet) endret URL og pil-markør, men radene sto stille fordi desktop-tabellen løkket over den usorterte `filtrerte`-lista. La til `sorterte = sorterOppgaver(filtrerte, …)` og bruker den i tabellen. (Mobil-kortvisningen sorterte allerede riktig via `andre`.)

### 2026-06-25
- **UX: synlig avhuking før oppgaven forsvinner** — Tidligere ble en oppgave fjernet i samme øyeblikk man trykket av-huk-sirkelen, så selve avhukingen ble aldri synlig. Nå skjer det i tre steg: (1) sirkelen fylles med domenefarge og får en hvit hake ✓, (2) raden fader ut (0,35 s), (3) raden fjernes. Fikset i `OppgaveKort.tsx` (ny `fjernet`-state i tillegg til `gjort`), `Topp3.tsx` og `DetSomHaster.tsx` (ny `ferdige: Set<number>` som sporer avhukede rader). API-kallet (`PATCH /api/oppgaver/[id]`) sendes fortsatt umiddelbart i bakgrunnen — kun visningen er forsinket. Hake-farge: `var(--hest)` i oppgaver/topp 3, oransje `#C28568` i «Det som haster».

### 2026-06-23
- **Bok: filtrer på lese-status** — Pillerad øverst i bok-fanen (`BibliiotekTabs.tsx`): Vil lese / Leser nå / Lest, hver med antall. Trykk for å filtrere, trykk igjen for å nullstille. Klient-side state (`aktivBokStatus`), filtrerer på `leseStatus` (default `vil_lese`), nullstilles ved fanebytte. Egen tom-tilstand når ingen bøker matcher valgt status.
- **Bok: leser vs. lytter (lydbok)** — Bøker kan nå merkes med format: `bok` (📖 Leser) eller `lydbok` (🎧 Lytter), via det eksisterende `format`-feltet i `library_items` (ingen schema-endring). Velges ved opprettelse i `LeggTilBokKnapp.tsx` (egen Format-rad over Status) og kan endres på detaljsiden via ny `BokFormatVelger.tsx`. POST `/api/bibliotek` og PATCH `/api/bibliotek/[id]` tar nå imot `format`. I bok-listen (`BibliiotekTabs.tsx`) vises et 🎧-merke foran forfatteren på lydbøker. Standard er `bok`.
- **Innstillinger-side (koblinger + API-kostnader)** — Ny side `/innstillinger` (`(app)/innstillinger/page.tsx`) med to seksjoner. (1) **Koblinger**: live helsesjekk av Database, Google Calendar (henter faktisk dagens hendelser), Anthropic (kaller `models.list` for å verifisere nøkkel), Pushover og Cron — hver med grønn/gul/rød prikk og detalj (`lib/integrasjonsstatus.ts`). (2) **API-kostnader**: månedens og total kostnad i kroner + token-tall, regnet fra en prisliste i `lib/apiBruk.ts`. Ny tabell `api_usage` (tjeneste, modell, endepunkt, input/output-tokens, opprettet) logges nå ved hvert AI-kall i `api/capture/route.ts` (`response.usage`). Kroner er et grovt anslag (Haiku 4.5 $1/$5 per MTok, kurs ~11 kr/$); rå tokens lagres, kroner regnes i visningslaget så historikk ikke fryser feil pris. Nav: tannhjul-lenke i SidebarNav-foten (desktop) og i hjemskjerm-headeren (mobil). Schema dyttet med `db:push`.
- **Bok: AI-sammendrag med key take-outs** — Ny `BokSammendrag.tsx` på bok-detaljsiden. Knapp «✨ Lag AI-sammendrag» kaller `POST /api/bibliotek/[id]/sammendrag`, som sender tittel + forfatter til Anthropic (`claude-haiku-4-5`) og får tilbake JSON med `oppsummering` + `takeaways[]`. Lagres i to nye `library_items`-felt: `ai_sammendrag` (text) og `ai_takeaways` (text array). Viser oppsummering + punktliste, med «↻ Lag på nytt»-knapp. Prompten ber modellen være ærlig hvis den ikke kjenner boken, ikke dikte. Fritekstfeltet «Hva jeg tenker» (`sammendrag`) er urørt — det er Lars' egne meninger, AI-sammendraget er separat. Schema dyttet med `db:push`.
- **Fangst-korreksjon** — «Nylig fanget» (`SisteFangster.tsx`) er nå interaktiv: trykk på en rad for å åpne en domene-velger og flytte feilrutet innhold til riktig domene (Meg/Oss/Stall/Hest), eller fjerne domenet. Nytt endepunkt `PATCH /api/capture/[id]` slår opp `rutetTil` og oppdaterer riktig tabell (`tasks`/`routines`/`libraryItems`) samt fangst-radens `tolketJson.domene`. Avgrenset til domene-bytte; å flytte mellom typer (f.eks. oppgave→notat) er ikke med.
- **Doc-rettelse** — Idélisten påsto at tilbakevendende oppgaver ikke var implementert; det er de (markert ✅).

### 2026-06-22
- **Bok: last opp eget omslag (manuelle bøker)** — I manuell-modus i `LeggTilBokKnapp.tsx` kan man nå laste opp et omslagsbilde. Bildet krympes i nettleseren (canvas, maks 400px bredt, JPEG q0.8) og lagres som data-URL i `omslagUrl` — ingen ekstern bildelagring, fungerer på Railways efemere filsystem. Forhåndsvisning med ×-knapp for å fjerne. Valgt på samme måte som auto-omslag fra Open Library.
- **Bok: score, tanker og omslag** — Bok-detaljsiden viser nå omslagsbildet (hentes automatisk fra Open Library), en stjerne-score (`BokRating.tsx`, 1–5, trykk samme stjerne igjen for å nullstille → `rating`) og et fritekstfelt «Hva jeg tenker» (`BokTanker.tsx` → lagres i `sammendrag`, lagre-knapp vises kun ved endring). PATCH `/api/bibliotek/[id]` støtter nå `sammendrag`. Bokkortene i listen viser omslag-miniatyr og stjerner.
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
