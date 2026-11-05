/**
 * Descarga un "snapshot" del WordPress original (welcomestudentsgroup.com) para
 * convertirlo después con convert.mjs. No necesita credenciales: usa la API REST
 * pública y el HTML que ve cualquier visitante.
 *
 *   node scripts/wp-import/fetch.mjs            # todo
 *   node scripts/wp-import/fetch.mjs --no-html  # solo API REST y CSS
 *
 * Estructura de scripts/wp-import/snapshot/ (ignorada por git):
 *   rest/{pages,posts,categories,media}.json
 *   html/<ruta>.html      (la ruta "/" es index.html; "/a/b/" es a__b.html)
 *   css/<ruta-aplanada>.css
 *   fonts/fa-*.woff2       (Font Awesome, para el subconjunto)
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { SOURCE, log } from './lib/util.mjs';

const execFileP = promisify(execFile);
const SNAP = resolve(new URL('./snapshot', import.meta.url).pathname);
const UA = 'Mozilla/5.0 (site-migration; +https://welcomestudentsgroup.com)';

async function curl(url, dest) {
  await mkdir(join(dest, '..'), { recursive: true });
  await execFileP('curl', ['-sS', '-L', '--fail', '--retry', '3', '-A', UA, '-o', dest, url]);
}

async function restAll(type, fields) {
  const out = [];
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page++) {
    const url = `${SOURCE}/wp-json/wp/v2/${type}?per_page=100&page=${page}${fields ? `&_fields=${fields}` : ''}`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status === 400) break; // página fuera de rango
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    // WordPress puede devolver menos de 100 por página (adjuntos privados): usar el total real.
    totalPages = Number(res.headers.get('x-wp-totalpages')) || totalPages;
    out.push(...(await res.json()));
  }
  return out;
}

const fileName = (path) => (path.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'index').replace(/[^A-Za-z0-9_.-]/g, '_');

async function main() {
  const withHtml = !process.argv.includes('--no-html');
  await mkdir(join(SNAP, 'rest'), { recursive: true });

  log('API REST…');
  const pages = await restAll('pages');
  const posts = await restAll('posts');
  const categories = await restAll('categories');
  const media = await restAll('media', 'id,slug,source_url,media_type,mime_type,alt_text,title,media_details,post');
  await writeFile(join(SNAP, 'rest/pages.json'), JSON.stringify(pages));
  await writeFile(join(SNAP, 'rest/posts.json'), JSON.stringify(posts));
  await writeFile(join(SNAP, 'rest/categories.json'), JSON.stringify(categories));
  await writeFile(join(SNAP, 'rest/media.json'), JSON.stringify(media));
  log(`${pages.length} páginas, ${posts.length} artículos, ${categories.length} categorías, ${media.length} medios`);

  // URLs públicas: páginas, artículos, categorías (con paginación), blog/career paginados y búsqueda.
  const paths = new Set(['/']);
  for (const p of pages) paths.add(new URL(p.link).pathname);
  for (const p of posts) paths.add(new URL(p.link).pathname);
  for (const c of categories) {
    paths.add(`/category/${c.slug}/`);
    for (let n = 2; n <= Math.ceil(c.count / 10); n++) paths.add(`/category/${c.slug}/page/${n}/`);
  }
  for (const base of ['/blog/', '/career/']) for (let n = 2; n <= Math.ceil(posts.length / 9); n++) paths.add(`${base}${n}/`);
  paths.add('/?s=visa');

  const cssUrls = new Set();
  if (withHtml) {
    for (const path of paths) {
      const dest = join(SNAP, 'html', fileName(path) + '.html');
      try {
        await curl(SOURCE + path, dest);
        const html = await import('node:fs/promises').then((m) => m.readFile(dest, 'utf8'));
        for (const m of html.matchAll(/<link rel=['"]stylesheet['"][^>]*href=['"]([^'"]+)['"]/g)) {
          const u = m[1].split('?')[0];
          if (u.startsWith(SOURCE)) cssUrls.add(u);
        }
        log('html', path);
      } catch (e) {
        log('ERROR html', path, e.message.split('\n')[0]);
      }
    }
  }
  for (const u of cssUrls) {
    const name = u.slice(SOURCE.length + 1).replace(/[^A-Za-z0-9_.-]/g, '_');
    await curl(u, join(SNAP, 'css', name));
  }
  log(`${cssUrls.size} hojas de estilo`);

  // normalize.css (el tema lo cargaba desde cdnjs; se vendoriza para no depender de terceros).
  await curl('https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css', join(SNAP, 'css', 'normalize.min.css'));
  for (const f of ['fa-solid-900.woff2', 'fa-regular-400.woff2', 'fa-brands-400.woff2']) {
    await curl(`${SOURCE}/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/${f}`, join(SNAP, 'fonts', f));
  }
  log('Snapshot listo en', SNAP);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
