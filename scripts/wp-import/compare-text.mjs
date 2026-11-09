/**
 * Control de fidelidad: compara el texto visible de cada URL del WordPress (snapshot)
 * con el de la página generada en dist/. Informa las frases que faltan o sobran.
 *
 *   node scripts/wp-import/compare-text.mjs            # resumen
 *   node scripts/wp-import/compare-text.mjs --verbose  # detalle por URL
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parse } from 'node-html-parser';

const ROOT = resolve(new URL('../../', import.meta.url).pathname);
const SNAP = join(ROOT, 'scripts/wp-import/snapshot/html');
const DIST = process.env.WP_DIST ? resolve(process.env.WP_DIST) : join(ROOT, 'dist');
const verbose = process.argv.includes('--verbose');

const OPTS = { comment: false, blockTextElements: { script: true, noscript: true, style: true } };

function textOf(html, { live }) {
  const doc = parse(html, OPTS);
  doc.querySelectorAll('script, style, noscript, svg, iframe, template, .elementor-screen-only, .screen-reader-text, .hp-field, #divgtrad, #google_language_translator, .joinchat, .skip-link, [data-elementor-type="popup"], .elementor-location-popup, .wsg-whatsapp').forEach((e) => e.remove());
  const root = live ? doc.querySelector('body') : doc.querySelector('body');
  let text = (root?.structuredText || '').replace(/ /g, ' ');
  // Frases (líneas) normalizadas.
  return text
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 1);
}

const norm = (s) => s.toLowerCase().replace(/[\u200b\u200c\u200d\ufeff]/g, '').replace(/[“”"']/g, '').replace(/\s+/g, ' ').trim();

const files = (await readdir(SNAP)).filter((f) => f.endsWith('.html') && !f.startsWith('_s_') && f !== '404.html');
let totalMissing = 0;
let totalExtra = 0;
const report = [];
for (const f of files.sort()) {
  const path = f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '').replace(/__/g, '/') + '/';
  let distFile = join(DIST, path, 'index.html');
  try {
    await readFile(distFile);
  } catch {
    report.push(`✖ ${path}: no existe en dist/`);
    continue;
  }
  const live = textOf(await readFile(join(SNAP, f), 'utf8'), { live: true });
  if (live.length < 5) continue; // respuesta vacía o error del WordPress (p. ej. un 404)
  const local = textOf(await readFile(distFile, 'utf8'), { live: false });
  // Una frase cuenta como presente si aparece (como subcadena) en el texto completo de la otra
  // versión: así no influyen las diferencias de salto de línea entre WordPress y Astro.
  const localAll = ' ' + norm(local.join(' ')) + ' ';
  const liveAll = ' ' + norm(live.join(' ')) + ' ';
  const missing = live.filter((l) => !localAll.includes(norm(l)));
  const extra = local.filter((l) => !liveAll.includes(norm(l)));
  totalMissing += missing.length;
  totalExtra += extra.length;
  const mark = missing.length ? '✖' : '✔';
  report.push(`${mark} ${path}: ${live.length} frases en WordPress · faltan ${missing.length} · nuevas ${extra.length}`);
  if (verbose || missing.length) {
    for (const m of missing.slice(0, 12)) report.push(`     − ${m.slice(0, 140)}`);
    if (verbose) for (const e of extra.slice(0, 8)) report.push(`     + ${e.slice(0, 140)}`);
  }
}
console.log(report.join('\n'));
console.log(`\nURLs comparadas: ${files.length} · frases faltantes: ${totalMissing} · frases nuevas: ${totalExtra}`);
