/* =========================================================
   Paginacontrollers. Eén template per CPT (overzicht + detail).
   In WordPress: archive-publicatie.php, single-publicatie.php, ...
   ========================================================= */
import {
  t, tr, trInfo, url, param, lang, esc, data, theme, pub, event, person, term, themeName, langName,
  fmtDate, fmtShort, fmtTime, parseDate, isPast, eventStatus, pubsSorted, pubsForTheme, eventsForTheme,
  eventsForPub, pubsForEvent, relatedPubs, upcomingEvents, pastEvents, picture, setMeta
} from './core.js';
import {
  icon, breadcrumb, pubItem, eventItem, themeTile, themeTags, countryTags, langBadges, pubTitle,
  downloads, notice, blocks, toc, searchForm, statusBadge
} from './partials.js';
import { createListing } from './filters.js';

const main = () => document.getElementById('main');
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const allLangs = (f) => (f && typeof f === 'object' ? Object.values(f).join(' ') : f || '');
const blockText = (list = []) => list.map((b) => [b.html, b.tekst, b.titel, (b.punten || []).join(' '), (b.stappen || []).map((s) => s.tekst).join(' '), (b.items || []).map((i) => i.titel || i.vraag).join(' ')].join(' ')).join(' ').replace(/<[^>]+>/g, ' ');

function notFound() {
  main().innerHTML = `<div class="wrap section"><h1>404</h1><p class="lead">${t('pages.notFound')}</p><p><a href="${url('index.html')}">${t('nav.home')}</a></p></div>`;
}

/* ---------------- Home: hub, geen scroll-verhaal ---------------- */
async function home() {
  const latest = pubsSorted().slice(0, 5);
  const upcoming = upcomingEvents().slice(0, 3);
  setMeta({ title: t('home.title'), description: t('home.title') });
  document.title = 'NANSEN | The Belgian Refugee Council';

  main().innerHTML = `
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-text">
        <h1>${t('home.title')}</h1>
        <div class="hero-search">${searchForm('home')}</div>
        <p class="hero-aside">${t('home.lawyer')} <a href="${url('bijstand.html')}">${t('home.lawyerLink')}</a></p>
      </div>
      <figure class="hero-photo">
        ${picture('grens-hek', 'Omheining met prikkeldraad rond een terrein aan de grens, in zwart-wit', { sizes: '(min-width: 64em) 36vw, 100vw', eager: true })}
        <figcaption><blockquote lang="${lang}">${t('home.quote')}</blockquote><p>${t('home.quoteSrc')}</p></figcaption>
      </figure>
    </div>
    <div class="wrap">
      <nav class="theme-index" aria-label="${t('home.themes')}">
        <ul role="list">${data().themas.map((th) => `<li><a href="${url('thema.html', { slug: th.slug })}"><span>${esc(themeName(th))}</span><small>${t('theme.countPub', { n: pubsForTheme(th.slug).length })}</small></a></li>`).join('')}</ul>
      </nav>
    </div>
  </section>

  <section class="section">
    <div class="wrap home-columns">
      <div>
        <header class="section-head"><h2>${t('home.latest')}</h2><a class="more" href="${url('publicaties.html')}">${t('home.allPubs')}</a></header>
        <ul class="register" role="list">${latest.map((p) => pubItem(p)).join('')}</ul>
      </div>
      <div>
        <header class="section-head"><h2>${t('home.upcoming')}</h2><a class="more" href="${url('evenementen.html')}">${t('home.allEvents')}</a></header>
        ${upcoming.length ? `<ul class="event-list event-list--narrow" role="list">${upcoming.map((e) => eventItem(e)).join('')}</ul>` : `<p class="muted">${t('home.noUpcoming')}</p>`}
      </div>
    </div>
  </section>`;
}

