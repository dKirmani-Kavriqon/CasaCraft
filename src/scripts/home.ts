import { gsap } from 'gsap';

const stage = document.querySelector<HTMLElement>('[data-hero-stage]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const hover = matchMedia('(hover: hover)');

if (stage) {
  const chairs = stage.querySelectorAll<HTMLElement>('[data-hero-chair]');
  let interacted = false;

  const focus = (side?: string) => {
    if (side) stage.dataset.focus = side;
    else delete stage.dataset.focus;
  };

  chairs.forEach((chair) => {
    chair.addEventListener('pointerenter', () => {
      interacted = true;
      focus(chair.dataset.heroChair);
    });
    chair.addEventListener('focus', () => {
      interacted = true;
      focus(chair.dataset.heroChair);
    });
    chair.addEventListener('pointerleave', () => focus());
    chair.addEventListener('blur', () => focus());
  });

  // Entrance: the two chairs settle onto the stage one after the other.
  if (document.documentElement.classList.contains('motion')) {
    gsap.from(stage, { opacity: 0, scale: 0.98, duration: 1, ease: 'expo.out' });
    gsap.from(stage.querySelectorAll('.hero__img'), {
      yPercent: 8,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.14,
      delay: 0.2,
    });
    gsap.from(stage.querySelectorAll('.hero__tag, .hero__caption'), {
      y: 12,
      opacity: 0,
      duration: 0.8,
      ease: 'expo.out',
      stagger: 0.08,
      delay: 0.75,
    });
  }

  // Touch screens have no hover, so the stage gently shows each leather in turn while it is on screen.
  // It stops for good as soon as someone touches a chair, and never runs with reduced motion.
  if (!hover.matches && !reduce.matches) {
    let timer = 0;
    let side = 'left';
    const cycle = () => {
      if (interacted) return;
      focus(side);
      side = side === 'left' ? 'right' : 'left';
    };
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting && !interacted) {
        timer = window.setInterval(cycle, 3200);
      } else if (!interacted) {
        focus();
      }
    });
    setTimeout(() => io.observe(stage), 1600);
  }
}
