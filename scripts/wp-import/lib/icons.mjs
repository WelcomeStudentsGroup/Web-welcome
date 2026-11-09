/**
 * Iconos de Elementor (eicons) usados por el sitio, como SVG inline.
 * Elementor los dibuja con una fuente de iconos; aquí se reemplazan por SVG para
 * no cargar la fuente completa (y para que funcionen con la CSP estricta).
 * Trazos propios, 24x24, rellenos con currentColor.
 */
export const EICONS = {
  'eicon-chevron-left': '<path d="M15.5 4.5 8 12l7.5 7.5 1.4-1.4L10.8 12l6.1-6.1z"/>',
  'eicon-chevron-right': '<path d="m8.5 4.5-1.4 1.4L13.2 12l-6.1 6.1 1.4 1.4L16 12z"/>',
  'eicon-star': '<path d="m12 2.5 2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.6 6 21l1.3-6.8-5-4.7 6.8-.8z"/>',
  'eicon-play': '<path d="M7 4.5v15l12-7.5z"/>',
  'eicon-menu-bar': '<path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>',
  'eicon-close': '<path d="m6.4 5 12.6 12.6-1.4 1.4L5 6.4z"/><path d="M19 6.4 6.4 19 5 17.6 17.6 5z"/>',
};

export function eiconSvg(name, extraClass = '') {
  const body = EICONS[name];
  if (!body) return null;
  return `<svg class="wsg-eicon ${name}${extraClass ? ' ' + extraClass : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}