/* ---------------- Thema-overzicht ---------------- */
async function themas() {
  setMeta({ title: t('pages.themasTitle'), description: t('pages.themasLead') });
  main().innerHTML = `
  <div class="wrap">${breadcrumb([{ label: t('pages.themasTitle') }])}</div>
  <header class="page-head"><div class="wrap"><h1>${t('pages.themasTitle')}</h1><p class="lead">${t('pages.themasLead')}</p></div></header>
  <section class="wrap" style="padding-bottom:var(--s-9)">
    <ul class="theme-rows" role="list">${data().themas.map((th) => {
      const pubs = pubsForTheme(th.slug), latestPub = pubs.find((p) => p.type !== 'jaarverslag'), evs = eventsForTheme(th.slug), next = evs.filter((e) => !isPast(e)).sort((a, b) => a.start.localeCompare(b.start))[0];
      return `<li class="theme-row">
        <a class="theme-row-media" href="${url('thema.html', { slug: th.slug })}" tabindex="-1" aria-hidden="true">${picture(th.afbeelding, '', { sizes: '(min-width: 64em) 22rem, 100vw', widths: [640, 1280] })}</a>
        <div class="theme-row-body">
          <h2><a href="${url('thema.html', { slug: th.slug })}">${esc(themeName(th))}</a></h2>
          ${th.naamLang ? `<p class="muted small mb-0">${esc(tr(th.naamLang))}</p>` : ''}
          <p>${esc(tr(th.intro))}</p>
          <p class="theme-row-counts"><a href="${url('publicaties.html', { thema: th.slug })}">${t('theme.countPub', { n: pubs.length })}</a><a href="${url('evenementen.html', { thema: th.slug })}">${t('theme.countEv', { n: evs.length })}</a></p>
        </div>
        <div class="theme-row-latest">
          ${latestPub ? `<p class="label">${t('home.latest')}</p><a href="${url('publicatie.html', { slug: latestPub.slug })}"${pubTitle(latestPub).attr}>${esc(pubTitle(latestPub).text)}</a>` : ''}
          ${next ? `<p class="label mt-5">${t('theme.upcoming')}</p><a href="${url('evenement.html', { slug: next.slug })}">${esc(tr(next.titel))}</a><br><span class="small muted">${fmtDate(next.start)}</span>` : ''}
        </div>
      </li>`;
    }).join('')}</ul>
  </section>`;
}

/* ---------------- Thema-detail ---------------- */
async function thema() {
  const th = theme(param('slug'));
  if (!th) return notFound();
  const pubs = pubsForTheme(th.slug);
  const evs = eventsForTheme(th.slug);
  const up = evs.filter((e) => !isPast(e)).sort((a, b) => a.start.localeCompare(b.start));
  const past = evs.filter(isPast).sort((a, b) => b.start.localeCompare(a.start));
  const body = trInfo(th.inhoud);
  const contact = th.contactpersoon && person(th.contactpersoon);
  setMeta({ title: themeName(th), description: tr(th.kort) });

  main().innerHTML = `
  <div class="wrap">${breadcrumb([{ label: t('pages.themasTitle'), href: url('themas.html') }, { label: themeName(th) }])}</div>
  <header class="theme-head">
    <div class="wrap theme-head-grid">
      <div>
        <p class="type-label">${t('types.theme')}</p>
        <h1>${esc(themeName(th))}</h1>
        ${th.naamLang ? `<p class="muted">${esc(tr(th.naamLang))}</p>` : ''}
        <p class="lead">${esc(tr(th.intro))}</p>
        <p class="theme-jump"><a href="#publicaties">${t('theme.countPub', { n: pubs.length })}</a><a href="#evenementen">${t('theme.countEv', { n: evs.length })}</a></p>
      </div>
      ${picture(th.afbeelding, '', { cls: 'theme-head-photo', sizes: '(min-width: 64em) 40vw, 100vw', eager: true })}
    </div>
  </header>

  <div class="wrap detail detail--theme">
    <div class="detail-main" data-translation-notice>
      ${body.fallback ? notice(t('translationMissing')) : ''}
      <div class="blocks">${blocks(body.value)}</div>
    </div>
    <div class="detail-aside">
      <div class="meta-card">
        <dl>
          <div><dt>${t('theme.contact')}</dt><dd>${contact ? `<strong>${esc(contact.naam)}</strong><br>${esc(tr(contact.functie))}` : `NANSEN`}<br><a href="mailto:info@nansenrefugee.be">info@nansenrefugee.be</a></dd></div>
        </dl>
        <hr>
        <a class="btn btn--primary" href="${url('bijstand.html')}">${t('services.bijstand')}</a>
      </div>
    </div>
  </div>

  <section class="section section--band" id="publicaties">
    <div class="wrap">
      <header class="section-head"><h2>${t('theme.pubs')}</h2><a class="more" href="${url('publicaties.html', { thema: th.slug })}">${t('theme.allPubs', { t: themeName(th) })} (${pubs.length})</a></header>
      <ul class="register" role="list">${pubs.slice(0, 6).map((p) => pubItem(p)).join('')}</ul>
    </div>
  </section>

  <section class="section" id="evenementen">
    <div class="wrap split split--even">
      <div>
        <h2>${t('theme.upcoming')}</h2>
        ${up.length ? `<ul class="event-list" role="list">${up.map((e) => eventItem(e)).join('')}</ul>` : `<p class="muted">${t('theme.noUpcoming')}</p>`}
      </div>
      <div>
        <h2>${t('theme.archive')}</h2>
        ${past.length ? `<ul class="event-list" role="list">${past.map((e) => eventItem(e)).join('')}</ul>` : ''}
      </div>
    </div>
  </section>`;
}

