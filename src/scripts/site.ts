import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Header: glass once scrolled, tucks away on scroll down, returns on scroll up ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  let lastY = scrollY;
  let ticking = false;
  const update = () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    const menuOpen = document.querySelector<HTMLDialogElement>('[data-menu]')?.open;
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (!menuOpen && goingDown && y > 240) header.classList.add('is-hidden');
    else if (goingUp || y <= 240) header.classList.remove('is-hidden');
    html.classList.toggle('header-hidden', header.classList.contains('is-hidden'));
    lastY = y;
    ticking = false;
  };
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  // Keyboard users tabbing into the header always see it.
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();
}

/* ---------- Menu sheet ---------- */
const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
document.querySelector('[data-menu-open]')?.addEventListener('click', () => {
  if (!menu) return;
  menu.showModal();
  if (!reduce.matches) {
    gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' });
    gsap.fromTo(
      menu.querySelectorAll('.menu-sheet__links li'),
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05, delay: 0.05 },
    );
  }
});
document.querySelector('[data-menu-close]')?.addEventListener('click', () => menu?.close());
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.close()));

/* ---------- Motion ---------- */
function setupMotion() {
  // Lines of display type rise out of a mask.
  document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.set(el, { opacity: 1 });
    gsap.from(split.lines, {
      yPercent: 105,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: el.hasAttribute('data-now') ? undefined : { trigger: el, start: 'top 88%', once: true },
      delay: el.hasAttribute('data-now') ? Number(el.dataset.delay || 0) : 0,
    });
  });

  // Gentle fade and rise, batched so a row of items arrives together.
  ScrollTrigger.batch('[data-reveal="fade"]', {
    start: 'top 90%',
    once: true,
    onEnter: (els) =>
      gsap.fromTo(els, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.07, overwrite: true }),
  });

  // Images wipe up from the bottom edge while the picture settles from a slight zoom.
  document.querySelectorAll<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.inOut' });
    if (img) tl.from(img, { scale: 1.12, duration: 1.4, ease: 'expo.out' }, 0.1);
  });

  // Words of a statement fill in as you read down the page.
  document.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words' });
    gsap.fromTo(
      split.words,
      { opacity: 0.16 },
      { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } },
    );
  });

  // Slow parallax on large photographs. Kept small to stay comfortable.
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax || 8);
    gsap.fromTo(
      el,
      { yPercent: -amount },
      { yPercent: amount, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

if (html.classList.contains('motion')) {
  document.fonts.ready.then(() => {
    // The safety net in <head> may have already revealed everything on a slow connection.
    if (!html.classList.contains('motion')) return html.classList.add('motion-ready');
    setupMotion();
    html.classList.add('motion-ready');
    document.dispatchEvent(new CustomEvent('motion:ready'));
  });
} else {
  html.classList.add('motion-ready');
}

export { gsap, ScrollTrigger, reduce };
