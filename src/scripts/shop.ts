import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const grid = document.querySelector<HTMLElement>('[data-shop-grid]');
const cards = grid ? Array.from(grid.querySelectorAll<HTMLElement>('[data-card]')) : [];
const original = [...cards];
const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-filter]'));
const sort = document.querySelector<HTMLSelectElement>('[data-sort]');
const count = document.querySelector<HTMLElement>('[data-shop-count]');
const empty = document.querySelector<HTMLElement>('[data-shop-empty]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

const plural = (n: number) => `${n} ${n === 1 ? 'piece' : 'pieces'}`;

function active(kind: string) {
  return chips.filter((c) => c.dataset.filter === kind && c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset.value!);
}

function apply(animate = true) {
  if (!grid) return;
  const state = Flip.getState(cards);
  const uph = active('upholstery');
  const frame = active('frame');

  let shown = 0;
  for (const card of cards) {
    const ok = (!uph.length || uph.includes(card.dataset.upholstery!)) && (!frame.length || frame.includes(card.dataset.frame!));
    card.hidden = !ok;
    if (ok) shown++;
  }

  const order = [...original];
  if (sort?.value === 'price-asc') order.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
  if (sort?.value === 'price-desc') order.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
  order.forEach((c) => grid.appendChild(c));

  if (count) count.textContent = plural(shown);
  if (empty) empty.hidden = shown > 0;

  if (animate && !reduce.matches) {
    Flip.from(state, {
      duration: 0.6,
      ease: 'expo.out',
      stagger: 0.03,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.25, ease: 'power2.in' }),
    });
  }

  // Keep the filters in the address so a filtered view can be shared or restored with Back.
  const params = new URLSearchParams();
  if (uph.length) params.set('upholstery', uph.join(','));
  if (frame.length) params.set('frame', frame.join(','));
  if (sort && sort.value !== 'featured') params.set('sort', sort.value);
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

chips.forEach((chip) =>
  chip.addEventListener('click', () => {
    chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
    apply();
  }),
);
sort?.addEventListener('change', () => apply());
document.querySelector('[data-clear]')?.addEventListener('click', () => {
  chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
  if (sort) sort.value = 'featured';
  apply();
  chips[0]?.focus();
});

// Restore state from the address.
const params = new URLSearchParams(location.search);
const restore = (kind: string) => (params.get(kind) || '').split(',').filter(Boolean);
const fromUrl = { upholstery: restore('upholstery'), frame: restore('frame') };
chips.forEach((c) => {
  if (fromUrl[c.dataset.filter as 'upholstery' | 'frame']?.includes(c.dataset.value!)) c.setAttribute('aria-pressed', 'true');
});
if (sort && params.get('sort')) sort.value = params.get('sort')!;
if (params.toString()) apply(false);