/* ---------------- Facet-helpers (gedeeld) ---------------- */
const themeFacet = () => ({ key: 'thema', label: t('filters.theme'), get: (x) => x.themas, options: () => data().themas.map((th) => ({ value: th.slug, label: themeName(th) })) });
const taxFacet = (key, group, label, get, opts = {}) => ({ key, label, get, options: () => Object.keys(data().taxonomieen[group]).map((k) => ({ value: k, label: term(group, k) })), ...opts });
const yearFacet = (get, items) => ({ key: 'jaar', label: t('filters.year'), get: (x) => [get(x).slice(0, 4)], options: () => [...new Set(items.map((x) => get(x).slice(0, 4)))].sort().reverse().map((y) => ({ value: y, label: y })), collapseAfter: 5 });

/* ---------------- Publicaties ---------------- */
async function publicaties() {
  const items = data().publicaties;
  setMeta({ title: t('pages.pubsTitle'), description: t('pages.pubsLead') });
  main().innerHTML = `
  <div class="wrap">${breadcrumb([{ label: t('nav.knowledge') }, { label: t('pages.pubsTitle') }])}</div>
  <header class="page-head"><div class="wrap"><h1>${t('pages.pubsTitle')}</h1><p class="lead">${t('pages.pubsLead')}</p></div></header>
  <div class="wrap" style="padding-bottom:var(--s-9)" id="listing"></div>`;

  /* FILTERCONFIG publicaties. Klant levert de definitieve 3–7 filters (open vraag 2). */
  createListing({
    id: 'pubs',
    root: document.getElementById('listing'),
    items,
    listClass: 'register',
    countLabel: [t('results.pub1'), t('results.pubN')],
    pageSize: 8,
    facets: [
      themeFacet(),
      taxFacet('type', 'publicatieType', t('filters.type'), (p) => [p.type]),
      taxFacet('land', 'land', t('filters.country'), (p) => p.landen, { collapseAfter: 5 }),
      { key: 'taal', label: t('filters.docLang'), get: (p) => p.documentTalen, options: () => ['nl', 'fr', 'en'].map((l) => ({ value: l, label: langName(l) })) },
      yearFacet((p) => p.datum, items)
    ],
    sorts: [
      { key: 'newest', fn: (a, b) => b.datum.localeCompare(a.datum) },
      { key: 'oldest', fn: (a, b) => a.datum.localeCompare(b.datum) },
      { key: 'az', fn: (a, b) => tr(a.titel).localeCompare(tr(b.titel), lang) }
    ],
    defaultSort: 'newest',
    searchText: (p) => [allLangs(p.titel), allLangs(p.samenvatting), p.landen.map((k) => term('land', k)).join(' '), p.themas.map((s) => themeName(theme(s))).join(' ')].join(' '),
    render: (p, o) => pubItem(p, o)
  });
}

