/** Galería filtrable (Essential Addons "Filterable Gallery"): filtros por categoría. */
export function initGalleries(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.eael-filter-gallery-wrapper').forEach((g) => {
    const controls = Array.from(g.querySelectorAll<HTMLElement>('.eael-filter-gallery-control li[data-filter]'));
    const items = Array.from(g.querySelectorAll<HTMLElement>('.eael-filterable-gallery-item-wrap'));
    controls.forEach((c) => {
      c.setAttribute('role', 'button');
      c.setAttribute('tabindex', '0');
      const apply = () => {
        const filter = c.dataset.filter || '*';
        controls.forEach((o) => o.classList.toggle('active', o === c));
        items.forEach((it) => {
          const show = filter === '*' || it.matches(filter);
          it.hidden = !show;
        });
      };
      c.addEventListener('click', apply);
      c.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          apply();
        }
      });
    });
  });
}
