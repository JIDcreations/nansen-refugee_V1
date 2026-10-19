/* =========================================================
   Partials. Elk partial wordt later een WP template part
   (get_template_part('parts/pub-item') enz.).
   ========================================================= */
import {
  t, tr, trInfo, url, langUrl, lang, LANGS, esc, data, theme, term, themeName, langName,
  fmtDate, fmtShort, fmtTime, fmtMonth, parseDate, eventStatus, isPast, pubsForTheme, eventsForTheme, picture
} from './core.js';

/* ---------- Iconen ---------- */
const sv = (d, vb = '0 0 24 24', extra = '') => `<svg viewBox="${vb}" aria-hidden="true" focusable="false" ${extra}>${d}</svg>`;
const stroke = (d) => sv(d, '0 0 24 24', 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"');
export const icon = {
  search: stroke('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.6-4.6"/>'),
  chevron: stroke('<path d="M6 9l6 6 6-6"/>'),
  menu: stroke('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: stroke('<path d="M6 6l12 12M18 6L6 18"/>'),
  download: stroke('<path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14"/>'),
  arrow: stroke('<path d="M5 12h14m-5-5l5 5-5 5"/>'),
  external: stroke('<path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/>'),
  calendar: stroke('<rect x="4" y="5" width="16" height="15" rx="1"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
  pin: stroke('<path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0113 0c0 4.9-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  clock: stroke('<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 1.8"/>'),
  users: stroke('<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6M15.5 6a3 3 0 010 6M17 14.6c1.9.5 3.1 2 3.5 4.4"/>'),
  info: stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>'),
  copy: stroke('<rect x="8" y="8" width="11" height="12" rx="1"/><path d="M5 16V5a1 1 0 011-1h9"/>'),
  print: stroke('<path d="M7 9V4h10v5M7 17H5a1 1 0 01-1-1v-5a2 2 0 012-2h12a2 2 0 012 2v5a1 1 0 01-1 1h-2"/><path d="M7 14h10v6H7z"/>'),
  check: stroke('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  filter: stroke('<path d="M4 6h16M7 12h10M10 18h4"/>'),
  ribbon: sv('<path d="M0 0h14v22l-7-5.2L0 22z" fill="currentColor"/>', '0 0 14 22'),
  linkedin: sv('<path fill="currentColor" d="M6.9 8.6H3.6V20h3.3V8.6zM5.2 3.5a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM20.4 13.4c0-3.1-1.7-4.9-4.3-4.9-1.6 0-2.6.9-3 1.6V8.6H9.9V20h3.3v-5.7c0-1.5.3-2.9 2.1-2.9 1.8 0 1.8 1.7 1.8 3V20h3.3v-6.6z"/>'),
  facebook: sv('<path fill="currentColor" d="M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.2-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.6V21h3z"/>')
};

/* Logo's worden inline geladen zodat ze currentColor volgen */
const logoCache = {};
export async function inlineLogo(name) {
  if (!logoCache[name]) logoCache[name] = fetch(`assets/logo/${name}.svg`).then((r) => r.text());
  return logoCache[name];
}

/* ---------- Navigatieconfig (makkelijk aanpasbaar) ---------- */
export const NANSEN_ANCHORS = ['missie', 'aanpak', 'team', 'geschiedenis', 'partners', 'jaarverslagen', 'contact'];

/* ---------- Subnav /nansen (sticky, scrollspy) ---------- */
export function subnav(anchors = NANSEN_ANCHORS) {
  return `<nav class="subnav" aria-label="${t('meta.toc')}" data-scrollspy>
    <div class="wrap"><ul>${anchors.map((a) => `<li><a href="#${a}">${t(`anchors.${a}`)}</a></li>`).join('')}</ul></div>
  </nav>`;
}

/* ---------- Header ---------- */
export async function header(active = '') {
  const logo = await inlineLogo('nansen');
  const themes = data().themas;
  /* Met href: label is een link naar het overzicht, het pijltje opent het paneel (hover opent ook) */
  const navItem = (id, label, panel, isActive, href) => href ? `
    <li class="nav-item nav-item--split" data-dropdown>
      <a class="nav-trigger" href="${href}" ${isActive ? 'aria-current="page"' : ''}>${label}</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="dd-${id}" aria-label="${t('nav.submenu', { t: label })}">${icon.chevron}</button>
      ${panel(`dd-${id}`)}
    </li>` : `
    <li class="nav-item" data-dropdown>
      <button class="nav-trigger" type="button" aria-expanded="false" aria-controls="dd-${id}" ${isActive ? 'aria-current="page"' : ''}>${label}${icon.chevron}</button>
      ${panel(`dd-${id}`)}
    </li>`;
  /* NANSEN is één pagina: gewone link, de secties zitten in de sticky subnav op /nansen */
  const navLink = (href, label, isActive) => `
    <li class="nav-item"><a class="nav-trigger" href="${href}" ${isActive ? 'aria-current="page"' : ''}>${label}</a></li>`;

  /* Mega-dropdown: intro links, items rechts. Eén partial voor alle hoofdmenu's. */
  const mega = ({ title, intro, more, items }) => (id) => `<div class="dropdown dropdown--mega" id="${id}">
      <div class="mega-intro"><strong>${title}</strong><p>${intro}</p><a class="link-more" href="${more.href}">${more.label} ${icon.arrow.replace('<svg', '<svg class="icon-inline"')}</a></div>
      <ul role="list" class="${items.length > 5 ? 'mega-list--cols' : ''}">${items.map((it) => `<li><a href="${it.href}"><span>${it.label}</span><small>${it.sub}</small></a></li>`).join('')}</ul>
    </div>`;

  const ddThemes = mega({
    title: t('megaTitle'), intro: t('megaIntro'),
    more: { href: url('themas.html'), label: t('allThemes') },
    items: themes.map((th) => ({ href: url('thema.html', { slug: th.slug }), label: esc(themeName(th)), sub: esc(tr(th.kort)) }))
  });
  const ddServices = mega({
    title: t('nav.services'), intro: t('navPanels.services.intro'),
    more: { href: 'mailto:dossiers@nansenrefugee.be', label: t('navPanels.services.more') },
    items: [
      { href: url('bijstand.html'), label: t('services.bijstand'), sub: t('services.bijstandSub') },
      { href: url('vormingen.html'), label: t('services.vormingen'), sub: t('services.vormingenSub') }
    ]
  });
  const ddKnowledge = mega({
    title: t('nav.knowledge'), intro: t('navPanels.knowledge.intro'),
    more: { href: url('zoeken.html'), label: t('navPanels.knowledge.more') },
    items: [
      { href: url('publicaties.html'), label: t('knowledge.pubs'), sub: t('knowledge.pubsSub') },
      { href: url('evenementen.html'), label: t('knowledge.events'), sub: t('knowledge.eventsSub') }
    ]
  });

  const langSwitch = `<ul class="lang-switch" aria-label="Taal / Langue / Language">${LANGS.map((l) => `<li><a href="${langUrl(l)}" hreflang="${l}" lang="${l}" ${l === lang ? 'aria-current="true"' : ''}>${l.toUpperCase()}</a></li>`).join('')}</ul>`;

  const mobileGroup = (label, links) => `<details><summary>${label}${icon.chevron}</summary><ul>${links}</ul></details>`;
  const mobile = `
    <div class="mobile-menu" id="mobile-menu" aria-label="${t('nav.menu')}">
      <a class="mobile-link" href="${url('nansen.html')}" ${active === 'nansen' ? 'aria-current="page"' : ''}>${t('nav.nansen')}</a>
      ${mobileGroup(t('nav.themes'), themes.map((th) => `<li><a href="${url('thema.html', { slug: th.slug })}">${esc(themeName(th))}</a></li>`).join('') + `<li><a href="${url('themas.html')}">${t('allThemes')}</a></li>`)}
      ${mobileGroup(t('nav.services'), `<li><a href="${url('bijstand.html')}">${t('services.bijstand')}</a></li><li><a href="${url('vormingen.html')}">${t('services.vormingen')}</a></li>`)}
      ${mobileGroup(t('nav.knowledge'), `<li><a href="${url('publicaties.html')}">${t('knowledge.pubs')}</a></li><li><a href="${url('evenementen.html')}">${t('knowledge.events')}</a></li>`)}
      <div class="mobile-foot">${langSwitch}<a class="btn btn--accent" href="${url('steun-ons.html')}">${t('nav.support')}</a></div>
    </div>`;

  return `
  <a class="skip-link" href="#main">${t('skip')}</a>
  <header class="site-header" id="site-header">
    <div class="wrap header-bar">
      <a class="brand" href="${url('index.html')}" aria-label="NANSEN, the Belgian Refugee Council: ${t('nav.home')}">${logo}</a>
      <nav class="primary-nav" aria-label="Hoofdnavigatie">
        <ul class="nav-list" role="list">
          ${navLink(url('nansen.html'), t('nav.nansen'), active === 'nansen')}
          ${navItem('themes', t('nav.themes'), ddThemes, active === 'themas', url('themas.html'))}
          ${navItem('services', t('nav.services'), ddServices, active === 'diensten')}
          ${navItem('knowledge', t('nav.knowledge'), ddKnowledge, active === 'kennis')}
        </ul>
      </nav>
      <div class="header-tools">
        <button class="icon-btn" type="button" id="search-toggle" aria-expanded="false" aria-controls="search-panel" aria-label="${t('nav.search')}">${icon.search}</button>
        ${langSwitch}
        <a class="btn btn--accent" href="${url('steun-ons.html')}">${t('nav.support')}</a>
        <button class="icon-btn menu-toggle" type="button" id="menu-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="${t('nav.menu')}">${icon.menu}</button>
      </div>
    </div>
    <div class="search-panel" id="search-panel" hidden>
      <div class="wrap">${searchForm('panel')}</div>
    </div>
  </header>
  ${mobile}`;
}

export function searchForm(variant = 'panel', q = '') {
  const id = `q-${variant}`;
  const tries = ['gender', 'refoulement', 'Afghanistan', 'Protocol van Istanbul'];
  return `
    <form action="zoeken.html" method="get" role="search">
      ${variant === 'panel' ? `<label for="${id}">${t('searchLabel')}</label>` : `<label class="visually-hidden" for="${id}">${t('searchLabel')}</label>`}
      <div class="search-row">
        <input class="search-field" id="${id}" name="q" type="search" value="${esc(q)}" placeholder="${t('searchPh')}" autocomplete="off">
        ${lang !== 'nl' ? `<input type="hidden" name="lang" value="${lang}">` : ''}
        <button class="btn btn--primary" type="submit" aria-label="${t('searchBtn')}">${icon.search}<span>${t('searchBtn')}</span></button>
      </div>
      ${variant === 'panel' ? `<p class="search-hints">${t('searchTry')} ${tries.map((x) => `<a href="${url('zoeken.html', { q: x })}">${esc(x)}</a>`).join(' ')}</p>` : ''}
    </form>`;
}

/* ---------- Pre-footer: newsletter + klachtenbalk ---------- */
export function prefooter() {
  return `
  <section class="prefooter" aria-label="${t('newsletter.title')}">
    <div class="wrap prefooter-grid">
      <div class="newsletter">
        <h2>${t('newsletter.title')}</h2>
        <p>${t('newsletter.text')}</p>
        <form class="inline-form" action="${url('nieuwsbrief.html')}" method="get">
          <label class="visually-hidden" for="nl-email">${t('newsletter.label')}</label>
          <input id="nl-email" name="email" type="email" placeholder="${t('newsletter.label')}" autocomplete="email" required>
          <button class="btn btn--primary" type="submit">${t('newsletter.btn')}</button>
        </form>
        <p class="form-note">${t('newsletter.note')}</p>
      </div>
      <div class="complaint">
        <h2>${t('complaint.title')}</h2>
        <p>${t('complaint.text')}</p>
        <a class="btn btn--secondary" href="${url('klacht.html')}">${t('complaint.btn')}</a>
      </div>
    </div>
  </section>`;
}

/* ---------- Footer ---------- */
export async function footer() {
  const logo = await inlineLogo('nansen-baseline');
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="${url('index.html')}" aria-label="NANSEN">${logo}</a>
          <p>${t('footer.tagline')}</p>
          <div class="socials">
            <a href="https://www.linkedin.com/company/nansen-refugee/" aria-label="LinkedIn">${icon.linkedin}</a>
            <a href="https://www.facebook.com/nansenrefugee/" aria-label="Facebook">${icon.facebook}</a>
          </div>
        </div>
        <div>
          <h2>${t('footer.contact')}</h2>
          <dl>
            <dt>${t('footer.general')}</dt><dd><a href="mailto:info@nansenrefugee.be">info@nansenrefugee.be</a></dd>
            <dt>${t('footer.cases')}</dt><dd><a href="mailto:dossiers@nansenrefugee.be">dossiers@nansenrefugee.be</a></dd>
            <dt>${t('footer.direction')}</dt><dd>Gert Bruininkx<br><span>[e-mail directie volgt]</span></dd>
          </dl>
        </div>
        <div>
          <h2>${t('footer.address')}</h2>
          <address>NANSEN vzw<br>Rue Émile Féron 153<br>1060 Brussel</address>
          <h2 class="mt-6">${t('footer.partner')}</h2>
          <div class="unhcr" title="Officieel UNHCR-logo aan te leveren"><span>UNHCR<small>${t('footer.unhcr')}</small></span></div>
        </div>
        <div>
          <h2>${t('footer.links')}</h2>
          <ul>
            <li><a href="${url('publicaties.html')}">${t('knowledge.pubs')}</a></li>
            <li><a href="${url('evenementen.html')}">${t('types.events')}</a></li>
            <li><a href="${url('bijstand.html')}">${t('services.bijstand')}</a></li>
            <li><a href="${url('vormingen.html')}">${t('services.vormingen')}</a></li>
            <li><a href="${url('nansen.html#jaarverslagen')}">${t('anchors.jaarverslagen')}</a></li>
            <li><a href="${url('steun-ons.html')}">${t('nav.support')}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="mb-0">© ${new Date().getFullYear()} ${t('footer.rights')}</p>
        <ul>
          <li><a href="${url('privacy.html')}">${t('footer.privacy')}</a></li>
          <li><a href="${url('privacy.html#dpp')}">${t('footer.dpp')}</a></li>
          <li><a href="${url('klacht.html')}">${t('footer.complaint')}</a></li>
        </ul>
      </div>
    </div>
  </footer>`;
}

/* ---------- Breadcrumb ---------- */
export function breadcrumb(items) {
  const all = [{ label: t('breadcrumbHome'), href: url('index.html') }, ...items];
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${all.map((it, i) => i === all.length - 1
    ? `<li aria-current="page">${esc(it.label)}</li>`
    : `<li><a href="${it.href}">${esc(it.label)}</a></li>`).join('')}</ol></nav>`;
}

/* ---------- Kleine bouwstenen ---------- */
export const themeTags = (slugs, { link = true } = {}) => `<ul class="tags" role="list">${slugs.map(theme).filter(Boolean).map((th) =>
  link ? `<li><a class="tag" href="${url('thema.html', { slug: th.slug })}">${esc(themeName(th, true))}</a></li>` : `<li><span class="tag">${esc(themeName(th, true))}</span></li>`).join('')}</ul>`;
export const countryTags = (keys) => keys.length ? `<ul class="tags" role="list">${keys.map((k) => `<li><a class="tag tag--country" href="${url('publicaties.html', { land: k })}">${esc(term('land', k))}</a></li>`).join('')}</ul>` : '';
export const langBadges = (codes) => `<span class="langs">${['nl', 'fr', 'en'].filter((c) => codes.includes(c)).map((c) =>
  `<abbr class="lang ${c === lang ? 'lang--on' : ''}" title="${esc(langName(c))}">${c.toUpperCase()}</abbr>`).join('')}</span>`;

/** Titel in zijn eigen taal (lang-attribuut voor schermlezers) */
export function pubTitle(p) {
  const info = trInfo(p.titel);
  return { text: info.value, attr: info.lang && info.lang !== lang ? ` lang="${info.lang}"` : '' };
}

/* ---------- Lijstitem publicatie ---------- */
export function pubItem(p, { headingLevel = 3, compact = false } = {}) {
  const ti = pubTitle(p);
  const h = `h${headingLevel}`;
  return `
  <li class="pub-item">
    <a class="pub-link" href="${url('publicatie.html', { slug: p.slug })}">
      <span class="ribbon">${icon.ribbon}</span>
      <div class="pub-aside"><span class="type-label">${esc(term('publicatieType', p.type))}</span><time datetime="${p.datum}">${fmtShort(p.datum)}</time></div>
      <div class="pub-body">
        <div class="pub-meta"><span class="type-label">${esc(term('publicatieType', p.type))}</span><time datetime="${p.datum}">${fmtShort(p.datum)}</time>${langBadges(p.documentTalen)}</div>
        <${h} class="pub-title"${ti.attr}>${esc(ti.text)}</${h}>
        ${compact ? '' : `<p class="pub-summary">${esc(tr(p.samenvatting))}</p>`}
        <div class="pub-foot">${themeTags(p.themas, { link: false })}</div>
      </div>
      <div class="pub-langs">${langBadges(p.documentTalen)}</div>
    </a>
  </li>`;
}

/* ---------- Lijstitem evenement ---------- */
export function statusBadge(e) {
  const s = eventStatus(e);
  return `<span class="status status--${s}">${t(`event.${s}`)}</span>`;
}
export function eventItem(e, { headingLevel = 3 } = {}) {
  const d = parseDate(e.start);
  const h = `h${headingLevel}`;
  const time = e.heleDag ? t('event.allDay') : `${fmtTime(e.start)}${e.einde ? `–${fmtTime(e.einde)}` : ''}`;
  return `
  <li class="event-item ${isPast(e) ? 'is-past' : ''}">
    <a class="event-link" href="${url('evenement.html', { slug: e.slug })}">
      <time class="datebox" datetime="${e.start}"><span class="d">${d.getDate()}</span><span class="m">${fmtMonth(e.start)}</span><span class="y">${d.getFullYear()}</span></time>
      <div>
        <p class="type-label mb-0">${esc(term('evenementType', e.type))}</p>
        <${h} class="event-title">${esc(tr(e.titel))}</${h}>
        <p class="event-facts">
          <span>${icon.clock}${time}</span>
          <span>${icon.pin}${esc(tr(e.locatie))}</span>
          ${e.partners?.length ? `<span>${icon.users}${t('event.partners')} ${esc(e.partners.join(', '))}</span>` : ''}
        </p>
        ${themeTags(e.themas, { link: false })}
      </div>
      <div class="event-side">${statusBadge(e)}</div>
    </a>
  </li>`;
}

/* ---------- Thema-tegel ---------- */
export function themeTile(th, { headingLevel = 3 } = {}) {
  const np = pubsForTheme(th.slug).length, ne = eventsForTheme(th.slug).length;
  const h = `h${headingLevel}`;
  return `
  <li class="theme-tile"><a href="${url('thema.html', { slug: th.slug })}">
    <${h} class="theme-name">${esc(themeName(th))}</${h}>
    <p>${esc(tr(th.kort))}</p>
    <span class="counts"><span>${t('theme.countPub', { n: np })}</span><span>${t('theme.countEv', { n: ne })}</span></span>
  </a></li>`;
}

/* ---------- Downloads ---------- */
export function downloads(files) {
  return `<ul class="downloads" role="list">${files.map((f) => `
    <li><a class="download" href="${f.url || '#'}" ${f.url ? 'download' : 'aria-disabled="true" title="Demo: bestand volgt"'} hreflang="${f.taal}">
      <span class="file-ico">PDF</span>
      <span><strong>${esc(f.label)}</strong><small>${esc(langName(f.taal))}, ${esc(f.grootte)}${f.paginas ? `, ${f.paginas} ${t('meta.pages')}` : ''}</small></span>
      ${icon.download}
    </a></li>`).join('')}</ul>`;
}

/* ---------- Melding ontbrekende vertaling ---------- */
export function notice(text) {
  return `<div class="notice" role="note">${icon.info}<p>${esc(text)}</p></div>`;
}

/* ---------- Flexibele contentblokken ---------- */
export const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function blocks(list = []) {
  return list.map((b) => {
    switch (b.type) {
      case 'tekst': return `<div class="block-text">${b.html}</div>`;
      case 'tussentitel': return `<h2 id="${slugify(b.tekst)}">${esc(b.tekst)}</h2>`;
      case 'kernpunten': return `<div class="keypoints" role="note"><h3>${esc(b.titel || t('meta.keypoints'))}</h3><ul>${b.punten.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>`;
      case 'citaat': return `<blockquote class="quote ${b.variant === 'case' ? 'quote--case' : ''}"><p>${esc(b.tekst)}</p><footer><cite>${esc(b.bron)}</cite>${b.werk ? `, ${esc(b.werk)}` : ''}</footer></blockquote>`;
      case 'casus': return `<section class="casus" aria-label="${esc(b.titel)}">
          <header class="casus-head"><h2 class="casus-title">${esc(b.titel)}</h2><dl>${Object.entries(b.profiel || {}).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></header>
          <ol class="casus-steps">${b.stappen.map((s, i, a) => `<li class="${/uitkomst|resultaat/i.test(s.label) ? 'is-outcome' : ''}"><h3>${esc(s.label)}</h3><p>${esc(s.tekst)}</p></li>`).join('')}</ol>
        </section>`;
      case 'bronnen': return `${b.titel ? `<h3>${esc(b.titel)}</h3>` : ''}<ul class="sources" role="list">${b.items.map((s) => `
          <li><span class="src-type">${esc(s.soort)}</span><a href="${s.url}" rel="noopener">${esc(s.titel)}</a><time datetime="${s.datum}">${fmtShort(s.datum)}</time></li>`).join('')}</ul>`;
      case 'figuur': return `<figure class="figure">${picture(b.afbeelding, b.alt, { sizes: '(min-width: 64em) 40rem, 100vw' })}<figcaption>${esc(b.bijschrift)}</figcaption></figure>`;
      case 'accordion': return `<div class="accordion">${b.items.map((i) => `<details><summary>${esc(i.vraag)}</summary><div class="acc-body">${i.antwoord}</div></details>`).join('')}</div>`;
      default: return '';
    }
  }).join('');
}

/** Inhoudstafel uit de tussentitels (enkel bij lange teksten: >= 2 titels) */
export function toc(list = [], { inline = false } = {}) {
  const hs = list.filter((b) => b.type === 'tussentitel');
  if (hs.length < 2) return '';
  return `<nav class="toc ${inline ? 'toc-inline' : ''}" aria-label="${t('meta.toc')}"><h2>${t('meta.toc')}</h2><ol>${hs.map((h) => `<li><a href="#${slugify(h.tekst)}">${esc(h.tekst)}</a></li>`).join('')}</ol></nav>`;
}
