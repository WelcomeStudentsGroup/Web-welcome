/**
 * Listados de artículos (widget Posts de Elementor Pro): la miniatura se recorta a la
 * proporción definida en CSS. Elementor decide con JavaScript si la imagen se ajusta por
 * alto o por ancho; aquí se replica esa lógica.
 */
export function initPostGrids(root: ParentNode = document) {
  const fit = () => {
    root.querySelectorAll<HTMLElement>('.elementor-posts-container.elementor-has-item-ratio .elementor-post__thumbnail').forEach((box) => {
      const img = box.querySelector<HTMLImageElement>('img');
      if (!img) return;
      const apply = () => {
        if (!img.naturalWidth || !box.offsetWidth) return;
        const boxRatio = box.offsetHeight / box.offsetWidth;
        const imgRatio = img.naturalHeight / img.naturalWidth;
        box.classList.toggle('elementor-fit-height', imgRatio < boxRatio);
      };
      if (img.complete) apply();
      else img.addEventListener('load', apply, { once: true });
    });
  };
  fit();
  window.addEventListener('resize', fit);
  // Resultados de búsqueda que se renderizan después.
  const results = document.getElementById('wsgSearchResults');
  if (results) new MutationObserver(fit).observe(results, { childList: true });
}
