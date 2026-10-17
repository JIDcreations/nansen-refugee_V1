# NANSEN website (V1) | briefing voor Claude Code

Klant: **NANSEN, the Belgian Refugee Council** (nansenrefugee.be)
Bureau: 2X8 (Jappa + Florian)
Assets: `./assets/OneDrive_1_15-10-2026/`

Lees dit volledig voor je begint. Alles wat hier staat is beslist, tenzij het onder **Open vragen** staat.

## 0. Stack V1: statisch prototype, later WordPress

- **V1 = HTML, CSS, vanilla JS.** Geen framework, geen CMS. Doel: design en structuur goedkeuren met de klant.
- **Na goedkeuring gaat het naar WordPress** (custom theme, CPT's, ACF, Polylang/WPML). Bouw V1 zo dat die overstap makkelijk is:
  - **Content in data, niet in HTML.** Publicaties, evenementen en thema's staan in JSON (`site/data/publicaties.json`, `evenementen.json`, `themas.json`), met dezelfde velden als de CPT's in sectie 5. Relaties via `id`/`slug`. Dit wordt later 1-op-1 het ACF-model en een importbestand.
  - **Templates als herbruikbare partials**: header, footer, lijstitem, kaart, filterbalk... Elk partial wordt later een WP template part. Geen copy-paste van markup tussen pagina's.
  - **Detailpagina's via één template per CPT** (bv. `publicatie.html?slug=...`, gevuld uit JSON), niet één HTML-bestand per publicatie.
  - **Filters en zoeken client-side in JS** op die JSON. Zelfde URL-parameters als later in WP (`?thema=sogi&type=nota`).
  - **Taal**: UI-strings in `site/i18n/nl.json`, `fr.json`, `en.json`. Contentvelden per taal (`titel: {nl, fr, en}`). Mappen `/nl/`, `/fr/`, `/en/` of een taalparameter, zolang de taalwissel op dezelfde pagina blijft.
  - **CSS met design tokens** (custom properties) en BEM-achtige klassen, zodat het theme ze kan overnemen.
- Gebruik de **/skills** (o.a. frontend-design) voor de designkwaliteit.

---

## 1. Context

NANSEN is een **juridisch expertisecentrum** rond internationale bescherming en staatloosheid. Opgericht in 2017 door advocaten en academici. Klein team, Brussel (Rue Émile Féron 153, 1060 Brussel). Partner van UNHCR.

Ze doen drie dingen tegelijk: individuele dossiers opvolgen, kennis bouwen (nota's, gidsen, praktijkfiches, casussen) en die kennis delen (vormingen, intervisies, beleidsdialoog).

**Doelpubliek van de site: juristen, advocaten, praktijkbeoefenaars.** Niet de vluchteling zelf als eerste lezer (die komt binnen via zijn advocaat of de pagina Bijstand).

### Belangrijk (van Florian)
Een stagiaire (IHECS) heeft al bijna de hele site ontworpen in Figma. De klant is daar tevreden mee, wij niet.
**We respecteren hun huisstijl, maar maken het dubbel zo goed.** De Figma is dus referentie voor kleur, logo en sfeer, niet voor layout of componenten.

### Toon
Serieus, rustig, betrouwbaar. Juridisch, maar modern. **Niet "full Harvey Specter"**: geen glanzend advocatenkantoor, geen marmer, geen stockfoto's van handdrukken. Dit is een ngo-expertisecentrum, menselijk en inhoudelijk.
Hun eigen baseline uit het jaarverslag: *"Achter elke procedure schuilt een mens."*

---

## 2. Doelen (in volgorde van belang)

1. **Informatie heel gestructureerd** weergeven
2. **Veel informatie** kunnen dragen zonder rommelig te worden
3. **Professioneel en betrouwbaar**
4. **Modern**
5. Juristen en advocaten **informeren**
6. Juristen en advocaten **aantrekken** (vormingen, samenwerking, doorverwijzing)

Denk: editoriaal, kennisplatform, archief. Referentie voor structuur en filters: https://cessmir.be/lid_type/doctoraatsonderzoekers/ en het "Over" dropdown met anchors op https://cessmir.be/over-cessmir/#missie-en-visie

---

## 3. Huisstijl

Bron: `assets/OneDrive_1_15-10-2026/Charte Graphique Nansen.pdf` (2 pagina's).
Pagina 1 is de **oude** stijl (zwart logo met portret Fridtjof Nansen). **Negeren.**
Pagina 2 is de **huidige** stijl (hoed + NANSEN wordmark). **Dit gebruiken.**

### Kleuren (pagina 2)
| Token | Hex | Gebruik |
|---|---|---|
| `--green-500` | `#778F7A` | secundair groen, tags, lijnen, hover |
| `--green-700` | `#5F7362` | **hoofdkleur**: header, footer, titels op licht, primaire knoppen |
| `--cream` | `#FAF0E6` | **achtergrond** |
| `--orange-600` | `#E27E27` | **accent**, spaarzaam: CTA, actieve staat, bladwijzer-icoon publicaties |
| `--orange-400` | `#FF9734` | hover van accent |

Aanvullen zelf (afgeleid, niet in charte): een donkere tekstkleur (bv. `#1F2620`, groen-zwart), een witte surface (`#FFFDF9`) voor kaarten op crème, een lijnkleur (`#5F7362` op lage opacity). Contrast nakijken: wit op `#778F7A` haalt **geen** AA voor kleine tekst, dus kleine tekst op groen altijd op `#5F7362` of donkerder. Oranje `#E27E27` niet als tekstkleur op crème voor body tekst.

**Regel: oranje is accent, geen vlakvulling.** In de Figma staan overal oranje knoppen; wij gebruiken oranje voor max 1 actie per scherm.

### Typografie
Charte zegt: **Helvetica World** (regular + bold), titelfont "Null" (niet ingevuld).
De Figma gebruikt een serif voor titels.
Onze keuze: **serif voor H1/H2** (editoriaal, juridisch gewicht) + **Helvetica-achtige sans voor alles daarnaast**. Voorstel:
- Titels: `Source Serif 4` (Google Fonts, gratis, goede FR-accenten)
- Body/UI: `"Helvetica Neue", Helvetica, Arial, sans-serif` als stack, of `Inter` als webfont als Helvetica World niet gelicentieerd is
Typografische schaal rustig en strak, ruime regelhoogte voor lange juridische tekst (body 17-18px, 1.6, max ~70 tekens per regel).

### Logo
`assets/.../Logo's/`
- `Grand logo vert + baseline` = hoed + NANSEN + "the Belgian Refugee Council" (1109x456 png)
- `Grand logo vert` / `blanc` = zonder baseline
- `Petit logo vert` / `blanc` = beeldmerk (448x448 png), voor favicon en mobiel
- `.ai` bestanden zijn vector: **exporteer naar SVG** (`.ai` is meestal PDF-compatibel: `pdftocairo -svg` of Inkscape). Gebruik SVG op de site, geen png.
- `Logo Nansen Définitif.pdf` is het oude logo, niet gebruiken.

### Wat we beter doen dan de Figma
Wat er in de IHECS-voorstellen zit en wat wij anders doen:
- Pilvormige header met afgeronde onderkant → **strakke header**, logo links, nav, zoek + taal rechts
- Overal grote afgeronde kaarten en schaduw → **kleine radius (2-4px) of geen**, lijnen en grid in plaats van boxen
- Homepage = drie foto-stroken met "En savoir plus" → **homepage toont echte inhoud**: laatste publicaties, komende evenementen, thema's
- Publicatielijst in 2 kolommen met afgekapte tekst → **lijst met duidelijke metadata** (type, datum, thema, taal) die scanbaar is
- Eén "Sélectionner une catégorie" dropdown → **echte filterbalk** (zie 6)
- Lorem ipsum overal → echte copy uit het jaarverslag
Behouden uit de Figma: kleurenpalet, het **oranje bladwijzer-icoon** bij publicaties (sterk detail, houden en verfijnen), footer met contactgegevens per dienst, UNHCR-logo, newsletter + klachtenbalk.

---

## 4. Sitemap en navigatie

Basis = het voorstel van de klant (`Voorstel navigatiebalk.docx`). De sitemap van de stagiaire (`Arborescence finale site NANSEN.png`) is verouderd, enkel als bron voor subpagina's.

```
Header:  [Logo]   NANSEN ▾   Thema's ▾   Diensten ▾   Kennis ▾        [Zoek] [NL|FR|EN] [Steun ons]

NANSEN ▾  (één pagina /nansen, dropdown = anchor links)
  Missie            /nansen#missie
  Aanpak            /nansen#aanpak          (interdisciplinariteit + 3 strategische doelstellingen)
  Team              /nansen#team
  Geschiedenis      /nansen#geschiedenis    (wie was Fridtjof Nansen, het Nansenpaspoort)
  Partners          /nansen#partners
  Jaarverslagen     /nansen#jaarverslagen
  Contact           /nansen#contact

Thema's ▾  (CPT Thematiek, menu wordt automatisch gevuld)
  Internationale bescherming
  Staatloosheid
  Foltering
  Detentie
  SOGI
  Alle thema's → /themas

Diensten ▾
  Juridische bijstand     /bijstand        (voor advocaten die een dossier willen voorleggen, ex "Votre dossier")
  Vormingen op maat       /vormingen

Kennis ▾  (klant noemt dit "Ressources")
  Publicaties                                /publicaties
  Evenementen, intervisies en archief        /evenementen

Steun ons (CTA, enige oranje knop in header)  /steun-ons
```

Klant had in de docx nog: Mission, Equipe, Contact onder NANSEN. De extra anchors (Aanpak, Geschiedenis, Partners, Jaarverslagen) zijn ons voorstel: bouw ze, maar maak de anchorlijst gemakkelijk aanpasbaar.

Dropdown-gedrag: hover + klik op desktop, accordion op mobiel. Anchor-links scrollen smooth, met `scroll-margin-top` voor de sticky header. Op /nansen zelf: een **sticky subnav** (of zijbalk op desktop) met dezelfde anchors die meelicht bij scrollen.

Footer (uit Figma, opgekuist):
- Contact per dienst: Algemeen info@nansenrefugee.be, Dossiers dossiers@nansenrefugee.be, Directie (directeur is sinds 2025 **Gert Bruininkx**, het Figma toont nog Julie Lejeune: niet overnemen, navragen welk adres)
- Adres
- Snelle links
- Partner: UNHCR-logo
- Newsletter inschrijven
- Klacht indienen (link naar klachtenpagina/formulier)
- Privacy: Data Protection Policy (PDF, EN)
- Socials (Facebook, LinkedIn)

---

## 5. Inhoudsmodel: 3 CPT's + relaties

Dit is het hart van de site. Werk zoals de exhibitions/works op elevator-antwerp.com: **alles linkt naar alles.**

### CPT `thematiek`
- Titel, korte intro (1-2 zinnen), uitgebreide tekst (flexibele blokken)
- Uitgelichte afbeelding (optioneel)
- Contactpersoon/expert binnen team (optioneel, relatie naar teamlid)
- **Pagina toont automatisch**: alle publicaties met dit thema + alle evenementen met dit thema (komend en archief apart)

### CPT `publicatie`
- Titel, publicatiedatum, samenvatting (voor lijsten)
- **Type** (taxonomie): Nota, Casus (NANSEN Profiel), Bronnencompilatie, Praktijkfiche, Gids, Beleidsnota/Aanbeveling, Jaarverslag. Uitbreidbaar.
- **Thema's** (relatie naar `thematiek`, meerdere)
- **Landen** (taxonomie, bv. Congo, Afghanistan, Palestina, uit Figma-voorbeelden)
- **Taal van het document** (NL / FR / EN, meerdere). Belangrijk: veel publicaties bestaan **enkel in het Frans**. Dit los van de taal van de site.
- Bijlagen: 1+ PDF's (met label + taal per bestand)
- Externe links / "Lees ook" (relatie naar andere publicaties)
- Gelinkte evenementen (relatie, bidirectioneel)
- Auteur(s) (optioneel)
- Inhoud via **flexibele blokken** (zie 7)

### CPT `evenement`
- Titel, datum(s) + uur, locatie (fysiek / online / hybride), adres
- **Type** (taxonomie): Intervisie, Vorming, Studiedag/Conferentie, Legal clinic, Andere
- Doelpubliek (advocaten, ngo, asielinstanties...)
- Partners/co-organisator (bv. ECRE, UCLouvain, Orde van Vlaamse Balies)
- Inschrijvingslink of status (open / volzet / afgelopen)
- Thema's (relatie) + gelinkte publicaties (relatie)
- Na afloop: verslag, slides, foto's → wordt automatisch **archief**
- Status komend/voorbij **automatisch op datum**, niet manueel

### Relaties (verplicht bidirectioneel)
- Thema-pagina "Gender/SOGI" → lijst publicaties SOGI + evenementen SOGI
- Publicatie → klikbare thema-tags → naar thema-pagina
- Evenement → toont alle gelinkte publicaties en thema's
- Publicatie ↔ evenement: één keer koppelen, aan beide kanten zichtbaar

Elke detailpagina eindigt met een blok **"Gerelateerd"**: zelfde thema, andere CPT.

---

## 6. Overzichtspagina's en filters

Referentie: cessmir.be. Per CPT een overzicht (`/publicaties`, `/evenementen`, `/themas`).

- Filters: **3 tot 7**, exacte lijst volgt nog van de klant. Bouw het filtersysteem **generiek** (config per CPT, taxonomie of meta-veld = filter), zodat filters toevoegen geen nieuwe code vraagt.
- Placeholder-filters om mee te starten:
  - Publicaties: Thema, Type, Land, Taal document, Jaar
  - Evenementen: Thema, Type, Komend/Archief, Jaar
- Filters combineerbaar, staan **in de URL** (`?thema=sogi&type=nota`) zodat je een gefilterde lijst kan delen
- Teller per resultaat ("24 publicaties"), actieve filters als chips met "wis alles"
- Sortering: nieuwste eerst (default), oudste, A-Z
- Paginering of "Meer laden" (geen oneindige scroll; juristen willen terug kunnen)
- Lijstweergave standaard (dicht, scanbaar): bladwijzer-icoon, type-label, titel, datum, thema-tags, taal-badges. Optioneel kaartweergave voor evenementen.
- Leeg resultaat: duidelijke melding + filters wissen

---

## 7. Publicaties: layout op afwisseling voorzien

Een publicatie kan een korte nota zijn, een uitgewerkte casus, of een lijst bronnen. De template moet alles dragen. Bouw met **flexibele contentblokken**:

- Tekst (rich text, met tussentitels die een **automatische inhoudstafel** vullen bij lange teksten)
- Kernpunten / samenvatting in een kader
- Citaat / uittreksel uit rechtspraak
- Casus-blok: profiel (land, situatie), feiten, juridische vraag, argumentatie, uitkomst
- Bronnenlijst: titel, type (rechtspraak, wetgeving, rapport...), link, datum
- Downloadblok (PDF's met taal en bestandsgrootte)
- Afbeelding / figuur met bijschrift
- Accordion (voor lange bronlijsten of FAQ)

Vaste elementen op elke publicatie: breadcrumb, type + datum + taal bovenaan, thema-tags, download, "Citeer deze publicatie" (kopieer referentie), gerelateerd.

Leesbreedte smal voor tekst, metadata in een zijkolom op desktop (sticky), onder de titel op mobiel.

---

## 8. Zoekfunctie

- Zoekicoon in de header → zoekveld (overlay of uitklappend)
- Resultatenpagina `/zoeken?q=gender` **gegroepeerd per type**: Thema's, Publicaties, Evenementen, Pagina's
- Elke groep met teller, top 3-5 resultaten, "Toon alle X publicaties" (→ gefilterd overzicht)
- Tabs bovenaan om op één type te focussen
- Zoekt in titel, samenvatting, inhoud én taxonomieën (zoek "gender" vindt ook alles met thema SOGI: voorzie synoniemen/trefwoorden-veld per thema)
- Zoekterm highlighten in resultaten
- Zoekt binnen de actieve taal, met optie "ook in andere talen zoeken"

---

## 9. Meertaligheid

- **NL, FR, EN.** Standaardtaal navragen (zie Open vragen), vermoedelijk FR of NL.
- URL-prefix per taal: `/nl/`, `/fr/`, `/en/`, ook vertaalde slugs (`/nl/publicaties`, `/fr/publications`, `/en/publications`)
- Taalwissel in header gaat naar **dezelfde pagina** in de andere taal, niet naar home
- Ontbreekt een vertaling: toon de pagina in de beschikbare taal met een melding ("Deze publicatie is enkel beschikbaar in het Frans"), geen 404
- Alle UI-strings (knoppen, filters, labels, datums) in vertaalbestanden, niets hardcoded
- Datumnotatie per taal
- `hreflang` tags

---

## 10. Pagina's (templates)

| Pagina | Inhoud |
|---|---|
| **Home** | **Hub, geen scroll-verhaal.** Max ongeveer 2 schermhoogtes. Eén regel positionering ("Juridisch expertisecentrum inzake internationale bescherming en staatloosheid") + zoekveld. Dan: thema's (5 tegels), laatste publicaties (lijst van 4-6), komende evenementen. Geen pijlers, cijferblokken of storytelling-secties (die horen op /nansen). |
| **NANSEN** (/nansen) | Eén lange pagina met anchor-secties, zie 4 |
| **Thema-overzicht** | 5 thema's met intro + aantal publicaties/evenementen |
| **Thema-detail** | Intro, tekst, publicaties, evenementen, contactpersoon |
| **Publicaties** | Overzicht + filters |
| **Publicatie-detail** | Flexibele layout, zie 7 |
| **Evenementen** | Komend bovenaan, archief eronder, filters |
| **Evenement-detail** | Praktisch blok (wanneer, waar, voor wie, inschrijven), beschrijving, gelinkte publicaties/thema's, na afloop: materiaal |
| **Bijstand** | Voor advocaten: wanneer kan NANSEN helpen, welke dossiers, hoe aanmelden, wat bezorgen. Duidelijke stappen. Contact dossiers@ |
| **Vormingen op maat** | Aanbod, voor wie, formats, aanvraagformulier |
| **Steun ons** | Donaties |
| **Zoeken** | Zie 8 |
| **Klacht** | Formulier of uitleg klachtenprocedure |
| **Newsletter** | Inschrijving |
| **404**, **Privacy** | |

---

## 11. Componenten

Header (sticky, krimpt bij scroll), dropdown met anchors, mega-dropdown voor Thema's (optioneel), mobiel menu, taalwissel, zoekoverlay, breadcrumb, filterbalk + chips, lijstitem publicatie (met bladwijzer), lijstitem evenement (met datumblok), thematiek-tegel, tag/badge (thema, type, taal), downloadknop, inhoudstafel, accordion, casus-blok, citaatblok, kernpunten-kader, CTA-banner, newsletter-blok, klachtenbalk, teamkaart, footer.

Interactie en motion: subtiel. Geen parallax, geen grote animaties. Hover-staten, focus-staten (toegankelijkheid), smooth anchor scroll.

---

## 12. Kwaliteitseisen

- **Toegankelijkheid WCAG 2.1 AA** (publiek met juristen, overheid en mensen met beperkte taalkennis): contrast, keyboard-navigatie in dropdowns en filters, focus zichtbaar, alt-teksten, semantische headings
- Mobile first, maar desktop is het hoofdgebruik (juristen achter een bureau)
- Snel: afbeeldingen geoptimaliseerd (de foto's in assets zijn 2-4 MB, **altijd comprimeren en in meerdere formaten** aanbieden, WebP/AVIF)
- Print-stylesheet voor publicaties (juristen printen)
- SEO: meta per pagina en per taal, Open Graph, structured data voor Event en Article
- Privacy/GDPR: geen trackers zonder consent, sensibele context

---

## 13. Assets: wat er is

```
assets/OneDrive_1_15-10-2026/
├── Charte Graphique Nansen.pdf        p.2 = huidige huisstijl
├── Voorstel navigatiebalk.docx        nav-voorstel klant (= basis sectie 4)
├── Logo's/                            ai + png, groen en wit, groot/klein, met/zonder baseline
├── Foto's/
│   ├── Team/                          3 WhatsApp-foto's (lage kwaliteit, bruikbaar voor team-sectie)
│   ├── Vormingen/                     10 foto's van vormingen/presentaties
│   └── Andere/                        7 foto's (o.a. historisch/archief Nansenpaspoort), recadré.jpg
├── IHECS website voorstel figma/      stagiaire-ontwerp als PDF (desktop + PHONE versies)
│   ├── Home Page V2, Notre mission, Votre dossier V2, Publications, Publications _ Congo (zoekresultaat)
│   ├── Victime de torture, Apatrides (thema-pagina's), Formations, En savoir plus, Contact
│   └── Arborescence finale site NANSEN.png   oude sitemap
└── Jaarverslag/                       2025 in NL, FR en EN (PDF)
```

**Copy-bron:** het jaarverslag 2025 bestaat in de 3 talen. Gebruik het voor de teksten van NANSEN (missie, aanpak, 3 strategische doelstellingen), de 5 thema-pagina's (Detentie, SOGI, Staatloosheid, Foltering, Interdisciplinariteit) en voorbeeldpublicaties/evenementen voor de demo-content. Gebruik **geen lorem ipsum**.

Voorbeeldcontent uit Figma en jaarverslag om de CPT's mee te vullen:
- Publicatie: "Droits et statut des enfants mineurs d'origine palestinienne nés en Belgique" (11/09/2024, Apatride, Palestine)
- Publicatie: "Demande ultérieure jeune homme afghan occidentalisé: évaluation du besoin de protection" (30/08/2024, casus)
- Publicatie: "Femmes congolaises victimes de violences sexuelles (RDC)" (06/12/2022, NANSEN Profil, Congo, Femmes, LGBTQIA+)
- Publicaties 2025 rond detentie: nota asielprocedure aan de grens (FR), nota effectiviteit beroep tegen refoulement (FR), samenvattende nota, uitgebreide case study (FR)
- Praktijkfiches SOGI (NL/FR/EN): procedure + bewijsvoering
- Gids staatloosheid in België, praktische gids interdisciplinariteit
- Project/netwerk: WAWY (We Are With You), LGBTQIA+ (2023-2026)
- Evenement: intervisie non-refoulement aan de grens met ECRE (60+ deelnemers)
- Evenement: sessie non-refoulement, opleiding vluchtelingen- en migratierecht UCLouvain
- Evenement: online vormingsmodule staatloosheid, Orde van Vlaamse Balies

---

## 14. Open vragen (niet zelf beslissen, placeholder voorzien)

1. **WordPress-fase** (na V1): Polylang of WPML, FacetWP of eigen filter-query. Beslissen bij de overstap.
2. Exacte **filters** per overzicht (klant levert 3-7)
3. **Standaardtaal** en domeinstructuur
4. Welk e-mailadres bij **Directie** (Julie Lejeune is vertrokken, Gert Bruininkx is directeur)
5. **Helvetica World** gelicentieerd als webfont?
6. Donaties: externe tool of eigen pagina met rekeningnummer?
7. Newsletter-tool (Mailchimp, Brevo...)?
8. Klachten: formulier of mailadres?
9. Inschrijving evenementen: extern (Eventbrite, Forms) of eigen formulier?
10. Bestaande content migreren van de huidige nansenrefugee.be? Hoeveel publicaties?

---

## 15. Werkvolgorde voor Claude Code

1. Structuur opzetten in `site/` (zie sectie 0), JSON-data met demo-content, repo in `2x8-studio`
2. Design tokens (kleuren, type, spacing) + basiscomponenten, één stijlpagina om te reviewen
3. Datamodel: 3 CPT's, taxonomieën, relaties, meertaligheid
4. Templates: overzicht + detail per CPT, met demo-content uit sectie 13
5. Filters (generiek) en zoekpagina
6. Header/nav met dropdowns en anchors, /nansen pagina
7. Home en overige pagina's
8. Toegankelijkheid, performance, print, SEO nakijken
9. **Niet pushen naar main zonder review**: repo's in 2x8-studio staan live gekoppeld aan Hostinger
