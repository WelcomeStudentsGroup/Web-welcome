/**
 * Control de calidad del build (se ejecuta con `npm run verify` y en CI).
 * Revisa cada página HTML generada en dist/ y falla si encuentra problemas de
 * SEO técnico, enlaces internos rotos, JSON-LD inválido o patrones inseguros.
 * Sin dependencias externas para que funcione en cualquier entorno.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const errors = [];
const warnings = [];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

/** Resuelve una ruta interna (/about/, /x.png, /about/#id) a un archivo de dist/. */
async function resolveInternal(href) {
  const path = decodeURI(href.split('#')[0].split('?')[0]);
  if (path === '') return true;
  const candidates = path.endsWith('/') ? [join(DIST, path, 'index.html')] : [join(DIST, path), join(DIST, path, 'index.html')];
  for (const c of candidates) if (await exists(c)) return true;
  return false;
}

const files = await walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));

for (const required of ['robots.txt', 'sitemap-index.xml', 'llms.txt', 'favicon.svg', 'og-default.png', '_headers']) {
  if (!(await exists(join(DIST, required)))) errors.push(`Falta dist/${required}`);
}

for (const css of files.filter((f) => f.endsWith('.css'))) {
  if (/url\(["']?data:font/.test(await readFile(css, 'utf8'))) errors.push(`${relative(DIST, css)}: fuente incrustada como data: (bloqueada por la CSP)`);
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const ids = new Map();
for (const file of pages) {
  const rel = relative(DIST, file);
  const html = await readFile(file, 'utf8');
  const is404 = rel === '404.html';
  const err = (m) => errors.push(`${rel}: ${m}`);
  const warn = (m) => warnings.push(`${rel}: ${m}`);

  if (!/<html[^>]+lang="[a-z]{2}(-[A-Z]{2})?"/.test(html)) err('falta atributo lang en <html>');

  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? '');
  if (!title) err('falta <title>');
  else if (title.length > 75) warn(`título largo (${title.length} caracteres): "${title}"`);

  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  if (!desc) err('falta meta description');
  else if (desc.length < 70 || desc.length > 170) warn(`meta description de ${desc.length} caracteres (ideal 120–160)`);

  if (!is404 && !/<link rel="canonical" href="https:\/\/[^"]+"/.test(html)) err('falta canonical absoluto');
  if (!/<meta property="og:image" content="https:\/\//.test(html)) err('falta og:image absoluto');

  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) err(`debe tener exactamente un <h1> (tiene ${h1s})`);

  if (!/http-equiv="content-security-policy"/.test(html)) err('falta la CSP');
  if (/\sstyle="/.test(html)) err('contiene atributos style="" (bloqueados por la CSP)');
  if (/\son[a-z]+="/.test(html)) err('contiene manejadores inline (onclick=...)');
  // Astro 7 elimina espacios en saltos de línea junto a elementos: usar {' '}
  for (const m of html.matchAll(/[a-z,.]<a\s|<\/a>[a-z(]/g)) err(`falta un espacio junto a un enlace: …${html.slice(m.index - 30, m.index + 20)}…`);
  if (/href="#"/.test(html)) err('contiene enlaces vacíos href="#"');
  if (/\[(Insert|Placeholder)/i.test(html)) err('contiene texto de relleno [Insert…]/[Placeholder…]');

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      err('JSON-LD inválido');
    }
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) err(`imagen sin alt: ${m[0].slice(0, 80)}`);

  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))
    if (!/rel="[^"]*noopener/.test(m[0])) err(`target=_blank sin rel=noopener: ${m[0].slice(0, 80)}`);

  // ids duplicados (rompen accesibilidad y anclas)
  ids.clear();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) {
    if (ids.has(m[1])) err(`id duplicado: "${m[1]}"`);
    ids.set(m[1], true);
  }

  // enlaces internos rotos
  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    const href = m[1];
    if (href.startsWith('//')) continue;
    if (!(await resolveInternal(href))) err(`enlace interno roto: ${href}`);
  }
  // anclas a la misma página
  for (const m of html.matchAll(/href="\/([^"#]*)#([^"]+)"/g)) {
    const target = join(DIST, m[1], m[1].endsWith('.html') ? '' : 'index.html');
    if (!(await exists(target))) continue;
    const targetHtml = await readFile(target, 'utf8');
    if (!targetHtml.includes(`id="${m[2]}"`)) err(`ancla inexistente: /${m[1]}#${m[2]}`);
  }
}

console.log(`Páginas revisadas: ${pages.length}`);
for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✖  ${e}`);
  console.error(`\n${errors.length} error(es). Corrige antes de desplegar.`);
  process.exit(1);
}
console.log('✔ Build verificado: SEO técnico, enlaces, JSON-LD y seguridad OK.');
