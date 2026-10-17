/* =========================================================
   Boot: data laden, header/footer plaatsen, pagina starten.
   <body data-page="..." data-section="..."> bepaalt de controller.
   ========================================================= */
import { load, lang, LANGS, DEFAULT_LANG, t } from './core.js';
import { header, footer, prefooter, notice } from './partials.js';
import { pages } from './pages.js';

async function boot() {
  document.documentElement.lang = lang;
  try {
    await load();
  } catch (err) {
    document.body.insertAdjacentHTML('afterbegin', `<p style="padding:1rem;background:#fde;font:14px sans-serif">Prototype moet via een lokale server draaien (bv. <code>npx serve site</code>). ${err.message}</p>`);
    throw err;
  }

  const body = document.body;
  const page = body.dataset.page;
  document.getElementById('header').outerHTML = await header(body.dataset.section || '');
  const foot = document.getElementById('footer');
  foot.outerHTML = (body.dataset.prefooter === 'false' ? '' : prefooter()) + await footer();

  // hreflang (in WP via Polylang/WPML)
  LANGS.forEach((l) => {
    const link = document.createElement('link');
    const u = new URL(location.href);
    l === DEFAULT_LANG ? u.searchParams.delete('lang') : u.searchParams.set('lang', l);
    Object.assign(link, { rel: 'alternate', hreflang: l, href: u.toString() });
    document.head.appendChild(link);
  });

  // Statische pagina's zijn in dit prototype enkel in het NL uitgeschreven
  if (body.dataset.static === 'true' && lang !== 'nl') {
    document.querySelector('[data-translation-notice]')?.insertAdjacentHTML('afterbegin', notice(t('translationMissing')));
  }

  initHeader();
  if (pages[page]) await pages[page]();
  initAnchors();
  document.documentElement.classList.add('is-ready');
}

/* ---------- Header: dropdowns, zoeken, mobiel menu, krimpen ---------- */
function initHeader() {
  const hdr = document.getElementById('site-header');
  const items = [...hdr.querySelectorAll('[data-dropdown]')];
  const close = (except) => items.forEach((it) => { if (it !== except) { it.classList.remove('is-open'); it.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false'); } });
  const open = (it) => { close(it); it.classList.add('is-open'); it.querySelector('.nav-trigger').setAttribute('aria-expanded', 'true'); };
  const hoverable = matchMedia('(hover: hover)').matches;

  items.forEach((it) => {
    const btn = it.querySelector('.nav-trigger');
    let timer, hoverOpenedAt = 0;
    btn.addEventListener('click', () => {
      // Klik vlak na hover-open: paneel open laten i.p.v. meteen weer te sluiten
      if (it.classList.contains('is-open') && Date.now() - hoverOpenedAt > 600) close(); else open(it);
    });
    if (hoverable) {
      it.addEventListener('mouseenter', () => { clearTimeout(timer); if (!it.classList.contains('is-open')) hoverOpenedAt = Date.now(); open(it); });
      it.addEventListener('mouseleave', () => { timer = setTimeout(() => close(), 160); });
    }
    it.addEventListener('keydown', (e) => {
      const links = [...it.querySelectorAll('.dropdown a')];
      const i = links.indexOf(document.activeElement);
      if (e.key === 'Escape') { close(); btn.focus(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); open(it); (links[i + 1] || links[0]).focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (links[i - 1] || links[links.length - 1]).focus(); }
    });
    it.addEventListener('focusout', (e) => { if (!it.contains(e.relatedTarget)) close(); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('[data-dropdown]')) close(); });

  // Zoekpaneel
  const sBtn = document.getElementById('search-toggle');
  const panel = document.getElementById('search-panel');
  const toggleSearch = (force) => {
    const show = force ?? panel.hidden;
    panel.hidden = !show; sBtn.setAttribute('aria-expanded', show);
    if (show) panel.querySelector('input[type=search]').focus();
  };
  sBtn.addEventListener('click', () => toggleSearch());
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { toggleSearch(false); sBtn.focus(); } });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); toggleSearch(true); }
  });

  // Mobiel menu
  const mBtn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  mBtn.addEventListener('click', () => {
    const show = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', show); document.body.classList.toggle('menu-open', show);
    mBtn.setAttribute('aria-expanded', show); mBtn.setAttribute('aria-label', show ? t('nav.close') : t('nav.menu'));
    mBtn.innerHTML = show ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a[href*="#"]')) mBtn.click(); });

  // Header krimpt bij scroll
  const onScroll = () => { const s = scrollY > 24; hdr.classList.toggle('is-scrolled', s); document.body.classList.toggle('header-small', s); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

/* ---------- Anchors & scrollspy (inhoudstafel, /nansen subnav) ---------- */
function initAnchors() {
  const navs = document.querySelectorAll('[data-scrollspy]');
  navs.forEach((nav) => {
    const links = [...nav.querySelectorAll('a[href*="#"]')];
    const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    if (!targets.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.classList.toggle('is-active', a.hash === `#${en.target.id}`));
          const act = nav.querySelector('.is-active');
          if (act && nav.classList.contains('subnav')) nav.querySelector('ul').scrollTo({ left: act.offsetLeft - 16, behavior: 'smooth' });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    targets.forEach((tg) => io.observe(tg));
  });
  // Hash na asynchroon renderen opnieuw volgen
  if (location.hash) { const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); el?.scrollIntoView(); }
}

boot();
