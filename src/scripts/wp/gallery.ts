/**
 * Galería filtrable (Essential Addons "Filterable Gallery"): filtros por categoría y un
 * visor propio (en WordPress lo hacía Magnific Popup): imagen grande sobre fondo oscuro,
 * anterior/siguiente entre las fotos visibles, cierre con ×, Escape o clic fuera.
 */
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

    // Visor.
    const links = Array.from(g.querySelectorAll<HTMLAnchorElement>('a.eael-magnific-link[href]'));
    if (!links.length) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'wsg-lightbox';
    dialog.innerHTML =
      '<div class="wsg-lightbox__inner"><img class="wsg-lightbox__img" alt=""><button type="button" class="wsg-lightbox__btn wsg-lightbox__prev" aria-label="Anterior">‹</button><button type="button" class="wsg-lightbox__btn wsg-lightbox__next" aria-label="Siguiente">›</button><button type="button" class="wsg-lightbox__btn wsg-lightbox__close" aria-label="Cerrar">×</button><span class="wsg-lightbox__counter"></span></div>';
    document.body.append(dialog);
    const img = dialog.querySelector<HTMLImageElement>('img')!;
    const counter = dialog.querySelector<HTMLElement>('.wsg-lightbox__counter')!;
    let list: HTMLAnchorElement[] = [];
    let index = 0;
    const show = (i: number) => {
      if (!list.length) return;
      index = (i + list.length) % list.length;
      const a = list[index];
      img.src = a.href;
      img.alt = a.querySelector('img')?.alt || a.getAttribute('title') || '';
      counter.textContent = list.length > 1 ? `${index + 1} de ${list.length}` : '';
    };
    const open = (a: HTMLAnchorElement) => {
      list = links.filter((l) => !l.closest<HTMLElement>('.eael-filterable-gallery-item-wrap')?.hidden);
      show(Math.max(0, list.indexOf(a)));
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    };
    links.forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        open(a);
      }),
    );
    dialog.querySelector('.wsg-lightbox__prev')!.addEventListener('click', () => show(index - 1));
    dialog.querySelector('.wsg-lightbox__next')!.addEventListener('click', () => show(index + 1));
    dialog.querySelector('.wsg-lightbox__close')!.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target === dialog.firstElementChild) dialog.close();
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  });
}