/* ---------------- Publicatie-detail ---------------- */
async function publicatie() {
  const p = pub(param('slug'));
  if (!p) return notFound();
  const ti = pubTitle(p);
  const content = trInfo(p.inhoud);
  const evs = eventsForPub(p.slug);
  const readAlso = relatedPubs(p.slug);
  const docOnly = !p.documentTalen.includes(lang);
  const pageUrl = location.href.split('#')[0];
  const ref = `NANSEN, “${ti.text}”, ${term('publicatieType', p.type)}, ${fmtDate(p.datum)}. ${pageUrl}`;

  setMeta({
    title: ti.text, description: tr(p.samenvatting), type: 'article',
    jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: ti.text, datePublished: p.datum, inLanguage: p.documentTalen, about: p.themas.map((s) => themeName(theme(s))), publisher: { '@type': 'Organization', name: 'NANSEN, the Belgian Refugee Council' } }
  });

  // Gerelateerd: zelfde thema, andere CPT + andere publicaties
  const relEvents = data().evenementen.filter((e) => e.themas.some((s) => p.themas.includes(s)) && !evs.includes(e)).sort((a, b) => b.start.localeCompare(a.start)).slice(0, 3);
  const relPubs = pubsSorted().filter((x) => x !== p && !readAlso.includes(x) && x.themas.some((s) => p.themas.includes(s))).slice(0, 4);

  main().innerHTML = `
  <div class="wrap">${breadcrumb([{ label: t('knowledge.pubs'), href: url('publicaties.html') }, { label: term('publicatieType', p.type), href: url('publicaties.html', { type: p.type }) }, { label: ti.text.length > 60 ? `${ti.text.slice(0, 58)}…` : ti.text }])}</div>
  <article class="wrap">
    <header class="doc-head">
      <span class="ribbon-big" aria-hidden="true">${icon.ribbon}</span>
      <p class="doc-kicker"><a class="type-label" href="${url('publicaties.html', { type: p.type })}">${esc(term('publicatieType', p.type))}</a><time datetime="${p.datum}">${fmtDate(p.datum)}</time>${langBadges(p.documentTalen)}</p>
      <h1${ti.attr}>${esc(ti.text)}</h1>
      <p class="lead">${esc(tr(p.samenvatting))}</p>
      <div class="mt-5"><p class="label mb-2">${t('meta.themes')}</p>${themeTags(p.themas)}</div>
    </header>

    <div class="detail">
      <div class="detail-main" data-translation-notice>
        ${docOnly ? notice(t('docOnlyIn', { l: p.documentTalen.map(langName).join(', ') })) : ''}
        ${content.fallback ? notice(t('translationMissing')) : ''}
        ${toc(content.value, { inline: true })}
        <div class="blocks" id="doc-blocks">
          ${blocks(content.value)}
          <h2 id="download">${t('meta.download')}</h2>
          ${downloads(p.bijlagen)}
        </div>
      </div>

      <div class="detail-aside">
        <div class="meta-card">
          <dl>
            <div><dt>${t('meta.type')}</dt><dd>${esc(term('publicatieType', p.type))}</dd></div>
            <div><dt>${t('meta.date')}</dt><dd><time datetime="${p.datum}">${fmtDate(p.datum)}</time></dd></div>
            <div><dt>${t('meta.docLang')}</dt><dd>${langBadges(p.documentTalen)}</dd></div>
            ${p.landen.length ? `<div><dt>${t('meta.countries')}</dt><dd>${countryTags(p.landen)}</dd></div>` : ''}
            ${p.auteurs?.length ? `<div><dt>${t('meta.authors')}</dt><dd>${esc(p.auteurs.join(', '))}</dd></div>` : ''}
          </dl>
          <hr>
          <div class="meta-actions">
            <a class="btn btn--primary" href="#download">${icon.download}${t('meta.download')}</a>
            <button class="btn btn--secondary" type="button" data-cite>${icon.copy}<span>${t('meta.cite')}</span></button>
            <button class="btn btn--secondary" type="button" onclick="window.print()">${icon.print}${t('meta.print')}</button>
          </div>
          <div class="cite-box mt-5" hidden data-citebox>
            <label class="label" for="cite-ref">${t('meta.cite')}</label>
            <textarea class="field" id="cite-ref" readonly>${esc(ref)}</textarea>
            <p class="form-note" role="status" data-cite-status></p>
          </div>
        </div>
        ${toc(content.value) ? `<div class="mt-6" data-scrollspy>${toc(content.value)}</div>` : ''}
      </div>
    </div>
  </article>

  ${(evs.length || readAlso.length || relEvents.length || relPubs.length) ? `
  <section class="related" aria-labelledby="rel-h">
    <div class="wrap">
      <h2 id="rel-h">${t('meta.related')}</h2>
      <div class="related-grid">
        <div>
          ${(readAlso.length || relPubs.length) ? `<h3>${t('types.publications')}</h3><ul class="register register--compact" role="list">${[...readAlso, ...relPubs].map((x) => pubItem(x, { headingLevel: 4, compact: true })).join('')}</ul>` : ''}
        </div>
        <div>
          ${(evs.length || relEvents.length) ? `<h3>${t('types.events')}</h3><ul class="event-list" role="list">${[...evs, ...relEvents].map((e) => eventItem(e, { headingLevel: 4 })).join('')}</ul>` : ''}
        </div>
      </div>
    </div>
  </section>` : ''}`;

  // Citeer
  const box = main().querySelector('[data-citebox]');
  main().querySelector('[data-cite]').addEventListener('click', async () => {
    box.hidden = false;
    const ta = box.querySelector('textarea'); ta.select();
    try { await navigator.clipboard.writeText(ta.value); box.querySelector('[data-cite-status]').textContent = t('meta.copied'); }
    catch { /* tekst blijft geselecteerd om manueel te kopiëren */ }
  });
}

