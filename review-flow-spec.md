# Review-flow — spesifikasjon

Bygges inn i eksisterende **Livssystem** (Next.js / PostgreSQL / Railway / Drizzle ORM).
Dette dokumentet er kontrakten til Claude Code. Det beskriver *hva* som skal bygges og
*hvorfor*, ikke nødvendigvis hver kodelinje.

---

## 0. Designprinsipper (les disse først — alt annet følger av dem)

1. **Review-flyten er produktet, ikke databasen.** Hver review skal føde 1–3 konkrete
   oppgaver i Livssystem. En review som kan fullføres uten at noe havner i oppgavelista
   er designet feil.
2. **Mobil-først for månedsreview.** Den skal kunne fullføres liggende i sofaen, uten Mac.
   Dette er ikke responsivt-som-bonus — det er hele eksistensgrunnlaget. (Historisk
   friksjonspunkt: refleksjon krevde at Mac-en var tilgjengelig. Den feilen skal ikke
   gjentas.)
3. **Bygg den stygge versjonen først.** Den styggeste flyten som lar en månedsreview
   fullføres på mobil slår den vakreste som aldri blir ferdig. Polering kommer *etter*
   første ekte bruk.
4. **Asymmetri mellom nivåene.** Kvartal = dypt, alle roller, sjelden. Måned = lett,
   bare aktive fokus, ofte. Aldri full replanlegging hver måned.

---

## 1. To akser: roller og domener

Systemet har to akser som **ikke** mapper én-til-én. Dette må modelleres eksplisitt.

| Akse | Hva det er | Hvor det brukes |
|------|-----------|-----------------|
| **Domener** (Meg / Oss / Stall / Hest) | Hvor oppgaver og prosjekter bor. Organisering av arbeid. | Finnes allerede i Livssystem. |
| **Arete-roller** (Far / Partner / Mann / Rytter / Stalleier / Produktleder) | Hvem brukeren prøver å være. Retning og verdi. | Ny. Styrer reviewen. |

**Kjerneregel:**
> Roller styrer reviewen. Domener styrer oppgavene.
> Et rollefokus produserer oppgaver som lander i ett eller flere domener.

Mappingen er mange-til-mange:
- *Rytter* lever nesten helt i *Hest*.
- *Far* spenner over flere domener (barn i Bergen → Meg/Oss).
- *Stall* rommer to roller: *Stalleier/Drifter* og *Rytter* (Namorador i jobb).

Ikke tving en rolle til å «være» et domene. Koblingen går via rollefokus → oppgave,
og oppgaven beholder sitt eget domene.

---

## 2. Datamodell

Nye tabeller (Drizzle). Eksisterende `tasks`/oppgavetabell i Livssystem antas å finnes
og gjenbrukes.

### `roles`
| felt | type | notater |
|------|------|---------|
| id | pk | |
| name | text | Far, Partner, Mann, Rytter, Stalleier, Produktleder |
| color | text | dempet aksent, scandinavisk palett |
| sort_order | int | |

### `periods`
Representerer en konkret måned eller et kvartal.
| felt | type | notater |
|------|------|---------|
| id | pk | |
| type | enum | `month` \| `quarter` |
| year | int | |
| index | int | 1–12 for måned, 1–4 for kvartal |
| label | text | f.eks. «2026 Q3», «august 2026» |

### `role_status`
Status per rolle per **kvartal**. Settes i kvartalsreview.
| felt | type | notater |
|------|------|---------|
| id | pk | |
| role_id | fk → roles | |
| period_id | fk → periods | (kvartalsperiode) |
| status | enum | `prioritert` \| `vedlikehold` |

### `role_focus`
Et fokus for én rolle i én periode. Hjertet i systemet.
| felt | type | notater |
|------|------|---------|
| id | pk | |
| role_id | fk → roles | |
| period_id | fk → periods | |
| outcome | text | **Utfall** — hvilken tilstand skal være annerledes ved slutten |
| next_action | text | **Neste konkrete handling**, liten nok til denne uka |
| timing | text | **Når/hvor** — øktdag, ukedag, etc. |
| status | enum | `aktiv` \| `fullført` \| `droppet` |

### `focus_task` (koblingsledd)
Mange-til-mange mellom rollefokus og oppgaver i Livssystem.
| felt | type | notater |
|------|------|---------|
| id | pk | |
| focus_id | fk → role_focus | |
| task_id | fk → tasks (eksisterende) | oppgaven beholder sitt domene |

### `reviews`
En gjennomført (eller påbegynt) review.
| felt | type | notater |
|------|------|---------|
| id | pk | |
| period_id | fk → periods | |
| type | enum | `month` \| `quarter` |
| status | enum | `pågår` \| `fullført` |
| current_step | int | for «fortsett der du slapp» |
| started_at | timestamp | |
| completed_at | timestamp | nullable |

### `review_answers`
Ett svar per spørsmål. Lagres fortløpende (autosave).
| felt | type | notater |
|------|------|---------|
| id | pk | |
| review_id | fk → reviews | |
| role_id | fk → roles | nullable (toppnivå-spørsmål har ingen rolle) |
| question_key | text | stabil nøkkel, se §3 |
| answer | text | |

> **Autosave-krav:** `review_answers` skrives ved hvert stegbytte, ikke ved «ferdig».
> En halvferdig review skal alltid kunne gjenopptas via `reviews.current_step`.

---

## 3. Spørsmål

Spørsmål lagres med stabile `question_key`-er så historikk kan sammenlignes over tid.

### Månedsreview (lett, ~10 min)

