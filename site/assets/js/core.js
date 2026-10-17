/* =========================================================
   Core: taal, data, relaties en hulpfuncties.
   In WordPress: get_field(), pll_current_language(), WP_Query.
   ========================================================= */

export const LANGS = ['nl', 'fr', 'en'];
export const DEFAULT_LANG = 'nl'; // Open vraag 3: standaardtaal

const params = new URLSearchParams(location.search);
export const lang = LANGS.includes(params.get('lang')) ? params.get('lang') : DEFAULT_LANG;

const state = { i18n: null, data: null };

async function getJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Kan ${path} niet laden (${res.status})`);
  return res.json();
}

export async function load() {
  const [i18n, themas, publicaties, evenementen, taxonomieen, team, paginas] = await Promise.all([
    getJSON(`i18n/${lang}.json`),
    getJSON('data/themas.json'),
    getJSON('data/publicaties.json'),
    getJSON('data/evenementen.json'),
    getJSON('data/taxonomieen.json'),
    getJSON('data/team.json'),
    getJSON('data/paginas.json')
  ]);
  state.i18n = i18n;
  state.data = { themas, publicaties, evenementen, taxonomieen, team, paginas };
  buildIndex();
  return state;
}

export const data = () => state.data;

/* ---------- Vertalingen ---------- */
/** UI-string op pad, bv. t('nav.themes'); {x} wordt vervangen. */
export function t(path, vars = {}) {
  const v = path.split('.').reduce((o, k) => (o ? o[k] : undefined), state.i18n);
  if (typeof v !== 'string') return path;
  return v.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

/** Meertalig contentveld {nl, fr, en} -> waarde in actieve taal, met terugval. */
export function tr(field) {
  return trInfo(field).value;
}
export function trInfo(field) {
  if (field == null) return { value: '', lang: null, fallback: false };
  if (typeof field !== 'object' || Array.isArray(field)) return { value: field, lang: null, fallback: false };
  if (field[lang] != null) return { value: field[lang], lang, fallback: false };
  for (const l of [DEFAULT_LANG, ...LANGS]) if (field[l] != null) return { value: field[l], lang: l, fallback: true };
  return { value: '', lang: null, fallback: false };
}

/* ---------- URL's (taal blijft behouden) ---------- */
export function url(page, query = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v != null && v !== '') q.set(k, v);
  if (lang !== DEFAULT_LANG) q.set('lang', lang);
  const s = q.toString();
  const [path, hash] = page.split('#');
  return path + (s ? `?${s}` : '') + (hash ? `#${hash}` : '');
}
export function langUrl(l) {
  const q = new URLSearchParams(location.search);
  if (l === DEFAULT_LANG) q.delete('lang'); else q.set('lang', l);
  const s = q.toString();
  return location.pathname.split('/').pop() + (s ? `?${s}` : '') + location.hash;
}
export const param = (k) => new URLSearchParams(location.search).get(k);