/* ---------------- Evenementen ---------------- */
async function evenementen() {
  const items = data().evenementen;
  setMeta({ title: t('pages.eventsTitle'), description: t('pages.eventsLead') });
  main().innerHTML = `
  <div class="wrap">${breadcrumb([{ label: t('nav.knowledge') }, { label: t('pages.eventsTitle') }])}</div>
  <header class="page-head"><div class="wrap"><h1>${t('pages.eventsTitle')}</h1><p class="lead">${t('pages.eventsLead')}</p></div></header>
  <div class="wrap" style="padding-bottom:var(--s-9)" id="listing"></div>`;

  const soonest = (a, b) => {
    const pa = isPast(a), pb = isPast(b);
    if (pa !== pb) return pa ? 1 : -1;
    return pa ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start);
  };

  /* FILTERCONFIG evenementen */
  createListing({
    id: 'events',
    root: document.getElementById('listing'),
    items,
    listClass: 'event-list',
    countLabel: [t('results.ev1'), t('results.evN')],
    pageSize: 10,
    facets: [
      themeFacet(),
      taxFacet('type', 'evenementType', t('filters.type'), (e) => [e.type]),
      { key: 'wanneer', label: t('filters.when'), single: true, get: (e) => [isPast(e) ? 'archief' : 'komend'], options: () => [{ value: 'komend', label: t('filters.upcoming') }, { value: 'archief', label: t('filters.past') }] },
      yearFacet((e) => e.start, items)
    ],
    sorts: [
      { key: 'soonest', fn: soonest },
      { key: 'newest', fn: (a, b) => b.start.localeCompare(a.start) },
      { key: 'oldest', fn: (a, b) => a.start.localeCompare(b.start) },
      { key: 'az', fn: (a, b) => tr(a.titel).localeCompare(tr(b.titel), lang) }
    ],
    defaultSort: 'soonest',
    // Komend bovenaan, archief eronder (enkel bij standaardsortering)
    groups: {
      split: (list, s) => s.sort !== 'soonest' || s.f.wanneer.length
        ? [{ title: null, items: list }]
        : [{ title: t('event.upcoming'), items: list.filter((e) => !isPast(e)) }, { title: t('event.archive'), items: list.filter(isPast) }]
    },
    searchText: (e) => [allLangs(e.titel), allLangs(e.samenvatting), e.partners.join(' '), allLangs(e.locatie), e.themas.map((s) => themeName(theme(s))).join(' ')].join(' '),
    render: (e, o) => eventItem(e, o)
  });
}

