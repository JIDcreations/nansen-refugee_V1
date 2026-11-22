/* =========================================================
   Home-hero: vier panelen (probleem, oplossing, impact, visie).
   De panelen zijn trapezia met afgeronde hoeken, getekend als clip-path.
   Ze delen één kruispunt C: een diagonaal door C en een getrapte
   horizontale voeg. Hover/focus op een paneel schuift C weg van dat
   paneel, zodat het groeit en zijn tekst toont.
   Onder 64em: geen vormen, gewoon vier blokken (CSS).
   ========================================================= */
const K = 0.72;          // helling van de diagonaal (dx per dy)
const SHIFT = [[1, 1], [-1, 1], [1, -1], [-1, -1]]; // richting van C per actief paneel

export function initPillars(root) {
  const stage = root && root.querySelector('.lx-stage');
  if (!stage) return;
  const panels = [...stage.querySelectorAll('.lx-panel')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = matchMedia('(min-width: 64em)');
  let active = -1, cur = null, target = null, raf = 0;
  root.classList.add('is-live');

  const targetFor = (i) => ({ x: 0.5 + SHIFT[i][0] * 0.075, y: 0.5 + SHIFT[i][1] * 0.1 });

  function select(i) {
    if (i === active) return;
    active = i;
    panels.forEach((p, k) => {
      const on = k === i;
      p.classList.toggle('is-open', on);
      p.querySelector('.lx-btn').setAttribute('aria-expanded', String(on));
    });
    root.querySelectorAll('.lx-dots').forEach((d) => [...d.children].forEach((c, k) => c.classList.toggle('is-on', k === i)));
    const stat = panels[i].querySelector('.lx-stat strong');
    if (stat && !reduce) countUp(stat);
    target = targetFor(i);
    if (!cur || reduce) { cur = { ...target }; draw(); } else animate();
  }

  function animate() {
    cancelAnimationFrame(raf);
    const from = { ...cur }, t0 = performance.now(), dur = 750;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const k = ease(Math.min(1, (now - t0) / dur));
      cur = { x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k };
      draw();
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function draw() {
    if (!wide.matches) { panels.forEach((p) => { p.style.clipPath = ''; const b = p.querySelector('.lx-box'); b.removeAttribute('style'); }); return; }
    const W = stage.clientWidth, H = stage.clientHeight;
    const g = Math.max(12, Math.min(18, W * 0.011));      // voeg
    const m = 0;                                            // tot aan de rand van het scherm
    const x0 = m, y0 = m, x1 = W - m, y1 = H - m;
    const cx = W * cur.x, cy = H * cur.y;
    const d = (y) => cx + (cy - y) * K;
    const hd = (g / 2) * Math.sqrt(1 + K * K), hv = g / 2;
    const s = H * 0.035, yL = cy - s, yR = cy + s;
    const big = H * 0.17, mid = Math.min(46, H * 0.06), small = 0;

    const shapes = [
      [[x0, y0], [d(y0) - hd, y0], [d(yL - hv) - hd, yL - hv], [x0, yL - hv]],
      [[d(y0) + hd, y0], [x1, y0], [x1, yR - hv], [d(yR - hv) + hd, yR - hv]],
      [[x0, yL + hv], [d(yL + hv) - hd, yL + hv], [d(y1) - hd, y1], [x0, y1]],
      [[d(yR + hv) + hd, yR + hv], [x1, yR + hv], [x1, y1], [d(y1) + hd, y1]]
    ];
    shapes.forEach((pts, i) => { panels[i].style.clipPath = `path('${roundPoly(pts, { big, mid, small })}')`; });

    // Inhoud: in het brede deel van elk paneel
    // zelfde linker-/rechterlijn als de header (.wrap: max 78rem + gutter clamp(1rem, .5rem + 2.5vw, 2.5rem))
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const gut = Math.min(2.5 * rem, Math.max(rem, 0.5 * rem + 0.025 * W));
    const pad = Math.max(gut, (W - 78 * rem - 2 * gut) / 2 + gut);
    const py = Math.max(28, H * 0.05);
    const tlB = yL - hv - py - 56, trT = y0 + (yR - y0) * 0.3, blB = yL + hv + (y1 - yL) * 0.72, brT = yR + hv + (y1 - yR) * 0.22;
    const boxes = [
      { l: x0 + pad, t: y0 + py + 24, r: d(tlB) - hd - big * 0.45, b: tlB },
      { l: d(trT) + hd + 32, t: trT, r: x1 - pad, b: yR - hv - py },
      { l: x0 + pad, t: yL + hv + py, r: d(blB) - hd - 24, b: blB },
      { l: d(brT) + hd + 24, t: brT, r: x1 - pad, b: y1 - py - 56 }
    ];
    boxes.forEach((bx, i) => {
      const el = panels[i].querySelector('.lx-box');
      el.style.left = `${bx.l}px`; el.style.top = `${bx.t}px`;
      el.style.width = `${Math.max(140, bx.r - bx.l)}px`; el.style.height = `${Math.max(80, bx.b - bx.t)}px`;
    });
    stage.style.setProperty('--lx-m', `${m}px`);
    stage.style.setProperty('--lx-pad', `${pad}px`);
    stage.style.setProperty('--lx-py', `${py}px`);
    stage.style.setProperty('--lx-yl', `${yL - hv}px`);
    stage.style.setProperty('--lx-yr', `${yR + hv}px`);
  }

  panels.forEach((p, i) => {
    p.addEventListener('mouseenter', () => { if (wide.matches) select(i); });
    p.addEventListener('click', () => select(i));
    const btn = p.querySelector('.lx-btn');
    btn.addEventListener('click', () => select(i));
    btn.addEventListener('focus', () => select(i));
  });
  /* Gsm: kaarten swipen horizontaal; tabs volgen en sturen de scrollpositie */
  const tabs = [...root.querySelectorAll('.lx-tabs button')];
  const tabRow = root.querySelector('.lx-tabs');
  const setTab = (i) => {
    tabs.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    const b = tabs[i];
    if (b && tabRow) tabRow.scrollTo({ left: b.offsetLeft - tabRow.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
  };
  tabs.forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.go);
    stage.scrollTo({ left: panels[i].offsetLeft - panels[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    setTab(i);
  }));
  let st = 0;
  stage.addEventListener('scroll', () => {
    if (wide.matches) return;
    cancelAnimationFrame(st);
    st = requestAnimationFrame(() => {
      const step = panels[1].offsetLeft - panels[0].offsetLeft;
      setTab(Math.max(0, Math.min(panels.length - 1, Math.round(stage.scrollLeft / step))));
    });
  }, { passive: true });
  new ResizeObserver(() => cur && draw()).observe(stage);
  wide.addEventListener('change', () => cur && draw());
  select(0);
}

/* Afgeronde veelhoek: elke hoek krijgt een straal naar zijn hoek (stomp = groot, scherp = middel, recht = klein) */
export function roundPoly(pts, { big, mid, small }) {
  const n = pts.length;
  let out = '';
  for (let i = 0; i < n; i++) {
    const P = pts[i], A = pts[(i - 1 + n) % n], B = pts[(i + 1) % n];
    const ax = A[0] - P[0], ay = A[1] - P[1], bx = B[0] - P[0], by = B[1] - P[1];
    const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
    const ang = Math.acos((ax * bx + ay * by) / (la * lb)) * 180 / Math.PI;
    let r = ang > 100 ? big : ang < 80 ? mid : small;
    r = Math.min(r, la * 0.48, lb * 0.48);
    const p1 = [P[0] + (ax / la) * r, P[1] + (ay / la) * r];
    const p2 = [P[0] + (bx / lb) * r, P[1] + (by / lb) * r];
    const c1 = [p1[0] + (P[0] - p1[0]) * 0.6, p1[1] + (P[1] - p1[1]) * 0.6];
    const c2 = [p2[0] + (P[0] - p2[0]) * 0.6, p2[1] + (P[1] - p2[1]) * 0.6];
    out += `${i ? 'L' : 'M'}${f(p1)} C${f(c1)} ${f(c2)} ${f(p2)} `;
  }
  return `${out}Z`;
}
const f = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

function countUp(el) {
  const txt = el.dataset.v || el.textContent.trim();
  el.dataset.v = txt;
  const sep = (txt.match(/[.,  ]/) || [''])[0];
  const target = Number(txt.replace(/\D/g, ''));
  if (!target) return;
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const t0 = performance.now() + 300, dur = 1100;
  const tick = (now) => {
    const k = Math.min(1, Math.max(0, (now - t0) / dur));
    el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
