/**
 * Convierte el snapshot del WordPress (ver fetch.mjs) en el contenido del sitio Astro.
 *
 *   node scripts/wp-import/convert.mjs
 *
 * Genera:
 *   src/content/wp/site.json           datos globales (categorías, textos de plantillas)
 *   src/content/wp/layout.json         header y footer (HTML limpio)
 *   src/content/wp/templates/*.json    plantillas de artículo y de archivo
 *   src/content/wp/pages/<slug>.json   cada página (HTML limpio + metadatos)
 *   src/content/wp/posts/<slug>.json   cada artículo
 *   public/uploads/**                  imágenes optimizadas (WebP) y PDF
 *   public/wp-css/post-<id>.css        CSS específico de cada página (Elementor)
 *   src/styles/wp/vendor.css           CSS base de Elementor/plugins/tema (una vez)
 *   src/styles/wp/generated.css        clases generadas a partir de estilos inline
 *   src/styles/wp/fontawesome.css      subconjunto de Font Awesome
 */
import { readdir, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { MediaStore } from './lib/media.mjs';
import { rewriteCss, minify } from './lib/css.mjs';
import { applySvgCascade, collectSvgStyles, parseHtml, sanitizeFragment, serialize } from './lib/sanitize.mjs';
import { buildFontAwesome } from './lib/fontawesome.mjs';
import { decodeEntities, exists, localizeUrl, log, readJson, truncateWords, writeJson, writeText } from './lib/util.mjs';

const ROOT = resolve(new URL('../../', import.meta.url).pathname);
const SNAP = process.env.WP_SNAPSHOT ? resolve(process.env.WP_SNAPSHOT) : join(ROOT, 'scripts/wp-import/snapshot');
const CONTENT = join(ROOT, 'src/content/wp');
const PUBLIC = join(ROOT, 'public');
const STYLES = join(ROOT, 'src/styles/wp');

const WHATSAPP = { phone: '61404315695', text: '¡Hola Welcome! Quiero que me llamen, por favor.' };
const WHATSAPP_URL = `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(WHATSAPP.text)}`;
const PRIVACY_URL = '/politica-de-privacidad/';

/** CSS de Elementor que va en todas las páginas (kit global, header, footer). */
const GLOBAL_POST_CSS = new Set([5, 15, 18]);
/** Plantillas de Elementor que no se usan en el sitio estático (popup). */
const SKIP_POST_CSS = new Set([6185]);

/** Archivos CSS base que se vendorizan (ruta dentro del snapshot/css, nombre aplanado). */
const VENDOR_CSS = [
  'normalize.min.css',
  'wp-content_uploads_elementor_css_custom-frontend.min.css',
  'wp-content_plugins_elementor_assets_css_widget-image.min.css',
  'wp-content_plugins_elementor_assets_css_widget-spacer.min.css',
  'wp-content_plugins_elementor_assets_css_widget-heading.min.css',
  'wp-content_plugins_elementor_assets_css_widget-divider.min.css',
  'wp-content_plugins_elementor_assets_css_widget-video.min.css',
  'wp-content_plugins_elementor_assets_css_widget-image-carousel.min.css',
  'wp-content_plugins_elementor_assets_css_widget-social-icons.min.css',
  'wp-content_plugins_elementor_assets_css_conditionals_shapes.min.css',
  'wp-content_plugins_elementor_assets_css_conditionals_e-swiper.min.css',
  'wp-content_plugins_elementor_assets_lib_swiper_v8_css_swiper.min.css',
  'wp-content_uploads_elementor_css_custom-widget-icon-box.min.css',
  'wp-content_uploads_elementor_css_custom-widget-icon-list.min.css',
  'wp-content_uploads_elementor_css_custom-widget-image-box.min.css',
  'wp-content_uploads_elementor_css_custom-widget-progress.min.css',
  'wp-content_uploads_elementor_css_custom-pro-widget-flip-box.min.css',
  'wp-content_uploads_elementor_css_custom-pro-widget-nav-menu.min.css',
  'wp-content_uploads_elementor_css_custom-pro-widget-testimonial-carousel.min.css',
  'wp-content_plugins_elementor-pro_assets_css_widget-form.min.css',
  'wp-content_plugins_elementor-pro_assets_css_widget-posts.min.css',
  'wp-content_plugins_elementor-pro_assets_css_widget-search-form.min.css',
  'wp-content_plugins_elementor-pro_assets_css_widget-animated-headline.min.css',
  'wp-content_plugins_elementor-pro_assets_css_widget-carousel-module-base.min.css',
  'wp-content_uploads_elementor_css_custom-apple-webkit.min.css',
  'wp-content_plugins_elementor_assets_lib_animations_styles_e-animation-grow.min.css',
  'wp-content_plugins_elementor_assets_lib_animations_styles_e-animation-pulse.min.css',
  'wp-content_plugins_elementor_assets_lib_animations_styles_e-animation-float.min.css',
  'wp-content_plugins_elementor_assets_lib_animations_styles_e-animation-bob.min.css',
  'wp-content_plugins_elementor_assets_lib_animations_styles_e-animation-hang.min.css',
  'wp-content_plugins_essential-addons-for-elementor-lite_assets_front-end_css_view_general.min.css',
  'wp-content_plugins_timeline-widget-addon-for-elementor_assets_css_twae-common-styles.min.css',
  'wp-content_plugins_timeline-widget-addon-for-elementor_assets_css_twae-horizontal-timeline.min.css',
  'wp-content_plugins_powerpack-elements_assets_css_min_extensions.min.css',
  'wp-content_plugins_powerpack-elements_assets_css_min_tooltip.min.css',
  'wp-content_themes_jagonzalez_style.css',
];

const htmlFile = (path) => join(SNAP, 'html', (path.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'index').replace(/[^A-Za-z0-9_.-]/g, '_') + '.html');
const cssFile = (name) => join(SNAP, 'css', name);

async function readCssIfExists(name) {
  const p = cssFile(name);
  return (await exists(p)) ? readFile(p, 'utf8') : '';
}

/** IDs de post-N.css y eael-N.css enlazados por un HTML. */
function linkedCss(html) {
  const post = [...html.matchAll(/elementor\/css\/post-(\d+)\.css/g)].map((m) => Number(m[1]));
  const eael = [...html.matchAll(/essential-addons-elementor\/eael-(\d+)\.css/g)].map((m) => Number(m[1]));
  return { post: [...new Set(post)], eael: [...new Set(eael)] };
}

function selectRoot(doc, type) {
  return doc.querySelector(`[data-elementor-type="${type}"]`);
}

async function main() {
  const t0 = Date.now();
  const pages = await readJson(join(SNAP, 'rest/pages.json'));
  const posts = await readJson(join(SNAP, 'rest/posts.json'));
  const categories = await readJson(join(SNAP, 'rest/categories.json'));
  const mediaIndex = await readJson(join(SNAP, 'rest/media.json'));

  const media = new MediaStore({ snapshotDir: SNAP, publicDir: PUBLIC, mediaIndex });
  await media.load();

  // Salida limpia (idempotente): todo lo generado se vuelve a escribir. Las descargas
  // quedan en snapshot/media, así que repetir la conversión sigue siendo rápido.
  for (const dir of [join(CONTENT, 'pages'), join(CONTENT, 'posts'), join(CONTENT, 'templates'), join(PUBLIC, 'wp-css'), join(PUBLIC, 'uploads')]) {
    await rm(dir, { recursive: true, force: true });
  }
  await rm(media.manifestFile, { force: true });
  media.manifest = {};

  const idToPath = new Map();
  for (const p of pages) idToPath.set(p.id, localizeUrl(p.link));
  for (const p of posts) idToPath.set(p.id, localizeUrl(p.link));

  const shared = { inlineStyles: new Map(), faUsed: new Set(), bgImages: new Map(), media, whatsappUrl: WHATSAPP_URL, privacyUrl: PRIVACY_URL, idToPath };
  const newCtx = (extra) => ({ ...shared, extraCss: [], notes: [], imgCount: 0, svgCount: 0, ...extra });

  /** CSS específico de una página: post-N.css + eael-N.css enlazados + reglas extraídas. */
  async function buildPageCss(ids, eaelIds, extraCss, outName) {
    const chunks = [];
    for (const id of ids) {
      if (GLOBAL_POST_CSS.has(id) || SKIP_POST_CSS.has(id)) continue;
      chunks.push(await readCssIfExists(`wp-content_uploads_elementor_css_post-${id}.css`));
    }
    for (const id of eaelIds) chunks.push(await readCssIfExists(`wp-content_uploads_essential-addons-elementor_eael-${id}.css`));
    chunks.push(...extraCss);
    const css = await rewriteCss(chunks.filter(Boolean).join('\n'), media);
    const out = `/wp-css/${outName}.css`;
    await writeText(join(PUBLIC, 'wp-css', `${outName}.css`), minify(css));
    return out;
  }

  // ---------- Header y footer (desde la portada) ----------
  const homeHtml = await readFile(htmlFile('/'), 'utf8');
  const homeDoc = parseHtml(homeHtml);
  const homeSvgStyles = collectSvgStyles(homeDoc);
  const layout = {};
  for (const part of ['header', 'footer']) {
    const root = selectRoot(homeDoc, part);
    const ctx = newCtx({ mode: 'layout', eagerImages: part === 'header' ? 1 : 0 });
    await sanitizeFragment(root, ctx);
    applySvgCascade(root, homeSvgStyles);
    layout[part] = serialize(root);
    log(part, 'listo', ctx.notes.join(', '));
  }
  // Política de privacidad: contenido del popup de Elementor → página propia.
  const popup = selectRoot(homeDoc, 'popup');
  let privacyHtml = '';
  if (popup) {
    const ctx = newCtx({ mode: 'page', eagerImages: 0 });
    await sanitizeFragment(popup, ctx);
    applySvgCascade(popup, homeSvgStyles);
    privacyHtml = serialize(popup);
    layout.privacyCss = await buildPageCss([6185].filter((id) => !GLOBAL_POST_CSS.has(id)), [], ctx.extraCss, 'post-6185-privacidad');
    // El popup lleva su propio id de plantilla: lo exponemos para que el CSS aplique.
    layout.privacyHtml = `<div class="elementor elementor-6185">${privacyHtml}</div>`;
  }
  await writeJson(join(CONTENT, 'layout.json'), layout);

  // ---------- Páginas ----------
  const pageIndex = [];
  for (const p of pages) {
    const path = localizeUrl(p.link);
    const file = htmlFile(path);
    const title = decodeEntities(p.title.rendered);
    if (!(await exists(file))) {
      log('Sin HTML para', path);
      continue;
    }
    const html = await readFile(file, 'utf8');
    const doc = parseHtml(html);
    const svgStyles = collectSvgStyles(doc);
    const root = selectRoot(doc, 'wp-page');
    const ctx = newCtx({ mode: 'page', eagerImages: 1 });
    let body = '';
    let text = '';
    if (root) {
      await sanitizeFragment(root, ctx);
      applySvgCascade(root, svgStyles);
      body = serialize(root);
      text = root.structuredText.replace(/\s+/g, ' ').trim();
    } else {
      log('Página sin contenido de Elementor:', path);
    }
    const { post: cssIds, eael } = linkedCss(html);
    const css = root ? await buildPageCss(cssIds, eael, ctx.extraCss, `post-${p.id}`) : null;
    const docTitle = decodeEntities(doc.querySelector('title')?.text || '').replace(/\s+/g, ' ').trim();
    const rec = {
      id: p.id,
      slug: p.slug,
      path,
      title,
      documentTitle: docTitle,
      description: truncateWords(text.replace(/^Inicio\s+Blog\s+/, ''), 155),
      modified: p.modified,
      published: p.date,
      template: p.template || '',
      css,
      html: body,
      notes: ctx.notes,
    };
    await writeJson(join(CONTENT, 'pages', `${p.slug === 'home' ? 'home' : p.slug}.json`), rec);
    pageIndex.push({ id: p.id, slug: p.slug, path, title, modified: p.modified });
    log('página', path, `${body.length} chars`, ctx.notes.length ? '· ' + ctx.notes.join(', ') : '');
  }

  // ---------- Artículos ----------
  const catById = new Map(categories.map((c) => [c.id, c]));
  let singleTemplate = null;
  const postIndex = [];
  for (const p of posts.sort((a, b) => (a.date < b.date ? 1 : -1))) {
    const path = localizeUrl(p.link);
    const file = htmlFile(path);
    if (!(await exists(file))) {
      log('Sin HTML para el artículo', path);
      continue;
    }
    const html = await readFile(file, 'utf8');
    const doc = parseHtml(html);
    const svgStyles = collectSvgStyles(doc);
    const root = selectRoot(doc, 'single-post');
    const title = decodeEntities(p.title.rendered);

    // Contenido del artículo (ya renderizado por WordPress).
    const contentEl = root.querySelector('.elementor-widget-theme-post-content .elementor-widget-container');
    const ctx = newCtx({ mode: 'content', eagerImages: 0 });
    await sanitizeFragment(contentEl, ctx);
    applySvgCascade(contentEl, svgStyles);
    const contentHtml = serialize(contentEl);
    const contentText = contentEl.structuredText.replace(/\s+/g, ' ').trim();

    // Imagen destacada.
    const feat = root.querySelector('.elementor-widget-theme-post-featured-image img');
    let image = null;
    if (feat) {
      const r = await media.localize(feat.getAttribute('src'));
      image = { src: r.src, width: r.width, height: r.height, alt: feat.getAttribute('alt') || '' };
    }

    // Plantilla de artículo (una sola vez; es la misma para todos).
    if (!singleTemplate) {
      const tctx = newCtx({ mode: 'single', eagerImages: 1 });
      const troot = selectRoot(parseHtml(html), 'single-post');
      await sanitizeFragment(troot, tctx);
      applySvgCascade(troot, svgStyles);
      const { post: cssIds, eael } = linkedCss(html);
      singleTemplate = {
        elementorId: Number(troot.getAttribute('data-elementor-id')) || 21,
        html: serialize(troot),
        css: await buildPageCss(cssIds, eael, tctx.extraCss, 'template-single'),
        notes: tctx.notes,
      };
      await writeJson(join(CONTENT, 'templates', 'single.json'), singleTemplate);
    }

    const excerptText = decodeEntities(p.excerpt?.rendered || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/\[…\]|\[&hellip;\]/g, '…').trim();
    const rec = {
      id: p.id,
      slug: p.slug,
      path,
      title,
      date: p.date,
      modified: p.modified,
      categories: (p.categories || []).map((id) => catById.get(id)?.slug).filter(Boolean),
      excerpt: excerptText,
      description: truncateWords(contentText, 155),
      image,
      html: contentHtml,
      text: contentText,
      notes: ctx.notes,
    };
    await writeJson(join(CONTENT, 'posts', `${p.slug}.json`), rec);
    postIndex.push({ id: p.id, slug: p.slug, path, title, date: p.date });
    log('artículo', path, `${contentHtml.length} chars`);
  }

  // ---------- Plantilla de archivo (categorías y búsqueda) ----------
  const archiveFile = htmlFile('/category/social/');
  if (await exists(archiveFile)) {
    const html = await readFile(archiveFile, 'utf8');
    const adoc = parseHtml(html);
    const root = selectRoot(adoc, 'archive');
    const ctx = newCtx({ mode: 'archive', eagerImages: 1 });
    await sanitizeFragment(root, ctx);
    applySvgCascade(root, collectSvgStyles(adoc));
    const { post: cssIds, eael } = linkedCss(html);
    await writeJson(join(CONTENT, 'templates', 'archive.json'), {
      elementorId: Number(root.getAttribute('data-elementor-id')) || 5472,
      html: serialize(root),
      css: await buildPageCss(cssIds, eael, ctx.extraCss, 'template-archive'),
      notes: ctx.notes,
    });
  }

  // ---------- CSS base (vendor) ----------
  const vendorChunks = [];
  for (const name of VENDOR_CSS) {
    const css = await readCssIfExists(name);
    if (!css) log('Falta en el snapshot:', name);
    vendorChunks.push(`/* ---- ${name} ---- */\n${css}`);
  }
  for (const id of GLOBAL_POST_CSS) vendorChunks.push(`/* ---- post-${id}.css ---- */\n${await readCssIfExists(`wp-content_uploads_elementor_css_post-${id}.css`)}`);
  let vendor = await rewriteCss(vendorChunks.join('\n'), media);
  // La fuente de iconos "eicons" no se carga: se neutralizan sus pseudo-elementos.
  vendor = vendor.replace(/font-family:\s*eicons;?/g, 'font-family:inherit;');
  // El tema traía estilos del traductor de Google que ya no existe.
  vendor = vendor.replace(/#divgtrad[^{]*\{[^}]*\}/g, '');
  await writeText(join(STYLES, 'vendor.css'), '/* CSS base de Elementor, plugins y tema del WordPress original, reescrito por scripts/wp-import (no editar a mano). */\n' + vendor);

  // ---------- CSS adicional del <head> de WordPress ("CSS adicional" del personalizador, etc.) ----------
  // WordPress lo imprimía después de todas las hojas de estilo, así que se carga el último.
  const HEAD_STYLE_IDS = ['global-styles-inline-css', 'classic-theme-styles-inline-css', 'wp-custom-css'];
  const headCss = [];
  for (const id of HEAD_STYLE_IDS) {
    const st = homeDoc.querySelector(`head style#${id}`) || homeDoc.querySelector(`style#${id}`);
    if (st) headCss.push(`/* ---- ${id} ---- */\n${st.text}`);
    else log('No se encontró el bloque <style> del head:', id);
  }
  await writeText(join(PUBLIC, 'wp-css', 'custom.css'), minify(await rewriteCss(headCss.join('\n'), media)));

  // ---------- Clases generadas (estilos inline y fondos de slideshow) ----------
  let generated = '/* Generado por scripts/wp-import: estilos inline del WordPress convertidos a clases, y fondos de slideshow. No editar a mano. */\n';
  for (const [cls, decl] of shared.inlineStyles) generated += `.${cls}{${decl}}\n`;
  for (const [cls, url] of shared.bgImages) {
    const r = await media.localize(url, { maxWidth: 1920, variants: false });
    generated += `.${cls}{background-image:url(${r.src})}\n`;
  }
  await writeText(join(STYLES, 'generated.css'), generated);

  // ---------- Font Awesome (subconjunto) ----------
  const allCss = await readCssIfExists('wp-content_plugins_elementor_assets_lib_font-awesome_css_all.min.css');
  const fa = await buildFontAwesome({ used: shared.faUsed, allCss, snapshotFonts: join(SNAP, 'fonts'), outDir: STYLES });
  log('Font Awesome:', fa.icons, 'iconos en', fa.fonts.join(', '));

  // ---------- Datos globales ----------
  await writeJson(join(CONTENT, 'site.json'), {
    source: 'https://welcomestudentsgroup.com',
    whatsapp: WHATSAPP,
    categories: categories.map((c) => ({ id: c.id, slug: c.slug, name: decodeEntities(c.name), count: c.count, description: c.description || '' })),
    pages: pageIndex,
    posts: postIndex,
  });

  await media.save();
  const uploads = await countFiles(join(PUBLIC, 'uploads'));
  log(`Listo en ${((Date.now() - t0) / 1000).toFixed(1)}s · ${pageIndex.length} páginas · ${postIndex.length} artículos · ${uploads.files} archivos en public/uploads (${(uploads.bytes / 1024 / 1024).toFixed(1)} MB)`);
}

async function countFiles(dir) {
  let files = 0;
  let bytes = 0;
  if (!(await exists(dir))) return { files, bytes };
  for (const e of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (e.isFile()) {
      files++;
      const { size } = await import('node:fs/promises').then((m) => m.stat(join(e.parentPath ?? e.path, e.name)));
      bytes += size;
    }
  }
  return { files, bytes };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
