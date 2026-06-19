# Livssystem – Design-brief (for Claude Design)

> Dette er et design-dokument, ikke en byggespec. Formålet er å definere hvordan systemet ser ut og føles, skjerm for skjerm. Den tekniske kravspecen finnes separat (livssystem-spec.md) og brukes senere i Claude Code.

---

## 1. Hva dette er

Et personlig, samlet livssystem for én bruker (Lars). Det håndterer oppgaver, prosjekter, milepæler og rutiner under fire livsdomener, pluss et personlig bibliotek av notater, sitater og bøker. Kjernen er **friksjonsfri fangst**: å legge inn noe – som regel via tale fra mobilen – skal ta sekunder.

**Primær kontekst: mobil.** Designes mobil-først, som en web-app lagret på iPhone-hjemskjerm. Desktop er sekundært (samme system, bredere layout), men designarbeidet starter på mobilskjerm.

---

## 2. Visuell retning

**Stemning:** Lyst, rent, skandinavisk-nøkternt. Mye luft. Rolig, ikke travelt. Skal føles som et verktøy man har lyst til å åpne om morgenen, ikke et kontrollpanel som stresser.

**Prinsipper:**
- Generøs whitespace. Innhold får puste.
- Få, tydelige typografiske nivåer. Rolig, lesbar sans-serif.
- Dempet, naturlig palett. Ingen sterke primærfarger som dominerer.
- Mykt avrundede kort, subtile skiller, lette skygger eller ingen.
- Lys modus som standard. (Mørk modus kan komme senere, ikke nødvendig i designrunden.)

**Domenefarger (diskret system):** De fire domenene markeres med hver sin dempede farge – brukt som en liten prikk eller tynn kantstripe på kort, ikke som flatefyll. Forslag til retning (Design justerer):
- **Meg** – rolig blågrå
- **Oss** – varm terrakotta/sand
- **Stall** – dempet grønn
- **Hest** – varm brun/okergul

Resten av grensesnittet holdes nøytralt (off-white bakgrunn, mørk grå tekst), slik at fargene kun fungerer som rask domene-gjenkjenning.

---

## 3. Informasjonstetthet

**Rolig inngang, tett i dybden.** "I dag"-skjermen skal være minimal og fokusert – kun det som betyr noe akkurat nå. Detaljskjermer (oppgaveliste, prosjekt) kan være mer informasjonstette. Roen ligger i inngangen.

---

## 4. Skjermer som skal designes

### 4.1 "I dag" (hjemskjerm – viktigst)
Den første skjermen hver morgen og navet for fangst. Skal være rolig.
- **Fangst-knapp**: alltid synlig og fremtredende (stor mikrofon-knapp, gjerne flytende/fast nederst). Dette er skjermens viktigste element.
- **Topp 3**: dagens tre viktigste oppgaver, store og tydelige, kan hakes av.
- **Dagens rutiner**: morgen/ettermiddag/kveld som en lett sjekkliste med streak-indikator.
- **Kalender i dag**: enkle oppføringer fra Google Calendar (read-only, diskret stil – tydelig at dette ikke redigeres her).
- **Det som haster**: kort liste over oppgaver med forfall i dag/forsinket.
- **Resurfacing**: ett sitat eller notat som roterer daglig – en rolig, inspirerende blokk, gjerne nederst.
- Sekundært (kan ligge lenger ned eller bak ett tapp): "slipping" (prosjekter ikke rørt på en stund), "til review".

Designutfordring: få alt dette til å føles rolig, ikke som en vat av ting. Bruk progressiv avsløring – vis det viktigste, la resten foldes ut.

### 4.2 Fangst-flyt (kjernen – design som sekvens av skjermbilder)
Tegn ut steg for steg:
1. **Hvile**: mikrofon-knappen i ro.
2. **Lytter**: tydelig opptaks-tilstand (puls/animasjon), enkelt å avbryte.
3. **Behandler**: kort tilstand mens AI tolker og ruter.
4. **Kvittering**: resultatet vises – "Lagt til: Bestille høy → Stall, fredag 14:00" – med mulighet til å redigere eller angre med ett tapp.
5. **Tekst-alternativ**: samme flyt, men med tekstfelt for når man ikke vil snakke.

Dette er det viktigste flyt-designet i hele systemet. Det skal føles umiddelbart og trygt: rask inn, men alltid synlig hvor ting havnet.

### 4.3 Oppgaver
- Liste sortert på forfall. Filtre: åpne/gjort/alle, etter domene/prosjekt.
- Hvert oppgavekort: tittel, domene-markør (farget prikk), forfall, prioritet, evt. prosjekt.
- Oppgave-detalj: tittel, notat (markdown), kobling til domene/prosjekt/milepæl, prioritet, påminnelse, tilbakevendende.

### 4.4 Prosjekter
- Oversikt: aktive prosjekter og løpende områder, gruppert per domene.
- Skille tydelig mellom **prosjekt** (har sluttdato, viser fremdrift) og **område** (løpende).
- Prosjekt-detalj: milepæler med visuell %-fremdrift, knyttede oppgaver, sjekklister, aktivitetslogg.

### 4.5 Rutiner
- Daglige rutiner med streak-teller og en liten fremdriftsgraf over tid.
- Tidsbegrensede streaks (f.eks. 30 dager) med tydelig nedtelling/fremdrift.
- Arkiv av fullførte streaks.

### 4.6 Bibliotek
- Tre innholdstyper med egne visninger: notater, sitater, bøker.
- Sitat-detalj: selve sitatet + flere "tanker" lagt til over tid (en slags trådet refleksjon).
- Bok-detalj: omslagsbilde, metadata (forfatter, status, rating), og tilknyttede høydepunkter/sitater.
- Tags og kilde som gjennomgående sorteringsmekanikk.

### 4.7 Innstillinger
- Integrasjonsstatus (Google Calendar, Pushover, AI) med tydelig "tilkoblet"-indikator.
- Kalender: siste sync, tving sync. Tidssone.

---

## 5. Domenestruktur (kontekst for designeren)
Fire faste livsdomener som alt henger under:
- **Meg** – personlig: helse, trening, rutiner, lesing, utvikling.
- **Oss** – familie og hjem (Lars + Tina).
- **Stall** – Stall Engås: rideskole, drift, kurs.
- **Hest** – egne hester: trening, konkurranse (Working Equitation), avl.

Rutiner og habits (inkl. styrketrening) er sin egen entitet, vanligvis under Meg – ikke et eget domene.

---

## 6. Hva designeren skal levere
- Mobil-skjermer for alle seksjonene over, "I dag" og fangst-flyten først og grundigst.
- Fangst-flyten som en komplett klikkbar/skjermbilde-sekvens.
- Et lite, konsistent designsystem: farger (inkl. de fire domenefargene), typografi, kort, knapper, ikoner.
- Sekundære desktop-varianter av nøkkelskjermene (valgfritt i første runde).

## 7. Den ene tingen som betyr mest
Fangst skal føles sømløs og trygg: sekunder inn, og alltid en synlig kvittering på hvor ting havnet. Hvis fangst-flyten ikke er lekker og rask, spiller resten av designet ingen rolle.
