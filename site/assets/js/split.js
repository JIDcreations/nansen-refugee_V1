/* =========================================================
   Paginakop in de taal van de home-hero: twee panelen (licht + beeld)
   gescheiden door dezelfde schuine voeg met afgeronde hoeken.
   <header class="page-head" data-media="centrum|spot"> ... </header>
   - data-media = afbeeldingsnaam (assets/img/<naam>-1280.webp, grijs en zacht)
     of "spot" (donker paneel met lichtvlek, zoals Impact).
   JS voegt twee achtergrondlagen toe en tekent ze als clip-path.
   Onder 64em: één afgerond paneel, beeldstrook eronder. WP: template part.
   ========================================================= */
import { roundPoly } from './pillars.js';

const K = 0.72; // zelfde helling als de hero

export function initHeads() {
  document.querySelectorAll('.page-head').forEach(build);
}

function build(head) {
  if (head.querySelector('.ph-layer')) return;
  const media = head.dataset.media || 'spot';
  const a = document.createElement('span');
  const b = document.createElement('span');
  a.className = 'ph-layer ph-layer--a';
  b.className = `ph-layer ph-layer--b${media === 'spot' ? ' is-spot' : ''}`;
  a.setAttribute('aria-hidden', 'true'); b.setAttribute('aria-hidden', 'true');
  if (media !== 'spot') b.innerHTML = `<span class="ph-photo" style="background-image:url('assets/img/${media}-1280.webp')"></span>`;
  head.prepend(a, b);
  head.classList.add('is-split');

  const wide = matchMedia('(min-width: 64em)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let k = reduce ? 1 : 0; // 0 → 1: voeg schuift van het midden naar zijn plek

  const draw = () => {
    if (!wide.matches) { a.style.clipPath = b.style.clipPath = ''; head.style.removeProperty('--ph-text'); return; }
    const W = head.clientWidth, H = head.clientHeight;
    const g = Math.max(12, Math.min(18, W * 0.011));
    const hd = (g / 2) * Math.sqrt(1 + K * K);
    const end = head.classList.contains('page-head--doc') ? 0.74 : 0.66; // eindpositie van de voeg (midden)
    const mid = W * (0.5 + (end - 0.5) * ease(k));
    const x = (y) => mid + (H / 2 - y) * K;
    const big = Math.min(H * 0.22, 120), r = { big, mid: Math.min(46, H * 0.08), small: 0 };
    a.style.clipPath = `path('${roundPoly([[0, 0], [x(0) - hd, 0], [x(H) - hd, H], [0, H]], r)}')`;
    b.style.clipPath = `path('${roundPoly([[x(0) + hd, 0], [W, 0], [W, H], [x(H) + hd, H]], r)}')`;
    // Tekst blijft links van de voeg (gemeten vanaf de linkerlijn van .wrap)
    const w = head.querySelector(':scope > .wrap');
    const left = w ? w.offsetLeft + parseFloat(getComputedStyle(w).paddingLeft) : 0;
    head.style.setProperty('--ph-text', `${Math.max(320, W * (0.5 + (end - 0.5)) + (H / 2 - H) * K - hd - 56 - left)}px`);
  };

  if (!reduce && wide.matches) {
    const t0 = performance.now() + 120, dur = 1100;
    const step = (now) => { k = Math.min(1, Math.max(0, (now - t0) / dur)); draw(); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  } else { k = 1; draw(); }
  new ResizeObserver(draw).observe(head);
  wide.addEventListener('change', draw);
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
