# Review-flow — utviklingsplan (Del 2)

Konkretisert plan for review-modulen, basert på `review-flow-spec.md` og
`journal-spec.md`. Journal-modulen (Del 1) er bygget; review-flow bygges
**etter** at journalen er i daglig bruk en ekte uke, fordi review-en lever av
journalens råstoff (snutter + bilder).

Dette dokumentet er beslutningene — uklarhetene fra spec-en er lukket her.

---

## 0. Bekreftede valg (Lars, 2026-06-29)

- **Roller:** Far / Partner / Mann / Rytter / Stalleier / Produktleder — bekreftet, seedes som de er.
- **Varsling:** Ikke push. Et **rolig kort på «I dag»** den 1. i måneden/kvartalet, som forsvinner når review-en er gjort og kan avvises diskret. Ingen cron, ingen Pushover for review.
- **`body`-spørsmålet:** Hentes fra **Apple Health via «Health Auto Export»** (Lars har konto). Bygges som passiv datainnsamling — men **venter** (bygges ikke nå). Se §8.

---

## 1. Datamodell (7 nye tabeller)

Stil følger eksisterende base: engelske tabellnavn, norske kolonnenavn, norske enum-verdier. Cascade-sletting der det gir mening (samme mønster som `milestones`).

| Tabell | Felt | Rolle |
|---|---|---|
| `roles` | id, navn (unik), farge, rekkefølge | De 6 Arete-rollene |
| `periods` | id, type (`måned`/`kvartal`), år, indeks, label, påmindetAt | Konkret måned/kvartal. `påmindetAt` reservert (brukes ikke nå som vi dropper push, men billig å ha) |
| `role_status` | id, roleId→roles, periodId→periods, status (`prioritert`/`vedlikehold`) | Per rolle per **kvartal** |
| `role_focus` | id, roleId, periodId, utfall, nesteHandling, tidssetting, status (`aktiv`/`fullført`/`droppet`), opprettet | **Hjertet** — kilden dashboardet leser |
| `focus_task` | id, focusId→role_focus (cascade), taskId→tasks (cascade) | Kobler fokus til oppgaver (mange-til-mange) |
| `reviews` | id, periodId, type, status (`pågår`/`fullført`), gjeldendeSteg, startetAt, fullførtAt | Påbegynt/fullført review + gjenoppta-punkt |
| `review_answers` | id, reviewId (cascade), roleId→roles (null for toppnivå), questionKey, svar | Ett svar pr spørsmål, autosave |

**Nye enums:** `period_type` (`måned`/`kvartal`), `role_status_type` (`prioritert`/`vedlikehold`), `role_focus_status` (`aktiv`/`fullført`/`droppet`), `review_status` (`pågår`/`fullført`). `reviews.type` gjenbruker `period_type`.

**Seed:** 6 roller i `seed.ts`, samme mønster som domener, med dempede farger.

**Spørsmålsnøkler** (samme dotted-stil som journalen):
- Måned: `month.role.gap` + `month.role.next` (pr valgt rolle), `month.top.system_fiddling`, `month.top.body`
- Kvartal: `quarter.pattern.neglect` (auto-generert), `quarter.role.gap` + `quarter.role.next` (alle 6), `quarter.up.goals`

---

## 2. Avklarte uklarheter (beslutninger)

1. **`quarter.pattern.neglect`:** Se på de tre foregående månedsreviewene. Forsømt rolle = den som sjeldnest ble valgt (ingen `role_focus`/svar). Ved likhet: rollen med eldst siste fokus. Systemet genererer teksten — ikke et skrivefelt.
2. **`periods` auto-opprettes:** `lib/periode.ts` gjør get-or-create av gjeldende måned/kvartal og lager `label` i kode («august 2026», «2026 Q3»). Ingen manuell seeding.
3. **Rollevalg i månedsreview:** Wizarden foreslår rollene som var `prioritert` siste kvartal (uthevet) + de som ble tatt forrige måned. Fri avhuking.
4. **Kvartalsfokus → `role_focus`:** Både måned og kvartal oppretter `role_focus`-rader (måned lett: bare `nesteHandling` + valgfri `tidssetting`; kvartal fullt: `utfall` + `nesteHandling` + `tidssetting`). `roleId` alltid satt. Én kilde for dashboardet uansett nivå.
5. **Fremdriftsindikator:** Beregnes dynamisk («steg 3 av 7»), siden antall roller varierer.
6. **Journal-kontekst:** Vises ved `gap`-spørsmålene. Diskret ved siden, som «forrige svar».
7. **`body`:** Apple Health (§8), ikke fritekst-gjetning. Beholder et lite refleksjonsfelt over tallene.
8. **Varsel:** Rolig kort på «I dag», ikke push (§0).

---

## 3. Wizarden (distraksjonsfri fullskjerm)