/* ---------------- Evenement-detail ---------------- */
async function evenement() {
  const e = event(param('slug'));
  if (!e) return notFound();
  const past = isPast(e);
  const status = eventStatus(e);
  const pubs = pubsForEvent(e.slug);
  const relPubs = pubsSorted().filter((p) => p.themas.some((s) => e.themas.includes(s)) && !pubs.includes(p)).slice(0, 4);
  const relEvents = data().evenementen.filter((x) => x !== e && x.themas.some((s) => e.themas.includes(s))).sort((a, b) => b.start.localeCompare(a.start)).slice(0, 3);
  const desc = trInfo(e.beschrijving);
  const when = e.heleDag ? `${t('event.allDay')} ${fmtDate(e.start).toLowerCase()}` : `${fmtDate(e.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br>${fmtTime(e.start)}${e.einde ? `–${fmtTime(e.einde)}` : ''}`;
  setMeta({
    title: tr(e.titel), description: tr(e.samenvatting),
    jsonld: { '@context': 'https://schema.org', '@type': 'Event', name: tr(e.titel), startDate: e.start, endDate: e.einde || undefined,
      eventAttendanceMode: { online: 'https://schema.org/OnlineEventAttendanceMode', fysiek: 'https://schema.org/OfflineEventAttendanceMode', hybride: 'https://schema.org/MixedEventAttendanceMode' }[e.formaat],
      location: { '@type': e.formaat === 'online' ? 'VirtualLocation' : 'Place', name: tr(e.locatie) }, organizer: { '@type': 'Organization', name: 'NANSEN' } }
  });

  main().innerHTML = `
  <div class="wrap">${breadcrumb([{ label: t('knowledge.events'), href: url('evenementen.html') }, { label: past ? t('event.archive') : t('event.upcoming'), href: url('evenementen.html', { wanneer: past ? 'archief' : 'komend' }) }, { label: tr(e.titel) }])}</div>
  <article class="wrap">
    <header class="doc-head">
      <p class="doc-kicker"><a class="type-label" href="${url('evenementen.html', { type: e.type })}">${esc(term('evenementType', e.type))}</a>${statusBadge(e)}</p>
      <h1>${esc(tr(e.titel))}</h1>
      <p class="lead">${esc(tr(e.samenvatting))}</p>
      <div class="mt-5"><p class="label mb-2">${t('meta.themes')}</p>${themeTags(e.themas)}</div>
    </header>
    <div class="detail">
      <div class="detail-main" data-translation-notice>
        ${desc.fallback ? notice(t('translationMissing')) : ''}
        <div class="blocks">
          ${e.foto ? `<figure class="figure">${picture(e.foto, tr(e.titel), { sizes: '(min-width: 64em) 40rem, 100vw' })}</figure>` : ''}
          <div class="block-text">${desc.value}</div>
          ${past && e.verslag ? `<h2 id="verslag">${t('event.report')}</h2><div class="block-text">${tr(e.verslag)}</div>` : ''}
          ${past && e.materiaal?.length ? `<h2 id="materiaal">${t('event.material')}</h2>${downloads(e.materiaal)}` : ''}
          ${pubs.length ? `<h2>${t('meta.linkedPubs')}</h2><ul class="register register--compact" role="list">${pubs.map((p) => pubItem(p, { headingLevel: 3, compact: true })).join('')}</ul>` : ''}
        </div>
      </div>
      <div class="detail-aside">
        <div class="practical">
          <dl>
            <div><dt>${t('event.when')}</dt><dd>${when}</dd></div>
            <div><dt>${t('event.where')}</dt><dd>${esc(term('formaat', e.formaat))}<br>${esc(tr(e.locatie))}</dd></div>
            <div><dt>${t('event.for')}</dt><dd>${e.doelpubliek.map((a) => esc(term('doelpubliek', a))).join(', ')}</dd></div>
            ${e.partners.length ? `<div><dt>${t('event.partners')}</dt><dd>${esc(e.partners.join(', '))}</dd></div>` : ''}
            ${e.deelnemers ? `<div><dt>${t('event.participants')}</dt><dd>${e.deelnemers.toLocaleString(lang === 'en' ? 'en-GB' : `${lang}-BE`)}</dd></div>` : ''}
            <div><dt>${t('event.status')}</dt><dd>${statusBadge(e)}</dd></div>
          </dl>
          ${status === 'open' ? `<a class="btn" href="${e.inschrijving.url || '#'}">${t('event.register')}</a>` : ''}
          ${status === 'full' ? `<a class="btn" href="mailto:info@nansenrefugee.be?subject=${encodeURIComponent(`Wachtlijst: ${tr(e.titel)}`)}">${t('event.waitlist')}</a>` : ''}
        </div>
      </div>
    </div>
  </article>
  ${(relPubs.length || relEvents.length) ? `
  <section class="related" aria-labelledby="rel-h">
    <div class="wrap">
      <h2 id="rel-h">${t('meta.related')}</h2>
      <div class="related-grid">
        <div>${relPubs.length ? `<h3>${t('types.publications')}</h3><ul class="register register--compact" role="list">${relPubs.map((p) => pubItem(p, { headingLevel: 4, compact: true })).join('')}</ul>` : ''}</div>
        <div>${relEvents.length ? `<h3>${t('types.events')}</h3><ul class="event-list" role="list">${relEvents.map((x) => eventItem(x, { headingLevel: 4 })).join('')}</ul>` : ''}</div>
      </div>
    </div>
  </section>` : ''}`;
}

