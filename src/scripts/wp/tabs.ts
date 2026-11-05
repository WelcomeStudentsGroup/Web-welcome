/** Pestañas (Essential Addons "Advanced Tabs"). */
export function initTabs(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.eael-advance-tabs').forEach((tabs) => {
    const triggers = Array.from(tabs.querySelectorAll<HTMLElement>('.eael-tabs-nav .eael-tab-item-trigger'));
    const panels = Array.from(tabs.querySelectorAll<HTMLElement>(':scope > .eael-tabs-content > .eael-tab-content-item'));
    if (!triggers.length || !panels.length) return;
    const activate = (idx: number) => {
      triggers.forEach((t, i) => {
        t.classList.toggle('active', i === idx);
        t.setAttribute('aria-selected', String(i === idx));
        t.setAttribute('tabindex', i === idx ? '0' : '-1');
      });
      panels.forEach((p, i) => {
        p.classList.toggle('active', i === idx);
        p.hidden = i !== idx;
      });
    };
    triggers.forEach((t, i) => {
      t.setAttribute('role', 'tab');
      t.addEventListener('click', () => activate(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(i);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + triggers.length) % triggers.length;
          activate(next);
          triggers[next].focus();
        }
      });
    });
    panels.forEach((p) => p.setAttribute('role', 'tabpanel'));
    // Essential Addons marca la pestaña inicial con "active-default" (y el resto "inactive").
    const initial = triggers.findIndex((t) => t.classList.contains('active-default') || t.classList.contains('active'));
    triggers.forEach((t) => t.classList.remove('active-default', 'inactive'));
    panels.forEach((p) => p.classList.remove('active-default', 'inactive'));
    activate(Math.max(0, initial));
  });
}
