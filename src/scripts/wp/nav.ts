/**
 * Menú de navegación (widget Nav Menu de Elementor Pro, sin su JavaScript):
 * - Botón hamburguesa: abre/cierra el menú desplegable en tablet y móvil.
 * - Flechas (.sub-arrow) y enlaces sin href: abren/cierran submenús (táctil y teclado).
 * - En escritorio los submenús también se abren al pasar el cursor (CSS).
 */
export function initNav(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.elementor-widget-nav-menu').forEach((widget) => {
    const toggle = widget.querySelector<HTMLElement>('.elementor-menu-toggle');
    const dropdown = widget.querySelector<HTMLElement>('nav.elementor-nav-menu--dropdown');
    if (toggle && dropdown) {
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('aria-label', 'Menú');
      toggle.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      // Como la opción "stretch" de Elementor: el desplegable ocupa todo el ancho de la cabecera.
      const stretch = () => {
        const section = widget.closest<HTMLElement>('.elementor-section') ?? widget.closest<HTMLElement>('header');
        if (!section) return;
        const sr = section.getBoundingClientRect();
        const wr = widget.getBoundingClientRect();
        const tr = toggle.getBoundingClientRect();
        dropdown.style.left = `${sr.left - wr.left}px`;
        dropdown.style.width = `${sr.width}px`;
        dropdown.style.top = `${tr.bottom - wr.top}px`;
      };
      const setOpen = (open: boolean) => {
        if (open) stretch();
        toggle.classList.toggle('elementor-active', open);
        toggle.setAttribute('aria-expanded', String(open));
        dropdown.classList.toggle('elementor-nav-menu--active', open);
        dropdown.setAttribute('aria-hidden', String(!open));
      };
      window.addEventListener('resize', () => {
        if (toggle.classList.contains('elementor-active')) stretch();
      });
      toggle.addEventListener('click', () => setOpen(!toggle.classList.contains('elementor-active')));
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(!toggle.classList.contains('elementor-active'));
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
      });
    }

    // Submenús.
    widget.querySelectorAll<HTMLElement>('li.menu-item-has-children').forEach((item) => {
      const link = item.querySelector<HTMLElement>(':scope > a');
      const arrow = item.querySelector<HTMLElement>(':scope > a > .sub-arrow');
      if (!link) return;
      const toggleItem = (force?: boolean) => {
        const open = force ?? !item.classList.contains('wsg-open');
        item.classList.toggle('wsg-open', open);
        link.setAttribute('aria-expanded', String(open));
      };
      link.setAttribute('aria-expanded', 'false');
      link.setAttribute('aria-haspopup', 'true');
      if (!link.hasAttribute('href')) {
        link.setAttribute('role', 'button');
        link.setAttribute('tabindex', '0');
        link.addEventListener('click', (e) => {
          e.preventDefault();
          toggleItem();
        });
        link.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleItem();
          }
        });
      }
      arrow?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem();
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && item.classList.contains('wsg-open')) {
          toggleItem(false);
          link.focus();
        }
      });
    });
  });

  // Cerrar submenús al hacer clic fuera.
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    document.querySelectorAll<HTMLElement>('li.menu-item-has-children.wsg-open').forEach((item) => {
      if (!item.contains(target)) {
        item.classList.remove('wsg-open');
        item.querySelector(':scope > a')?.setAttribute('aria-expanded', 'false');
      }
    });
  });
}
