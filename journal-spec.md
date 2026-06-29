# Journal-modul — spesifikasjon

Tillegg til **Livssystem** (Next.js / PostgreSQL / Railway / Drizzle ORM).
Søsterdokument til `review-flow-spec.md`. Leses sammen med den — de deler datamodell og kobles.

---

## 0. Designprinsipper

1. **Daglig, kort, lavterskel.** Journalen er ikke review. Den tar minutter, ikke en kveld.
   Morgen er kjernen, kveld er en bonus.
2. **En dag uten kveldsnotat er KOMPLETT, ikke halvferdig.** Dette er det viktigste
   prinsippet i hele modulen. Historisk friksjon: kveldsrefleksjon glipper pga
   enhetstilgjengelighet (samme grunn som PKA pauset og Obsidian ble morgen-only). Kveld
   bygges derfor som noe man *kan legge til*, aldri som et tomt hull som signaliserer fiasko.
   Tomme felt dreper systemer.
3. **Journalen er råstoff for review.** Den ekte verdien er at månedsreviewen leser
   månedens journal-snutter og bilder. Det er koblingen som rettferdiggjør at journalen
   bor i Livssystem og ikke i Notes-appen.
4. **Hold metadata stramt.** Kun dato + sted. Ikke legg til vær, stemning, kart e.l. uten
   at brukeren eksplisitt ber om det. Hvert felt er ett mer å fylle hver morgen — og da
   ryker femminutters-løftet.

---

## 1. Format

Basert på 5 Minute Journal-strukturen, tilpasset.

### Morgen (kjerne)
- `morning.gratitude` — «Jeg er takknemlig for…» (liste, 1–3 punkter)
- `morning.great_day` — «Hvordan gjøre dagen bra?» (fritekst)
- `morning.affirmation` — «Dagens affirmasjon» (kort fritekst)

### Kveld (bonus — aldri påkrevd)
- `evening.went_well` — «Hva gikk bra i dag?» (fritekst)

### Per dag
- Ett valgfritt **bilde**.
- Metadata: **dato** (alltid) + **sted** (valgfritt, fanges automatisk hvis tilgjengelig,
  ellers fritekst).

---

## 2. Datamodell

### `journal_entries`
Én rad per dag.
| felt | type | notater |
|------|------|---------|
| id | pk | |
| date | date | unik — én entry pr dag |
| location | text | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### `journal_answers`
Ett svar pr spørsmål. Lagres fortløpende (autosave), som review.
| felt | type | notater |
|------|------|---------|
| id | pk | |
| entry_id | fk → journal_entries | |
| question_key | text | `morning.gratitude`, `evening.went_well`, etc. |
| answer | text | gratitude lagres som én rad m/ linjeskift, eller egne rader — Claude Code velger |

### `journal_images`
| felt | type | notater |
|------|------|---------|
| id | pk | |
| entry_id | fk → journal_entries | |
| url | text | peker til lagret fil (se §4) |
| created_at | timestamp | |

> **Merk:** datamodellen speiler bevisst `reviews`/`review_answers` fra review-speccen.
> Samme autosave-mønster, samme `question_key`-tilnærming. Gjenbruk komponenter der mulig.

---

## 3. To skjermtilstander

### Morgentilstand
- Vises som standard når dagens entry åpnes før kveld (eller når kveld er tom).
- Felt: gratitude (3 linjer), great_day, affirmation.
- Bilde-opplasting tilgjengelig.
- Mobil-først, tommelvennlig. Stort, rolig, scandinavisk-minimalt — som review-modus.

### Kveldstilstand
- Ett felt: `evening.went_well`.
- **Presenteres som en frivillig tilføyelse**, f.eks. en diskret «Legg til kveldsnotat»-
  knapp, ikke et alltid-synlig tomt felt.
- En dag der dette aldri fylles skal i alle visninger (liste, månedsoppslag) se ferdig ut.
  Ingen «ufullstendig»-markør, ingen grå placeholder som roper at noe mangler.

### Felles
- **Autosave** ved hvert feltbytte (samme krav som review).
- Sted fanges automatisk hvis mulig, ellers tomt — aldri blokkerende.

---

## 4. Bilde-håndtering

- Ett valgfritt bilde pr dag.
- Opplasting fra mobil (kamera eller bibliotek).
- Lagring: avklares med Claude Code ved bygging. Alternativer:
  - Railway volume / objektlagring (S3-kompatibel), URL i `journal_images.url`.
  - Unngå å lagre base64 direkte i Postgres — bruk fil-lagring + peker.
- Komprimer ved opplasting (mobilbilder er store; journalen skal være lett).

---

## 5. Visninger

### Daglig (hovedinngang)
Dagens entry, morgen-/kveldstilstand som i §3.

### Månedsoppslag (bygg denne — den er hele poenget med bilder)
- Rutenett av månedens dager. Hver dag viser bildet (eller en rolig placeholder hvis
  ingen bilde — *ikke* en «mangler»-markør).
- Visuell tidslinje for måneden. Dette er den sterkeste grunnen til å bygge dette selv
  fremfor å bruke 5 Minute Journal-appen: bildene og snuttene ligger i egen database,
  koblet til egen review-syklus.

---

## 6. Kobling til review (den ekte verdien)

Når månedsreview kjøres (`review-flow-spec.md` §4), skal wizarden kunne **vise månedens
journal-data som kontekst**:
- Journal-snutter (gratitude / went_well) fra perioden.
- Månedens bilder.

Konkret: når brukeren svarer på et rolle-`gap`-spørsmål, kan relevante journal-snutter
fra måneden vises diskret ved siden av — samme kontrast-mekanisme som «forrige svar» i
review. Dette gjør at den daglige innsatsen mater den månedlige refleksjonen i stedet for
å være en isolert dagbok.

Implementasjon: månedsreviewens periode (`periods`) overlapper journal-datoer på `date`.
Enkel join på datospenn.

---

## 7. Byggerekkefølge (foreslått)

1. Datamodell + migrasjoner (§2).
2. Daglig morgentilstand, mobil, med autosave + bilde (§3, §4).
3. Kveldstilstand som frivillig tilføyelse — verifiser at en kveld-løs dag ser komplett ut (§3).
4. Månedsoppslag med bilderutenett (§5).
5. **Bruk modulen i én ekte uke.** Stopp. Sjekk: føles kveld som press? Står bildet tomt?
   Juster terskelen før du går videre.
6. Kobling til månedsreview — vis journal-snutter som kontekst (§6).
7. Polering / estetikk — kun det som faktisk irriterte i steg 5.

---

## Åpne valg (ta med Claude Code, ikke nå)
- Bildelagring: Railway volume vs ekstern objektlagring.
- Stedsfangst: automatisk geolokasjon vs manuell fritekst (start manuelt — enklest, ikke blokkerende).
