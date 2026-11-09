/**
 * Reescritura de CSS de Elementor para el sitio estático:
 * - Fuentes: las familias de Google Fonts pasan a las auto-hospedadas de @fontsource
 *   (nombres "… Variable"); "Archer" (fuente comercial sin licencia web en el repo) se
 *   sustituye por Roboto Slab y "Gotham Rounded" por Montserrat.
 * - Se eliminan @font-face y @import externos.
 * - Las url() de imágenes del origen pasan a copias optimizadas en public/.
 */
const FONT_MAP = [
  [/(["'])Roboto Slab\1/g, '"Roboto Slab Variable"'],
  [/(["'])Roboto\1/g, '"Roboto Variable"'],
  [/(["'])Montserrat\1/g, '"Montserrat Variable"'],
  [/(["'])Raleway\1/g, '"Raleway Variable"'],
  [/(["'])Archer\1/g, '"Roboto Slab Variable"'],
  [/(["'])Gotham Rounded\1/g, '"Montserrat Variable"'],
];

export function renameFonts(css) {
  let out = css;
  for (const [re, to] of FONT_MAP) out = out.replace(re, to);
  return out;
}

export function stripFontFaces(css) {
  return css
    .replace(/\/\* Start Custom Fonts CSS \*\/[\s\S]*?\/\* End Custom Fonts CSS \*\//g, '')
    .replace(/@font-face\s*\{[^}]*\}/g, '')
    .replace(/@import\s+url\([^)]*\)[^;]*;/g, '');
}

/**
 * Reemplaza cada url(...) que apunte al origen por su copia local optimizada.
 * @param {string} css
 * @param {import('./media.mjs').MediaStore} media
 */
export async function localizeUrls(css, media, opts = {}) {
  const re = /url\(\s*(["']?)([^"')]+)\1\s*\)/g;
  const found = new Map();
  for (const m of css.matchAll(re)) {
    const raw = m[2].trim();
    if (raw.startsWith('data:') || raw.startsWith('#')) continue;
    if (!media.isSiteAsset(raw)) continue;
    found.set(raw, null);
  }
  for (const raw of found.keys()) {
    const r = await media.localize(raw, { maxWidth: opts.maxWidth ?? 1600, variants: false, quality: 72 });
    found.set(raw, r.src);
  }
  return css.replace(re, (all, _q, raw) => {
    const to = found.get(raw.trim());
    return to ? `url(${to})` : all;
  });
}

export async function rewriteCss(css, media, opts = {}) {
  // Comentarios (incluidos los anidados del tema, que dejaban un "*/" suelto) y errores de
  // sintaxis del CSS personalizado ("!import" por "!important").
  let out = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\*\//g, '').replace(/!import\b(?!ant)/g, '!important');
  out = stripFontFaces(out);
  out = renameFonts(out);
  out = await localizeUrls(out, media, opts);
  // Reglas con plantillas sin renderizar ("{{ID}}", un fallo del plugin PowerPack) que rompen el parser.
  out = out.replace(/[^{}]*\{\{[^{}]*\}\}[^{}]*\{[^{}]*\}/g, '');
  out = out.replace(/\s+\/\*# sourceURL=[^*]*\*\//g, '');
  // Bloques vacíos ("{}" sueltos o reglas sin declaraciones) que el minificador rechaza.
  out = out.replace(/(^|[{};])\s*\{\s*\}/g, '$1');
  out = out.replace(/[^{}]+\{\s*\}/g, '');
  return out.trim() + '\n';
}

/** Minificación conservadora (comentarios y espacios). */
export function minify(css) {
  return css
    .replace(/\/\*(?!!)[\s\S]*?\*\//g, '')
    .replace(/\s*\n\s*/g, '')
    .replace(/\s*([{};:,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}
