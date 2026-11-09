/** Fondo de sección en slideshow (Elementor "Background slideshow"): fundido entre imágenes. */
export function initSlideshows(root: ParentNode = document) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll<HTMLElement>('.wsg-slideshow').forEach((show) => {
    const slides = Array.from(show.querySelectorAll<HTMLElement>('.elementor-background-slideshow__slide'));
    if (slides.length < 2 || reduce) return;
    const duration = Number(show.dataset.duration) || 5000;
    show.style.setProperty('--wsg-transition', `${Number(show.dataset.transition) || 500}ms`);
    // Las imágenes a partir de la segunda se cargan después del load (no retrasan la primera pintura).
    const lazy = () => {
      slides.forEach((slide) => {
        const img = slide.querySelector<HTMLElement>('[data-wsg-bg]');
        if (!img) return;
        const url = img.dataset.wsgBg!;
        const pre = new Image();
        pre.onload = () => (img.style.backgroundImage = `url("${url}")`);
        pre.src = url;
        delete img.dataset.wsgBg;
      });
    };
    if (document.readyState === 'complete') lazy();
    else window.addEventListener('load', lazy, { once: true });
    let i = 0;
    window.setInterval(() => {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, duration);
  });
}
