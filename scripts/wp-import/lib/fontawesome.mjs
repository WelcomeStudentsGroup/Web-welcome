/**
 * Subconjunto de Font Awesome 5 Free con solo los iconos que usa el sitio.
 * Las fuentes (OFL 1.1) se recortan con subset-font; el CSS resultante se escribe en
 * src/styles/wp/fontawesome.css. Así no se cargan ~1.500 iconos ni CSS de 60 KB.
 */
import subsetFont from 'subset-font';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { writeText } from './util.mjs';

const FONTS = {
  fas: { file: 'fa-solid-900.woff2', family: 'Font Awesome 5 Free', weight: 900 },
  far: { file: 'fa-regular-400.woff2', family: 'Font Awesome 5 Free', weight: 400 },
  fab: { file: 'fa-brands-400.woff2', family: 'Font Awesome 5 Brands', weight: 400 },
};

/**
 * @param {object} o
 * @param {Set<string>} o.used       iconos usados en <i class="fa…"> ("fas:fa-check")
 * @param {string} o.allCss          all.min.css de Font Awesome (para los puntos de código)
 * @param {string[]} [o.siteCss]     CSS del sitio: se buscan glifos puestos con content:"\fXXX"
 * @param {string} o.snapshotFonts   carpeta con los woff2 originales
 * @param {string} o.outDir          carpeta de salida (src/styles/wp)
 */
export async function buildFontAwesome({ used, allCss, siteCss = [], snapshotFonts, outDir }) {
  const codepoints = new Map();
  for (const m of allCss.matchAll(/\.(fa-[a-z0-9-]+):before\{content:"\\([0-9a-f]+)"\}/g)) codepoints.set(m[1], parseInt(m[2], 16));

  const perFont = { fas: new Set(), far: new Set(), fab: new Set() };
  const rules = new Map();
  for (const entry of used) {
    const [prefix, icon] = entry.split(':');
    const cp = codepoints.get(icon);
    if (!cp) continue;
    const key = prefix === 'fa' ? 'fas' : prefix;
    if (!perFont[key]) continue;
    perFont[key].add(String.fromCodePoint(cp));
    rules.set(icon, cp.toString(16));
  }
  // Glifos que el CSS pinta con pseudoelementos (p. ej. las comillas del testimonio, \f10e).
  let cssGlyphs = 0;
  for (const css of siteCss) {
    for (const block of css.matchAll(/\{([^{}]*content:\s*"\\(f[0-9a-f]{3})"[^{}]*)\}/gi)) {
      const decls = block[1];
      const cp = parseInt(block[2], 16);
      const ch = String.fromCodePoint(cp);
      const brands = /Font Awesome 5 Brands/i.test(decls);
      const regular = /font-weight:\s*400/.test(decls) && !/font-weight:\s*900/.test(decls);
      (brands ? perFont.fab : regular ? perFont.far : perFont.fas).add(ch);
      cssGlyphs++;
    }
  }

  let css = `/* Font Awesome Free 5 — subconjunto generado por scripts/wp-import (solo los iconos usados).
   Fuentes: SIL OFL 1.1 · CSS: MIT · https://fontawesome.com/license/free */
.fa,.fas,.far,.fab{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font-style:normal;font-variant:normal;text-rendering:auto;line-height:1}
.fa,.fas{font-family:"Font Awesome 5 Free";font-weight:900}
.far{font-family:"Font Awesome 5 Free";font-weight:400}
.fab{font-family:"Font Awesome 5 Brands";font-weight:400}
`;
  for (const [key, chars] of Object.entries(perFont)) {
    if (!chars.size) continue;
    const f = FONTS[key];
    const buf = await readFile(join(snapshotFonts, f.file));
    const sub = await subsetFont(buf, [...chars].join(''), { targetFormat: 'woff2' });
    await writeText(join(outDir, 'fonts', f.file), sub);
    css += `@font-face{font-family:"${f.family}";font-style:normal;font-weight:${f.weight};font-display:block;src:url(./fonts/${f.file}) format("woff2")}\n`;
  }
  for (const [icon, hex] of [...rules.entries()].sort()) css += `.${icon}:before{content:"\\${hex}"}\n`;
  await writeText(join(outDir, 'fontawesome.css'), css);
  return { icons: rules.size, cssGlyphs, fonts: Object.entries(perFont).filter(([, s]) => s.size).map(([k]) => k) };
}
