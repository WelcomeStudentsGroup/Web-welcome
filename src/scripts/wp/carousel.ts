/**
 * Carrusel genérico (reemplaza Swiper/Slick de Elementor, PowerPack y Timeline Widget):
 * desplaza una pista flex con transform, flechas, puntos, autoplay y pausa al pasar el cursor.
 *
 * Configuración en data-wsg-carousel='{"slides":5,"slidesTablet":3,"slidesMobile":1,...}'
 * (la pone el importador a partir de los ajustes del widget).
 */
interface Config {
  slides: number;
  slidesTablet: number | null;
  slidesMobile: number;
  autoplay: boolean;
  interval: number;
  loop: boolean;
  speed: number;
  gap: number;
  arrows: boolean;
  dots: boolean;
}

const CHEVRON_L = '<svg class="wsg-eicon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15.5 4.5 8 12l7.5 7.5 1.4-1.4L10.8 12l6.1-6.1z"/></svg>';
const CHEVRON_R = '<svg class="wsg-eicon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m8.5 4.5-1.4 1.4L13.2 12l-6.1 6.1 1.4 1.4L16 12z"/></svg>';

function perView(cfg: Config) {
  const w = window.innerWidth;
  if (w <= 767) return Math.max(1, cfg.slidesMobile || 1);
  if (w <= 1024) return Math.max(1, cfg.slidesTablet || Math.min(cfg.slides, 2));
  return Math.max(1, cfg.slides || 1);
}

export function setupCarousel(el: HTMLElement, cfg: Config, opts: { wrapper?: HTMLElement; slides?: HTMLElement[]; prev?: HTMLElement | null; next?: HTMLElement | null; onChange?: (i: number, total: number) => void } = {}) {
  const wrapper = opts.wrapper ?? el.querySelector<HTMLElement>('.swiper-wrapper') ?? el;
  const slides = opts.slides ?? (Array.from(wrapper.children) as HTMLElement[]);
  if (slides.length === 0) return;
  const container = wrapper.parentElement ?? el;
  const prev = opts.prev === undefined ? (el.querySelector<HTMLElement>('.elementor-swiper-button-prev, .swiper-button-prev') ?? el.parentElement?.querySelector<HTMLElement>('.elementor-swiper-button-prev') ?? null) : opts.prev;
  const next = opts.next === undefined ? (el.querySelector<HTMLElement>('.elementor-swiper-button-next, .swiper-button-next') ?? el.parentElement?.querySelector<HTMLElement>('.elementor-swiper-button-next') ?? null) : opts.next;

  let index = 0;
  let n = perView(cfg);
  let timer: number | undefined;

  wrapper.classList.add('wsg-track');
  container.classList.add('wsg-viewport');
  // Como hace Swiper: sin esta clase, el CSS de Elementor limita el ancho de cada slide.
  el.classList.add('swiper-initialized');

  const maxIndex = () => Math.max(0, slides.length - n);
  const layout = () => {
    n = perView(cfg);
    const gap = cfg.gap || 0;
    wrapper.style.gap = `${gap}px`;
    const width = `calc((100% - ${gap * (n - 1)}px) / ${n})`;
    slides.forEach((s) => {
      s.style.flex = `0 0 ${width}`;
      s.style.width = width;
    });
    go(Math.min(index, maxIndex()), false);
  };
  const go = (i: number, animate = true) => {
    const max = maxIndex();
    if (i > max) i = cfg.loop ? 0 : max;
    if (i < 0) i = cfg.loop ? max : 0;
    index = i;
    const slide = slides[0];
    const gap = cfg.gap || 0;
    const step = slide.getBoundingClientRect().width + gap;
    wrapper.style.transition = animate ? `transform ${cfg.speed || 500}ms ease` : 'none';
    wrapper.style.transform = `translate3d(${-index * step}px,0,0)`;
    dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
    if (prev) prev.classList.toggle('is-disabled', !cfg.loop && index === 0);
    if (next) next.classList.toggle('is-disabled', !cfg.loop && index >= max);
    opts.onChange?.(index, max);
  };

  // Puntos de paginación.
  let dots: HTMLElement[] = [];
  if (cfg.dots) {
    const bar = document.createElement('div');
    bar.className = 'wsg-dots';
    const count = Math.max(1, slides.length - n + 1);
    for (let i = 0; i < count; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'wsg-dot';
      b.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
      b.addEventListener('click', () => go(i));
      bar.append(b);
      dots.push(b);
    }
    container.insertAdjacentElement('afterend', bar);
  }

  for (const [btn, dir] of [[prev, -1], [next, 1]] as const) {
    if (!btn) continue;
    if (!btn.innerHTML.trim()) btn.innerHTML = dir < 0 ? CHEVRON_L : CHEVRON_R;
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', dir < 0 ? 'Anterior' : 'Siguiente');
    btn.addEventListener('click', () => go(index + dir));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go(index + dir);
      }
    });
  }

  // Deslizar con el dedo / arrastrar.
  let startX: number | null = null;
  container.addEventListener('pointerdown', (e) => (startX = e.clientX));
  container.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  });

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = undefined;
  };
  const start = () => {
    if (!cfg.autoplay || slides.length <= n) return;
    stop();
    timer = window.setInterval(() => go(index + 1), Math.max(1500, cfg.interval || 5000));
  };
  el.addEventListener('mouseenter', stop);
  el.addEventListener('mouseleave', start);
  el.addEventListener('focusin', stop);
  el.addEventListener('focusout', start);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) cfg.autoplay = false;

  layout();
  start();
  let raf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layout);
  });
}

export function initCarousels(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-wsg-carousel]').forEach((el) => {
    let cfg: Config;
    try {
      cfg = JSON.parse(el.dataset.wsgCarousel || '{}');
    } catch {
      return;
    }
    delete el.dataset.wsgCarousel;
    if (el.classList.contains('pp-testimonials-carousel')) {
      setupCarousel(el, cfg, { wrapper: el, slides: Array.from(el.children) as HTMLElement[], prev: null, next: null });
    } else {
      setupCarousel(el, cfg);
    }
  });

  // Línea de tiempo horizontal (Timeline Widget Addon).
  root.querySelectorAll<HTMLElement>('.twae-horizontal-timeline').forEach((tl) => {
    const container = tl.querySelector<HTMLElement>('.twae-slider-container');
    const wrapper = tl.querySelector<HTMLElement>('.twae-slider-wrapper');
    if (!container || !wrapper) return;
    const slides = Array.from(wrapper.querySelectorAll<HTMLElement>(':scope > .swiper-slide'));
    const per = Number(container.dataset.slidestoshow) || 2;
    const fill = tl.querySelector<HTMLElement>('.twae-line-fill');
    setupCarousel(container, { slides: per, slidesTablet: Math.min(per, 2), slidesMobile: 1, autoplay: container.dataset.autoplay === 'true', interval: 5000, loop: false, speed: 500, gap: 15, arrows: true, dots: false }, {
      wrapper,
      slides,
      prev: tl.querySelector<HTMLElement>('.twae-button-prev'),
      next: tl.querySelector<HTMLElement>('.twae-button-next'),
      onChange: (i, max) => {
        if (fill) fill.style.width = `${max ? Math.round(((i + 1) / (max + 1)) * 100) : 100}%`;
      },
    });
  });
}