**Per rolle brukeren velger å ta (1–6, brukerens valg den måneden):**
- `month.role.gap` — «Hvor levde jeg etter det jeg vet er riktig i denne rollen — og hvor falt jeg tilbake?»
- `month.role.next` — «Hva er den ene tingen som ville flyttet denne rollen mest neste måned?»

**Toppnivå (uten rolle):**
- `month.top.system_fiddling` — «Hvor brukte jeg tid på å fikse systemet i stedet for å leve livet?»
- `month.top.body` — «Hva sier kroppen?» (HRV-trend, søvn, styrke)

### Kvartalsreview (dypt, ~45 min)

**Alle seks roller** får `gap` + `next` (samme nøkler, kvartalsperiode).

**Look up (toppnivå):**
- `quarter.up.goals` — «Er målene fortsatt riktige? (WE Lätt B:2 i august — på sporet eller lurer jeg meg selv? Stall Engås mot selvbærende — beveget økonomien seg?)»

**Mønster (genereres av systemet, ikke skrives fritt):**
- `quarter.pattern.neglect` — systemet viser hvilken rolle som er forsømt på tvers av de
  tre foregående månedsreviewene. Dette er den ene funksjonen som rettferdiggjør databasen
  over markdown-filer.

**Sett rollestatus for neste kvartal:**
- Velg hvilke 2–3 roller som er `prioritert`. Resten settes eksplisitt til `vedlikehold`.
  Å bevisst sette en rolle til vedlikehold er en kraftig handling, ikke et nederlag.

**Look forward:**
- 1–3 kvartalsfokus **totalt på tvers av roller** — ikke ett per rolle.

---

## 4. Flyten (UX-kontrakt)

### To moduser, visuelt forskjellige

**Review-modus** = fullskjerm, distraksjonsfri wizard.
- Ett spørsmål om gangen. Stort tekstfelt. Én knapp: **Neste** (nederst, tommelvennlig).
- Ingen meny/sidebar/dashboard synlig.
- Fremdriftsindikator nederst («steg 3 av 7») — psykologisk avgjørende for at man starter.
- Forbilde: Typeform. Ikke Jira.

**Dashboard-modus** = rolig oversikt, lesemodus.
- Øverst: aktive rollefokus (utfall + neste handling) som retning.
- Under: oppgaver per domene (eksisterende Livssystem-visning).

### Tre grep som avgjør om systemet brukes

1. **Autosave underveis.** Gå ut etter spørsmål 2, kom tilbake til spørsmål 3, mist ingenting.
2. **Vis forrige svar diskret ved siden av.** Når man svarer på «hvor var jeg som Rytter»,
   vis forrige måneds svar på samme `question_key` + `role_id`. Refleksjon oppstår i kontrasten.
3. **Sluttskjermen viser produktet.** Ikke «Ferdig!» — men de 1–3 oppgavene som nå er
   opprettet, med tidssetting brukeren kan justere. Sløyfen lukkes synlig.

### Wizard-stegsekvens, månedsreview
1. Velg hvilke roller du tar denne måneden (multi-select).
2. For hver valgt rolle: `gap`, så `next`. (Vis forrige svar.)
3. `system_fiddling`.
4. `body`.
5. **Oppsummering → opprett oppgaver.** Hvert `next`-svar foreslås som oppgave med
   domene-tag og tidssetting. Bruker bekrefter/justerer. Oppgaver skrives til `tasks`
   + `focus_task`.

### Wizard-stegsekvens, kvartalsreview
1. System viser `quarter.pattern.neglect` (forsømt rolle, auto-generert).
2. Alle seks roller: `gap`, så `next`.
3. `quarter.up.goals`.
4. Sett `role_status` for neste kvartal (prioritert/vedlikehold).
5. Velg 1–3 kvartalsfokus totalt → opprett `role_focus`-rader.
6. **Oppsummering → opprett oppgaver** (samme mønster som måned).

---

## 5. Påminnelse / kadens

Friksjonen som drepte tidligere systemer var at refleksjon krevde at brukeren oppsøkte
verktøyet. Snu det: **systemet kommer til brukeren.**

- Påminnelse den 1. i hver måned → start månedsreview.
- Påminnelse første dag i kvartalet → start kvartalsreview.
- Aktive rollefokus vises på dashboardet *mellom* reviewene, så de ikke glemmes innen uke 2.

Leveringskanal avklares ved bygging (push / e-post / kalender). Minimumskrav: noe som
treffer telefonen uten at brukeren må åpne appen selv.

---

## 6. Estetikk (lavest prioritet — ikke bruk tid her før flyten virker)

- Behold scandinavisk-minimal retning fra Livssystem. Muted domenefarge-prikker.
- Roller: gjenbruk domenefarger eller egen dempet palett.
- Mye luft, én aksentfarge, stor lesbar typografi. Ro, ikke datatetthet.
- **Advarsel:** overgangsanimasjoner og fargejustering er system-fikling forkledd som
  fremgang. Bygg stygt, bruk i én ekte review, polér *deretter* det som irriterte.

---

## 7. Byggerekkefølge (foreslått for Claude Code)

1. Datamodell + migrasjoner (§2).
2. Månedsreview-wizard, stygg versjon, mobil, med autosave (§4).
3. Oppgave-output: `next`-svar → `tasks` + `focus_task` (§4 sluttsteg).
4. Dashboard: vis aktive rollefokus øverst (§4).
5. **Bruk systemet i én ekte månedsreview.** Stopp. Noter hva som irriterte.
6. Kvartalsreview + `quarter.pattern.neglect`-genereringen (§3).
7. Påminnelser (§5).
8. Polering / estetikk (§6) — kun det som faktisk irriterte i steg 5.