- **Egen route-gruppe `(review)`** med minimal layout uten `SidebarNav`/`BunneNav`/`FangstOverlay` (i motsetning til `(app)`). Rot-layouten er allerede ren.
- Ett spørsmål om gangen, stort tekstfelt, én **Neste**-knapp nederst (tommelvennlig), «steg 3 av 7». Forbilde Typeform.
- **Autosave** på hvert stegbytte (felt-selektiv PATCH, som oppgaver/journal). `reviews.gjeldendeSteg` gir gjenoppta.
- **Forrige periodes svar** vises diskret (samme `questionKey` + `roleId`, forrige periode) — kontrasten er poenget.
- **Sluttskjermen = produktet:** ikke «Ferdig!», men de 1–3 oppgavene som opprettes, med domene-tag + tidssetting du kan justere.

**Stegsekvenser (spec §4):**
- **Måned:** velg roller → for hver rolle: `gap`, `next` → `system_fiddling` → `body` → oppsummering/opprett oppgaver.
- **Kvartal:** vis `quarter.pattern.neglect` → alle 6 roller: `gap`, `next` → `quarter.up.goals` → sett `role_status` (prioritert/vedlikehold) → velg 1–3 kvartalsfokus totalt → oppsummering/opprett oppgaver.

---

## 4. Oppgave-output (sluttskjerm)

- `nesteHandling` fra `role_focus` blir forslag til oppgave.
- Skrives via gjenbruk av `POST /api/oppgaver` (`tittel`, `domene` (navn), `prioritet`, `forfall`).
- Én `focus_task`-rad pr opprettet oppgave kobler fokus ↔ oppgave. Oppgaven beholder sitt eget domene.

---

## 5. Dashboard

- Aktive `role_focus` (utfall + neste handling) øverst på et review-dashboard / på «I dag», under domene-oppgavene. Holder fokusene synlige mellom reviewene.

---

## 6. Varsling — rolig kort (ikke push)

- Server-beregnet kort på «I dag»: hvis dagens dato ≥ 1. i perioden OG ingen fullført review finnes for perioden → vis «Månedsreview klar — 10 min» (tilsv. kvartal).
- Forsvinner når review-en er fullført. Diskret «ikke nå»-avvisning.
- Ingen cron, ingen Pushover.

---

## 7. Journal-kobling

- `lib/periode.ts` gir periodens datospenn. Join `journal_entries` på `dato` innen spennet → hent `morning.gratitude`/`evening.went_well`-snutter + månedens bilder.
- Vises diskret ved `gap`-spørsmålene i wizarden, samme kontrast-mekanisme som «forrige svar».

---

## 8. `body` via Apple Health — VENTER (bygges ikke nå)

Plan når vi setter i gang:
- `POST /api/helse`, beskyttet med hemmelig nøkkel (`?secret=…`, som cron).
- Tabell `health_metrics` (dato, metrikk, verdi, enhet) — upsert pr dag.
- I «Health Auto Export»: REST API-automasjon → `https://<railway-url>/api/helse?secret=…`, JSON, daglig.
- Standard-metrikker: HRV, hvilepuls, søvnlengde (utvidbart).
- `body`-steget viser HRV-trend (7 dager mot forrige), snittsøvn, hvilepuls + lite refleksjonsfelt.
- **Først:** én test-eksport fra telefonen for å se eksakt feltformat før koden festes.

Anbefaling når vi starter: bygg mottaket først (passiv innsamling) så historikk akkumuleres før review-en trenger en «trend». Lars har valgt å **vente** med dette.

---

## 9. Byggerekkefølge (når journalen er i daglig bruk)

1. Schema + `db:push` + seed 6 roller
2. `lib/periode.ts` (get-or-create + label)
3. API: `/api/review` (start/gjenoppta), `/api/review/[id]` (autosave), oppgave-output
4. `(review)`-gruppe + wizard — månedsreview først, kvartal etterpå
5. `quarter.pattern.neglect`-aggregering
6. Journal-kobling i wizarden
7. Dashboard-seksjon + rolig kort på «I dag» + nav
8. (Senere, eget løp) Apple Health-mottak — §8
9. `npm run build`, test ende-til-ende, deploy, test fra mobil

---

## 10. Verifisering (ende-til-ende)

1. `cd app && npm run db:push` — nye tabeller uten å røre eksisterende data.
2. `npm run build` lokalt — kompilerer rent.
3. Start månedsreview, svar på 2 steg, lukk, gjenoppta på riktig steg. Fullfør → oppgaver i `tasks` + `focus_task`, aktive fokus på dashboard. Bekreft at forrige-svar og journal-snutt vises.
4. Bekreft at det rolige kortet på «I dag» dukker opp den 1. og forsvinner når review er gjort.
5. Deploy til Railway, test fra ekte iPhone (PWA).
6. Oppdater `CLAUDE.md` (Siste endringer) + dette dokumentet ved avvik.
