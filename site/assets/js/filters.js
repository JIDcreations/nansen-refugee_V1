/* =========================================================
   Generiek filtersysteem.
   Een filter = config-object. Filter toevoegen = één object
   toevoegen aan de config van het overzicht, geen nieuwe code.
   Filterstaat staat in de URL: ?thema=sogi,detentie&type=nota
   Binnen één filter = OF, tussen filters = EN.
   ========================================================= */
import { t, esc, lang } from './core.js';
import { icon } from './partials.js';

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function createListing(cfg) {
  const {
    root, items, facets, render, sorts, defaultSort, searchText,
    countLabel, pageSize = 10, groups
  } = cfg;

  const state = readUrl();
  let shown = pageSize;

  function readUrl() {
    const p = new URLSearchParams(location.search);
    const s = { q: p.get('q') || '', sort: p.get('sort') || defaultSort, f: {} };
    facets.forEach((f) => { const v = p.get(f.key); s.f[f.key] = v ? v.split(',').filter(Boolean) : []; });
    return s;
  }
  function writeUrl() {
    const p = new URLSearchParams(location.search);
    facets.forEach((f) => (state.f[f.key].length ? p.set(f.key, state.f[f.key].join(',')) : p.delete(f.key)));
    state.q ? p.set('q', state.q) : p.delete('q');
    state.sort !== defaultSort ? p.set('sort', state.sort) : p.delete('sort');
    const s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? `?${s}` : ''));
  }

  const matchText = (it) => !state.q || norm(searchText(it)).includes(norm(state.q));
  const matchFacet = (it, f, vals = state.f[f.key]) => !vals.length || f.get(it).some((v) => vals.includes(String(v)));
  const filtered = (except) => items.filter((it) => matchText(it) && facets.every((f) => f === except || matchFacet(it, f)));

  function optionCounts(f) {
    const base = filtered(f);
    const c = {};
    base.forEach((it) => f.get(it).forEach((v) => { c[v] = (c[v] || 0) + 1; }));
    return c;
  }

  /* ---------- Opbouw ---------- */
  root.innerHTML = `
    <div class="listing">
      <aside class="filters" aria-label="${t('filters.title')}">
        <button class="btn btn--secondary filters-toggle" type="button" aria-expanded="false">${icon.filter}<span>${t('filters.show')}</span></button>
        <div class="filter-groups">
          <div class="filter-search mt-5">
            <label class="visually-hidden" for="${cfg.id}-q">${t('filters.search')}</label>
            ${icon.search}<input class="field" id="${cfg.id}-q" type="search" placeholder="${t('filters.search')}" value="${esc(state.q)}">
          </div>
          <div data-facets></div>
        </div>
      </aside>
      <div class="results" aria-live="polite">
        <div class="results-bar">
          <p class="results-count" data-count></p>
          <div class="results-tools">
            <label for="${cfg.id}-sort">${t('sort.label')}</label>
            <select class="field select" id="${cfg.id}-sort">${sorts.map((s) => `<option value="${s.key}" ${s.key === state.sort ? 'selected' : ''}>${t(`sort.${s.key}`)}</option>`).join('')}</select>
          </div>
        </div>
        <div class="chips" data-chips></div>
        <div data-list></div>
      </div>
    </div>`;

  const $ = (s) => root.querySelector(s);
  const facetsEl = $('[data-facets]');

  function renderFacets() {
    facetsEl.innerHTML = facets.map((f) => {
      const counts = optionCounts(f);
      const opts = f.options();
      const limit = f.collapseAfter || 99;
      const expanded = facetsEl.dataset[`exp_${f.key}`] === '1';
      const type = f.single ? 'radio' : 'checkbox';
      const rows = opts.map((o, i) => {
        const checked = state.f[f.key].includes(String(o.value));
        const n = counts[o.value] || 0;
        const hide = !expanded && i >= limit && !checked;
        return `<label class="check ${n === 0 && !checked ? 'is-empty' : ''}" ${hide ? 'hidden' : ''}>
          <input type="${type}" name="${cfg.id}-${f.key}" value="${esc(o.value)}" ${checked ? 'checked' : ''} data-facet="${f.key}">
          <span ${o.lang ? `lang="${o.lang}"` : ''}>${esc(o.label)}</span><span class="count">${n}</span></label>`;
      }).join('');
      const allRow = f.single ? `<label class="check"><input type="radio" name="${cfg.id}-${f.key}" value="" ${state.f[f.key].length ? '' : 'checked'} data-facet="${f.key}"><span>${t('filters.all')}</span></label>` : '';
      const more = opts.length > limit ? `<button type="button" class="filter-more" data-more="${f.key}">${expanded ? t('filters.less') : t('filters.more')}</button>` : '';
      return `<fieldset class="filter-group"><legend>${esc(f.label)}</legend>${allRow}${rows}${more}</fieldset>`;
    }).join('');
  }

  function renderChips() {
    const chips = [];
    facets.forEach((f) => state.f[f.key].forEach((v) => {
      const o = f.options().find((x) => String(x.value) === v);
      chips.push(`<button type="button" class="chip" data-chip="${f.key}" data-value="${esc(v)}" aria-label="${t('filters.remove')}: ${esc(o ? o.label : v)}">${esc(o ? o.label : v)}${icon.close}</button>`);
    }));
    if (state.q) chips.push(`<button type="button" class="chip" data-chip="q" aria-label="${t('filters.remove')}: ${esc(state.q)}">“${esc(state.q)}”${icon.close}</button>`);
    $('[data-chips]').innerHTML = chips.length ? chips.join('') + `<button type="button" class="chip-clear" data-clear>${t('filters.clear')}</button>` : '';
    $('[data-chips]').hidden = !chips.length;
  }

  function renderList() {
    const sort = sorts.find((s) => s.key === state.sort) || sorts[0];
    const res = filtered().sort(sort.fn);
    const total = res.length;
    $('[data-count]').innerHTML = `<strong>${total}</strong> ${total === 1 ? countLabel[0] : countLabel[1]}`;
    const list = $('[data-list]');
    if (!total) {
      list.innerHTML = `<div class="empty"><h2>${t('results.emptyTitle')}</h2><p>${t('results.emptyText')}</p><button class="btn btn--primary" type="button" data-clear>${t('filters.clear')}</button></div>`;
      return;
    }
    const visible = res.slice(0, shown);
    const grouped = groups ? groups.split(visible, state) : [{ title: null, items: visible }];
    list.innerHTML = grouped.filter((g) => g.items.length).map((g) => `
      ${g.title ? `<h2 class="year-sep" style="list-style:none">${esc(g.title)}</h2>` : ''}
      <ul class="${cfg.listClass}" role="list">${g.items.map((it) => render(it, { headingLevel: g.title ? 3 : 2 })).join('')}</ul>`).join('')
      + (total > shown ? `<div class="pager"><p>${t('results.showing', { n: shown, total })}</p><button class="btn btn--secondary" type="button" data-loadmore>${t('results.loadMore')}</button></div>` : '');
  }

  function update({ resetPaging = true } = {}) {
    if (resetPaging) shown = pageSize;
    writeUrl(); renderFacets(); renderChips(); renderList();
  }

  /* ---------- Events ---------- */
  root.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.facet) {
      const f = facets.find((x) => x.key === el.dataset.facet);
      if (f.single) state.f[f.key] = el.value ? [el.value] : [];
      else state.f[f.key] = [...root.querySelectorAll(`input[data-facet="${f.key}"]:checked`)].map((i) => i.value);
      const focusVal = el.value, focusKey = f.key;
      update();
      root.querySelector(`input[data-facet="${focusKey}"][value="${CSS.escape(focusVal)}"]`)?.focus();
    }
    if (el.id === `${cfg.id}-sort`) { state.sort = el.value; update(); }
  });
  let debounce;
  $(`#${cfg.id}-q`).addEventListener('input', (e) => { clearTimeout(debounce); debounce = setTimeout(() => { state.q = e.target.value.trim(); update(); }, 180); });
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-chip]');
    if (chip) {
      if (chip.dataset.chip === 'q') { state.q = ''; $(`#${cfg.id}-q`).value = ''; }
      else state.f[chip.dataset.chip] = state.f[chip.dataset.chip].filter((v) => v !== chip.dataset.value);
      update(); $('[data-count]').focus?.();
      return;
    }
    if (e.target.closest('[data-clear]')) { facets.forEach((f) => (state.f[f.key] = [])); state.q = ''; $(`#${cfg.id}-q`).value = ''; update(); return; }
    if (e.target.closest('[data-loadmore]')) {
      const before = shown; shown += pageSize; renderList();
      root.querySelectorAll('[data-list] li > a')[before]?.focus();
      return;
    }
    const more = e.target.closest('[data-more]');
    if (more) { const k = `exp_${more.dataset.more}`; facetsEl.dataset[k] = facetsEl.dataset[k] === '1' ? '0' : '1'; renderFacets(); return; }
    const tg = e.target.closest('.filters-toggle');
    if (tg) {
      const box = root.querySelector('.filters'); const open = box.classList.toggle('is-open');
      tg.setAttribute('aria-expanded', open); tg.querySelector('span').textContent = open ? t('filters.hide') : t('filters.show');
    }
  });

  update();
}

