/*
  Product page behaviour.
  Signature: choosing another leather swaps the piece in place, and the stage behind it
  takes on the colour of the new material (Saddle warms it, Dal cools it).
*/
import { gsap } from 'gsap';
import { addToEnquiry } from './enquiry';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Image views (tabs) ---------- */
function selectView(id: string, focus = false) {
  const tabs = document.querySelectorAll<HTMLButtonElement>('[data-view-tab]');
  tabs.forEach((t) => {
    const on = t.dataset.viewTab === id;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  document.querySelectorAll<HTMLElement>('[data-view]').forEach((v) => {
    const on = v.dataset.view === id;
    if (on && v.hidden) {
      v.hidden = false;
      if (!reduce.matches) gsap.fromTo(v, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
    } else if (!on) {
      v.hidden = true;
    }
  });
}

document.addEventListener('click', (e) => {
  const tab = (e.target as Element).closest<HTMLButtonElement>('[data-view-tab]');
  if (tab) selectView(tab.dataset.viewTab!);
});
document.addEventListener('keydown', (e) => {
  const tab = (e.target as Element).closest<HTMLButtonElement>('[data-view-tab]');
  if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-view-tab]'));
  const i = tabs.indexOf(tab);
  const next =
    e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  selectView(tabs[next].dataset.viewTab!, true);
});

/* ---------- Add to enquiry ---------- */
document.addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-add]');
  if (!btn) return;
  addToEnquiry(btn.dataset.add!);
  document.querySelectorAll<HTMLButtonElement>(`[data-add="${btn.dataset.add}"]`).forEach((b) => {
    const label = b.querySelector<HTMLElement>('[data-add-label]');
    b.classList.add('is-added');
    if (label) label.textContent = 'Added to enquiry';
    clearTimeout(Number(b.dataset.timer));
    b.dataset.timer = String(
      setTimeout(() => {
        b.classList.remove('is-added');
        if (label) label.textContent = 'Add to enquiry';
      }, 1800),
    );
  });
});

/* ---------- Buy bar: follows you once the main button scrolls away ---------- */
let observer: IntersectionObserver | undefined;
function watchMainButton() {
  observer?.disconnect();
  const main = document.querySelector('[data-main-add]');
  const bar = document.querySelector<HTMLElement>('[data-buybar]');
  if (!main || !bar) return;
  observer = new IntersectionObserver(([entry]) => {
    const show = !entry.isIntersecting;
    bar.classList.toggle('is-visible', show);
    bar.toggleAttribute('inert', !show);
    bar.setAttribute('aria-hidden', String(!show));
    bar.querySelector<HTMLButtonElement>('button')?.setAttribute('tabindex', show ? '0' : '-1');
  });
  observer.observe(main);
}
watchMainButton();

/* ---------- Material swap ---------- */
const cache = new Map<string, Promise<Document>>();
function load(url: string) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.text();
        })
        .then((t) => new DOMParser().parseFromString(t, 'text/html')),
    );
  }
  return cache.get(url)!;
}

async function swapTo(url: string, push: boolean) {
  let doc: Document;
  try {
    doc = await load(url);
  } catch {
    location.href = url; // fall back to a normal page load
    return;
  }
  const apply = () => {
    document.querySelectorAll<HTMLElement>('[data-swap]').forEach((el) => {
      const next = doc.querySelector(`[data-swap="${el.dataset.swap}"]`);
      if (next) el.replaceWith(document.importNode(next, true));
    });
    // Replace the configurator wholesale: it carries the selected swatch, price and button.
    const card = document.querySelector('.config-card');
    const nextCard = doc.querySelector('.config-card');
    if (card && nextCard) card.replaceWith(document.importNode(nextCard, true));
    html.dataset.tint = doc.documentElement.dataset.tint || 'neutral';
    document.title = doc.title;
    const article = document.querySelector<HTMLElement>('[data-product]');
    const nextArticle = doc.querySelector<HTMLElement>('[data-product]');
    if (article && nextArticle) article.dataset.product = nextArticle.dataset.product;
    if (push) history.pushState({ swap: true }, '', url);
    watchMainButton();
  };

  const vt = (document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }).startViewTransition;
  if (vt && !reduce.matches) {
    vt.call(document, apply);
  } else {
    apply();
  }
  document.querySelector<HTMLElement>(`[data-swatch][aria-current="true"]`)?.focus({ preventScroll: true });
}

document.addEventListener('click', (e) => {
  const sw = (e.target as Element).closest<HTMLAnchorElement>('[data-swatch]');
  if (!sw || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  if (sw.getAttribute('aria-current') === 'true') return;
  swapTo(sw.href, true);
});

// Warm the cache when a swatch is hovered or focused, so the swap feels instant.
['pointerenter', 'focusin'].forEach((type) =>
  document.addEventListener(
    type,
    (e) => {
      const sw = (e.target as Element)?.closest?.<HTMLAnchorElement>('[data-swatch]');
      if (sw && sw.getAttribute('aria-current') !== 'true') load(sw.href);
    },
    true,
  ),
);

addEventListener('popstate', () => {
  const slug = location.pathname.split('/').filter(Boolean).pop();
  const current = document.querySelector<HTMLElement>('[data-product]')?.dataset.product;
  if (slug && slug !== current && document.querySelector(`[data-swatch="${slug}"]`)) swapTo(location.href, false);
  else if (slug !== current) location.reload();
});

/* ---------- Gallery: drag to scroll with a mouse ---------- */
const track = document.querySelector<HTMLElement>('[data-gallery]');
if (track && matchMedia('(pointer: fine)').matches) {
  let down = false;
  let startX = 0;
  let startScroll = 0;
  track.addEventListener('pointerdown', (e) => {
    down = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.style.scrollSnapType = 'none';
    track.style.cursor = 'grabbing';
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    track.style.scrollSnapType = '';
    track.style.cursor = '';
  });
  track.addEventListener('pointermove', (e) => {
    if (down) track.scrollLeft = startScroll - (e.clientX - startX);
  });
  track.style.cursor = 'grab';
  track.addEventListener('dragstart', (e) => e.preventDefault());
}