/* ---------------- Zoeken ---------------- */
async function zoeken() {
  const q = (param('q') || '').trim();
  const allLang = param('alle') === '1';
  setMeta({ title: q ? `${t('search.resultsFor')} “${q}”` : t('search.title') });
  const terms = norm(q).split(/\s+/).filter((w) => w.length > 1);

  // Thema's die matchen via naam of trefwoorden (synoniemen: "gender" -> SOGI)
  const themeHits = new Set(data().themas.filter((th) => {
    const hay = norm([allLangs(th.naam), allLangs(th.naamLang), th.trefwoorden.join(' ')].join(' '));
    return terms.length && (terms.every((w) => hay.includes(w)) || hay.includes(norm(q)));
  }).map((th) => th.slug));

  const score = (fields, itemThemes = []) => {
    if (!terms.length) return 0;
    let s = 0; let all = true;
    terms.forEach((w) => {
      let hit = false;
      fields.forEach(([txt, weight]) => { if (norm(txt).includes(w)) { s += weight; hit = true; } });
      if (!hit) all = false;
    });
    const viaTheme = itemThemes.some((x) => themeHits.has(x));
    if (viaTheme) s += 2;
    return all || viaTheme ? s : 0;
  };

  const pubsAll = data().publicaties.map((p) => ({ p, s: score([[allLangs(p.titel), 6], [allLangs(p.samenvatting), 3], [blockText(tr(p.inhoud)), 1], [p.landen.map((k) => term('land', k)).join(' '), 3], [term('publicatieType', p.type), 2]], p.themas), via: p.themas.some((x) => themeHits.has(x)) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);
  const pubsHere = pubsAll.filter((r) => r.p.documentTalen.includes(lang));
  const pubsRes = allLang ? pubsAll : pubsHere;
  const otherLangCount = pubsAll.length - pubsHere.length;
  const evRes = data().evenementen.map((e) => ({ e, s: score([[allLangs(e.titel), 6], [allLangs(e.samenvatting), 3], [allLangs(e.beschrijving), 1], [e.partners.join(' '), 3], [term('evenementType', e.type), 2]], e.themas) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);
  const thRes = data().themas.map((th) => ({ th, s: themeHits.has(th.slug) ? 10 : score([[allLangs(th.naam), 6], [allLangs(th.intro), 2], [blockText(tr(th.inhoud)), 1]]) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);
  const pgRes = data().paginas.map((pg) => ({ pg, s: score([[allLangs(pg.titel), 6], [allLangs(pg.tekst), 2]]) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);

  // Markeer zoektermen, accent-ongevoelig ("categorie" vindt "catégorie")
  const accents = { a: 'aàáâä', e: 'eèéêë', i: 'iìíîï', o: 'oòóôö', u: 'uùúûü', c: 'cç', n: 'nñ' };
  const termRe = terms.length ? new RegExp(`(${terms.map((w) => [...w].map((c) => (accents[c] ? `[${accents[c]}]` : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('')).join('|')})`, 'gi') : null;
  const hl = (s) => (termRe ? esc(s).replace(termRe, '<mark>$1</mark>') : esc(s));
  const LIMIT = 5;
  const groups = [
    { key: 'themes', label: t('types.themes'), n: thRes.length, html: (lim) => `<ul class="simple-results" role="list">${thRes.slice(0, lim).map(({ th }) => `<li><a href="${url('thema.html', { slug: th.slug })}"><strong>${hl(themeName(th))}</strong><span>${hl(tr(th.kort))}</span></a></li>`).join('')}</ul>`, all: url('themas.html') },
    { key: 'pubs', label: t('types.publications'), n: pubsRes.length, html: (lim) => `<ul class="register" role="list">${pubsRes.slice(0, lim).map(({ p }) => pubItem(p)).join('')}</ul>`, all: url('publicaties.html', { q }) },
    { key: 'events', label: t('types.events'), n: evRes.length, html: (lim) => `<ul class="event-list" role="list">${evRes.slice(0, lim).map(({ e }) => eventItem(e)).join('')}</ul>`, all: url('evenementen.html', { q }) },
    { key: 'pages', label: t('types.pages'), n: pgRes.length, html: (lim) => `<ul class="simple-results" role="list">${pgRes.slice(0, lim).map(({ pg }) => `<li><a href="${url(pg.url)}"><strong>${hl(tr(pg.titel))}</strong><span>${hl(tr(pg.tekst).slice(0, 140))}…</span></a></li>`).join('')}</ul>`, all: null }
  ];
  const total = groups.reduce((s, g) => s + g.n, 0);

  main().innerHTML = `
  <div class="wrap">${breadcrumb([{ label: t('search.title') }])}</div>
  <section class="search-hero"><div class="wrap">
    <h1>${q ? `${t('search.resultsFor')} <span class="serif">“${esc(q)}”</span>` : t('search.title')}</h1>
    <div class="mt-5">${searchForm('page', q)}</div>
    ${q && otherLangCount ? `<label class="check mt-5"><input type="checkbox" id="alle" ${allLang ? 'checked' : ''}><span>${t('search.otherLangs')}</span><span class="count">+${otherLangCount}</span></label>` : ''}
  </div></section>
  <div class="wrap" style="padding-bottom:var(--s-9)">
    ${!q ? '' : !total ? `<div class="empty"><h2>${t('search.none', { q: esc(q) })}</h2><p>${t('search.noneHelp')}</p></div>` : `
    <div class="search-tabs" role="tablist" aria-label="${t('search.title')}">
      <button role="tab" aria-selected="true" data-tab="all">${t('search.all')}<span class="n">${total}</span></button>
      ${groups.filter((g) => g.n).map((g) => `<button role="tab" aria-selected="false" data-tab="${g.key}">${g.label}<span class="n">${g.n}</span></button>`).join('')}
    </div>
    <div data-groups>
      ${groups.filter((g) => g.n).map((g) => `
        <section class="search-group" data-group="${g.key}" aria-labelledby="sg-${g.key}">
          <header><h2 id="sg-${g.key}">${g.label}<span class="n">${g.n}</span></h2>${g.all && g.n > LIMIT ? `<a class="link-more" href="${g.all}">${t('search.showAll', { n: g.n, type: g.label.toLowerCase() })}</a>` : ''}</header>
          <div data-short>${g.html(LIMIT)}</div><div data-full hidden>${g.html(999)}</div>
        </section>`).join('')}
    </div>`}
  </div>`;

  // Highlight in lijstitems (titels/samenvattingen van partials)
  main().querySelectorAll('.pub-title, .pub-summary, .event-title').forEach((el) => { el.innerHTML = hl(el.textContent); });

  main().querySelector('#alle')?.addEventListener('change', (ev) => {
    const u = new URL(location.href); ev.target.checked ? u.searchParams.set('alle', '1') : u.searchParams.delete('alle'); location.href = u;
  });
  const tabs = main().querySelectorAll('[data-tab]');
  tabs.forEach((b) => b.addEventListener('click', () => {
    tabs.forEach((x) => x.setAttribute('aria-selected', x === b));
    main().querySelectorAll('[data-group]').forEach((g) => {
      const on = b.dataset.tab === 'all' || g.dataset.group === b.dataset.tab;
      g.hidden = !on;
      g.querySelector('[data-short]').hidden = b.dataset.tab !== 'all';
      g.querySelector('[data-full]').hidden = b.dataset.tab === 'all';
    });
  }));
}

/* ---------------- /nansen: jaarverslagen + team uit data ---------------- */
async function nansen() {
  const reports = pubsSorted().filter((p) => p.type === 'jaarverslag');
  const el = document.getElementById('jaarverslagen-list');
  if (el) el.innerHTML = `<ul class="register" role="list">${reports.map((p) => pubItem(p)).join('')}</ul>`;
  const team = document.getElementById('team-list');
  if (team) team.innerHTML = data().team.map((m) => `<li class="team-card"><div class="avatar" aria-hidden="true">${m.naam.split(' ').map((x) => x[0]).join('')}</div><h3>${esc(m.naam)}</h3><p>${esc(tr(m.functie))}</p></li>`).join('');
}

/* ---------------- Stijlgids: live componenten ---------------- */
async function stijlgids() {
  const fill = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  fill('sg-pubs', `<ul class="register" role="list">${pubsSorted().slice(0, 3).map((p) => pubItem(p)).join('')}</ul>`);
  fill('sg-events', `<ul class="event-list" role="list">${[...upcomingEvents().slice(0, 1), ...pastEvents().slice(0, 1)].map((e) => eventItem(e)).join('')}</ul>`);
  fill('sg-themes', `<ul class="theme-grid" role="list">${data().themas.slice(0, 3).map((th) => themeTile(th)).join('')}</ul>`);
  fill('sg-blocks', blocks([...pub('fiche-sogi-bewijs').inhoud.nl, ...pub('etude-cas-detention').inhoud.nl, ...pub('griekenland-bip').inhoud.nl.slice(-1), ...pub('procedure-frontiere-detention').inhoud.nl.slice(-1)]));
  fill('sg-downloads', downloads(pub('jaarverslag-2025').bijlagen));
  fill('sg-tags', `${themeTags(['sogi', 'detentie', 'staatloosheid'])}<div class="mt-5">${countryTags(['afghanistan', 'palestina'])}</div><div class="mt-5">${langBadges(['nl', 'fr', 'en'])} ${statusBadge(upcomingEvents()[0])} ${statusBadge(pastEvents()[0])}</div>`);
}

export const pages = { home, themas, thema, publicaties, publicatie, evenementen, evenement, zoeken, nansen, stijlgids };