/* ---------- Datums ---------- */
const locale = () => state.i18n?.locale || 'nl-BE';
export const parseDate = (s) => (s ? new Date(s.length === 10 ? `${s}T12:00` : s) : null);
export function fmtDate(s, opts = { day: 'numeric', month: 'long', year: 'numeric' }) {
  const d = parseDate(s); return d ? new Intl.DateTimeFormat(locale(), opts).format(d) : '';
}
export const fmtShort = (s) => fmtDate(s, { day: '2-digit', month: '2-digit', year: 'numeric' });
export const fmtTime = (s) => (s && s.includes('T') ? new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit' }).format(parseDate(s)) : '');
export const fmtMonth = (s) => new Intl.DateTimeFormat(locale(), { month: 'short' }).format(parseDate(s)).replace('.', '');

/* ---------- Escapen ---------- */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Index & relaties (bidirectioneel) ---------- */
const idx = {};
function buildIndex() {
  const d = state.data;
  idx.theme = new Map(d.themas.map((x) => [x.slug, x]));
  idx.pub = new Map(d.publicaties.map((x) => [x.slug, x]));
  idx.event = new Map(d.evenementen.map((x) => [x.slug, x]));
  idx.team = new Map(d.team.map((x) => [x.slug, x]));
  // Publicatie <-> evenement: één keer koppelen, aan beide kanten zichtbaar
  idx.pubEvents = new Map(d.publicaties.map((p) => [p.slug, new Set(p.evenementen || [])]));
  idx.eventPubs = new Map(d.evenementen.map((e) => [e.slug, new Set(e.publicaties || [])]));
  d.publicaties.forEach((p) => (p.evenementen || []).forEach((e) => idx.eventPubs.get(e)?.add(p.slug)));
  d.evenementen.forEach((e) => (e.publicaties || []).forEach((p) => idx.pubEvents.get(p)?.add(e.slug)));
  // "Lees ook" ook bidirectioneel
  idx.pubRelated = new Map(d.publicaties.map((p) => [p.slug, new Set(p.gerelateerd || [])]));
  d.publicaties.forEach((p) => (p.gerelateerd || []).forEach((r) => idx.pubRelated.get(r)?.add(p.slug)));
}
export const theme = (slug) => idx.theme.get(slug);
export const pub = (slug) => idx.pub.get(slug);
export const event = (slug) => idx.event.get(slug);
export const person = (slug) => idx.team.get(slug);

const byDateDesc = (a, b) => (b.datum || b.start).localeCompare(a.datum || a.start);
export const pubsSorted = () => [...state.data.publicaties].sort(byDateDesc);
export const pubsForTheme = (slug) => pubsSorted().filter((p) => p.themas.includes(slug));
export const eventsForTheme = (slug) => state.data.evenementen.filter((e) => e.themas.includes(slug));
export const eventsForPub = (slug) => [...(idx.pubEvents.get(slug) || [])].map(event).filter(Boolean);
export const pubsForEvent = (slug) => [...(idx.eventPubs.get(slug) || [])].map(pub).filter(Boolean).sort(byDateDesc);
export const relatedPubs = (slug) => [...(idx.pubRelated.get(slug) || [])].map(pub).filter(Boolean);

/* Status komend/voorbij: automatisch op datum */
export function isPast(e, now) {
  if (!(now instanceof Date)) now = new Date(); // veilig als callback in .filter()
  const end = parseDate(e.einde || e.start);
  if (e.heleDag && !e.einde) return parseDate(e.start) < now;
  return end < now;
}
export function eventStatus(e) {
  if (isPast(e)) return 'past';
  return e.inschrijving?.status || 'open';
}
export const upcomingEvents = () => state.data.evenementen.filter((e) => !isPast(e)).sort((a, b) => a.start.localeCompare(b.start));
export const pastEvents = () => state.data.evenementen.filter(isPast).sort((a, b) => b.start.localeCompare(a.start));

/* Taxonomie-label */
export function term(group, key) {
  const g = state.data.taxonomieen[group];
  return g && g[key] ? tr(g[key]) : key;
}
export const themeName = (th, short = false) => tr((short && th.naamKort) || th.naam);
export const langName = (code) => state.i18n.langNames?.[code] || code;

/* Afbeelding (responsive WebP + JPG fallback) */
export function picture(name, alt = '', { sizes = '100vw', cls = '', eager = false, widths = [640, 1280, 1920] } = {}) {
  if (!name) return '';
  const srcset = widths.map((w) => `assets/img/${name}-${w}.webp ${w}w`).join(', ');
  return `<picture class="${cls}"><source type="image/webp" srcset="${srcset}" sizes="${sizes}"><img src="assets/img/${name}-1280.jpg" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}

/* ---------- Meta / SEO ---------- */
export function setMeta({ title, description, type = 'website', jsonld } = {}) {
  if (title) document.title = `${title} | NANSEN`;
  const set = (sel, attr, val) => {
    let el = document.head.querySelector(sel);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr.split('=')[0], attr.split('=')[1]); document.head.appendChild(el); }
    el.setAttribute('content', val);
  };
  if (description) { set('meta[name="description"]', 'name=description', description); set('meta[property="og:description"]', 'property=og:description', description); }
  if (title) set('meta[property="og:title"]', 'property=og:title', title);
  set('meta[property="og:type"]', 'property=og:type', type);
  if (jsonld) {
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(jsonld); document.head.appendChild(s);
  }
}
