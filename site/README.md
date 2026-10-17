# NANSEN website V1 (statisch prototype)

HTML, CSS en vanilla JS. Doel: design en structuur laten goedkeuren door NANSEN. Daarna gaat het naar WordPress (zie CLAUDE.md §0).

## Lokaal bekijken

De pagina's laden hun inhoud uit JSON, dus ze moeten via een lokale server draaien (niet via `file://`):

```bash
cd site
python3 -m http.server 4173
# of: npx serve .
```

Open http://127.0.0.1:4173. De stijlgids staat op `/stijlgids.html`.

## Structuur

```
site/
├── data/                 Inhoud (later 1-op-1 ACF-velden + importbestand)
│   ├── themas.json         CPT thematiek
│   ├── publicaties.json    CPT publicatie (flexibele blokken in `inhoud`)
│   ├── evenementen.json    CPT evenement
│   ├── taxonomieen.json    types, landen, doelpubliek, formaat
│   ├── team.json, paginas.json
├── i18n/nl.json fr.json en.json   UI-strings (niets hardcoded)
├── assets/
│   ├── css/tokens.css      design tokens (kleuren, type, ruimte)
│   ├── css/main.css        componenten, BEM-achtig
│   ├── css/print.css       printversie publicaties
│   ├── js/core.js          taal, data laden, relaties (bidirectioneel), datums
│   ├── js/partials.js      header, footer, lijstitems, blokken = later WP template parts
│   ├── js/filters.js       generiek filtersysteem (config per overzicht)
│   ├── js/pages.js         één controller per template
│   ├── img/                WebP 640/1280/1920 + JPG fallback (duotone op de z/w-reeks)
│   ├── logo/               SVG uit de .ai-bestanden, kleur via currentColor
│   └── docs/               jaarverslagen 2025 (NL/FR/EN)
├── index.html                       home (hub)
├── themas.html / thema.html?slug=   thema-overzicht / detail
├── publicaties.html / publicatie.html?slug=
├── evenementen.html / evenement.html?slug=
├── zoeken.html?q=
├── nansen.html                      één pagina met anchors (#missie … #contact)
└── bijstand, vormingen, steun-ons, klacht, nieuwsbrief, privacy, 404, stijlgids
```

## Afspraken in de code

- **Meertalige velden**: `{ "nl": "...", "fr": "...", "en": "..." }`. Ontbreekt de actieve taal, dan valt de site terug op een andere taal en toont ze een melding. Titels van publicaties blijven in de taal van het document (met `lang`-attribuut).
- **Taal** via `?lang=fr|en` (NL is standaard, open vraag 3). Elke interne link houdt de taal vast; de taalwissel blijft op dezelfde pagina. In WordPress wordt dit `/fr/`, `/en/` met vertaalde slugs.
- **Relaties** worden één keer gelegd (publicatie → evenement of omgekeerd) en `core.js` toont ze aan beide kanten. Idem voor "Lees ook".
- **Status van evenementen** (komend/afgelopen) volgt automatisch uit de datum.
- **Filters**: een filter toevoegen = één object toevoegen in de `FILTERCONFIG` in `pages.js`. Filterstaat staat in de URL (`?thema=sogi,detentie&type=nota&taal=fr`), dus gefilterde lijsten zijn deelbaar.
- **Zoeken** zoekt in titel, samenvatting, inhoud, landen en thema-trefwoorden (synoniemen: "gender" vindt SOGI). Standaard enkel documenten in de actieve taal, met optie "ook in andere talen".

## Demo-inhoud: wat echt is en wat niet

- Teksten over NANSEN, de thema's, cijfers, de casussen Said/Omar/Carmen en de 2025-activiteiten komen uit het **jaarverslag 2025**.
- Publicatietitels uit de Figma (Palestijnse kinderen, Afghaanse man, Congolese vrouwen) zijn echt; **de exacte datums van de 2025-publicaties, bestandsgroottes en de inhoud van de flexibele blokken zijn demo**.
- **De vier komende evenementen (nov 2026 – jan 2027) zijn verzonnen** om de "komend"-weergave te tonen.
- Rechtspraak en wetgeving in de bronnenlijsten zijn echte referenties, maar als voorbeeld gekozen.
- Oranje gestippelde kaders (`.todo`) markeren inhoud die NANSEN nog moet aanleveren.

## Nog niet in V1

- Echte formulierverwerking (vormingen, klacht, nieuwsbrief): de formulieren tonen een demo-melding.
- Officieel UNHCR-logo en partnerlogo's (niet in de assets).
- Server-side `hreflang`/meta: in het prototype gezet via JS, in WordPress via het theme en Polylang/WPML.
