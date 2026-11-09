/** Fondo de sección en slideshow (Elementor "Background slideshow"): fundido entre imágenes. */
export function initSlideshows(root: ParentNode = document) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll<HTMLElement>('.wsg-slideshow').forEach((show) => {
    const slides = Array.from(show.querySelectorAll<HTMLElement>('.elementor-background-slideshow__slide'));
    if (slides.length < 2 || reduce) return;
    const duration = Number(show.dataset.duration) || 5000;
    show.style.setProperty('--wsg-transition', `${Number(show.dataset.transition) || 500}ms`);
    let i = 0;
    window.setInterval(() => {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, duration);
  });
}
