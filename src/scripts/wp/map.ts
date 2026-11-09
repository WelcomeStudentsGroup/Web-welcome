/**
 * Mapa "Elije tu destino" (/estudiar-en-australia/ y /welcome-2/). Reemplaza al app.js del
 * tema jagonzalez: al pulsar una ciudad se muestra su panel "Datos de …", se resalta el
 * estado en el mapa y se desplaza la vista hasta el panel.
 */
export function initMap(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('#contmapainter').forEach((map) => {
    const panels = Array.from(document.querySelectorAll<HTMLElement>('#divcontmapa .divinfomapa'));
    if (!panels.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show = (key: string) => {
      map.querySelectorAll('path.actual').forEach((p) => p.classList.remove('actual'));
      map.querySelector(`path.${key}`)?.classList.add('actual');
      panels.forEach((p) => (p.style.display = p.id === `div${key}` ? 'block' : 'none'));
      document.getElementById(`div${key}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    };
    map.querySelectorAll<HTMLElement>('.estado.click[data-div]').forEach((btn) => {
      const key = btn.dataset.div;
      if (!key) return;
      btn.setAttribute('role', 'button');
      btn.tabIndex = 0;
      const name = btn.querySelector('img')?.alt.split(' ')[0] ?? key;
      btn.setAttribute('aria-label', `Ver datos de ${name}`);
      btn.addEventListener('click', () => show(key));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          show(key);
        }
      });
    });
  });
}
