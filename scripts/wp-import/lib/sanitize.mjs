/**
 * Limpieza del HTML que genera Elementor para que sirva como contenido estático:
 *
 * - Elimina scripts, estilos inline, atributos de edición y clases de animación
 *   (el contenido queda visible sin JavaScript y cumple la CSP estricta).
 * - Convierte cada `style="…"` en una clase CSS generada (`wsg-s-xxxx`).
 * - Reemplaza los widgets que dependían de JavaScript/terceros por equivalentes
 *   estáticos: video de YouTube → fachada con imagen; fondo en slideshow → marcado
 *   propio; fondo de video → imagen del video; HTML embebido (formulario del CRM) →
 *   iframe limpio; Eventbrite → enlace.
 * - Deja marcadores (`<wsg-posts>`, `<wsg-post-title>`, …) donde el contenido es
 *   dinámico (listado de artículos, título del artículo, formulario del footer).
 * - Localiza enlaces e imágenes (originales optimizados en /uploads/).
 */
import { parse } from 'node-html-parser';
import { eiconSvg } from './icons.mjs';
import { escapeAttr, hash, localizeUrl } from './util.mjs';

const DROP_ATTRS = new Set([
  'data-settings', 'data-id', 'data-element_type', 'data-e-type', 'data-widget_type', 'data-model-cid', 'data-elementor-id',
  'data-elementor-post-type', 'data-elementor-type', 'decoding', 'fetchpriority', 'srcset', 'sizes', 'data-gallery-items',
  'data-breakpoints', 'data-custom_default_control', 'data-default_control_key', 'data-first-init', 'data-load-more-status',
  'data-slider-settings', 'data-elementor-open-lightbox', 'data-elementor-lightbox-slideshow', 'data-elementor-lightbox-title',
  'data-elementor-lightbox-description', 'data-e-action-hash', 'data-search-categories', 'data-eael-fg-tags', 'itemscope',
  'itemtype', 'itemprop', 'data-pp-animation', 'data-twae-settings', 'data-particle_enable', 'data-particle-mobile-disabled', 'aria-current',
]);
const DROP_CLASSES = new Set(['elementor-invisible', 'animated', 'animated-slow', 'animated-fast', 'fadeIn', 'fadeInUp', 'fadeInDown',
  'fadeInLeft', 'fadeInRight', 'zoomIn', 'zoomInUp', 'slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight', 'bounceIn',
  'bounceInUp', 'bounceInDown', 'rollIn', 'lightSpeedIn', 'rotateIn', 'current-menu-item', 'current_page_item', 'current-menu-ancestor',
  'current-menu-parent', 'current_page_parent', 'current_page_ancestor', 'elementor-item-active']);

export const PARSE_OPTS = { comment: false, blockTextElements: { script: true, noscript: true, style: true, pre: true } };

export function parseHtml(html) {
  // "</br>" no existe en HTML, pero los navegadores lo tratan como "<br>"; el parser lo descartaría.
  return parse(html.replace(/<\/br\s*>/gi, '<br>'), PARSE_OPTS);
}

/**
 * Los <style> dentro de los SVG inline aplican a TODO el documento (no solo a su SVG), así que
 * en WordPress el color real de un icono era el de la ÚLTIMA regla ".st0{fill:…}" de la página.
 * Para reproducir exactamente lo que se veía, se recogen las reglas en orden de documento…
 */
export function collectSvgStyles(doc) {
  return doc.querySelectorAll('svg style').map((st) => st.text || '');
}

/** …y se aplican como atributos (fill, stroke…) a los elementos de los SVG del fragmento. */
export function applySvgCascade(root, styleTexts) {
  const props = new Map(); // clase → { prop: valor } (la última regla del documento gana)
  for (const css of styleTexts) {
    for (const rule of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const decls = rule[2].split(';').map((d) => d.trim()).filter(Boolean);
      for (const sel of rule[1].split(',').map((x) => x.trim())) {
        const m = sel.match(/^[a-z]*\.([A-Za-z0-9_-]+)$/);
        if (!m) continue;
        const bag = props.get(m[1]) || {};
        for (const d of decls) {
          const i = d.indexOf(':');
          if (i < 0) continue;
          const prop = d.slice(0, i).trim();
          const val = d.slice(i + 1).trim().replace(/\s*!important/, '');
          if (/^(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-miterlimit|opacity|fill-opacity|stroke-opacity|fill-rule|clip-rule|stroke-dasharray)$/.test(prop)) bag[prop] = val;
        }
        props.set(m[1], bag);
      }
    }
  }
  for (const [cls, bag] of props) {
    for (const el of root.querySelectorAll(`svg .${cls}`)) {
      for (const [prop, val] of Object.entries(bag)) el.setAttribute(prop, val);
    }
  }
  return props.size;
}

const insideSvg = (el) => {
  for (let p = el.parentNode; p; p = p.parentNode) if (p.rawTagName && p.rawTagName.toLowerCase() === 'svg') return true;
  return false;
};

function readSettings(el) {
  const raw = el.getAttribute('data-settings');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function youtubeId(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

/** Hace únicos los ids internos de un SVG (los degradados/clips se referencian con url(#id)). */
function uniqueSvgIds(svg, ctx) {
  const suffix = '-' + (++ctx.svgCount).toString(36);
  const raw = svg.outerHTML;
  const referenced = new Set();
  for (const m of raw.matchAll(/url\(#([^)"']+)\)|xlink:href="#([^"]+)"|href="#([^"]+)"/g)) referenced.add(m[1] || m[2] || m[3]);
  const all = [svg, ...svg.querySelectorAll('[id]')];
  const renames = new Map();
  for (const el of all) {
    const id = el.getAttribute('id');
    if (!id) continue;
    if (referenced.has(id)) {
      renames.set(id, id + suffix);
      el.setAttribute('id', id + suffix);
    } else el.removeAttribute('id');
  }
  if (renames.size) {
    let html = svg.outerHTML;
    for (const [from, to] of renames) {
      html = html.replace(new RegExp(`url\\(#${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'), `url(#${to})`);
      html = html.replace(new RegExp(`(xlink:)?href="#${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'), `$1href="#${to}"`);
    }
    svg.replaceWith(html);
  }
}

function styleToClass(style, ctx) {
  const norm = style.replace(/\s+/g, ' ').replace(/\s*;\s*/g, ';').replace(/\s*:\s*/g, ':').trim().replace(/;?$/, ';');
  if (!norm || norm === ';') return null;
  const cls = 'wsg-s-' + hash(norm, 6);
  if (!ctx.inlineStyles.has(cls)) ctx.inlineStyles.set(cls, norm);
  return cls;
}

function carouselSettings(s, defaults = {}) {
  const num = (v, d) => (v === undefined || v === null || v === '' ? d : Number(v));
  const bool = (v, d) => (v === undefined || v === null || v === '' ? d : v === 'yes' || v === true || v === 'true');
  return {
    slides: num(s.slides_to_show ?? s.slides_per_view, defaults.slides ?? 1),
    slidesTablet: num(s.slides_to_show_tablet ?? s.slides_per_view_tablet, defaults.slidesTablet ?? null),
    slidesMobile: num(s.slides_to_show_mobile ?? s.slides_per_view_mobile, defaults.slidesMobile ?? 1),
    autoplay: bool(s.autoplay, defaults.autoplay ?? true),
    interval: num(s.autoplay_speed, 5000),
    loop: bool(s.infinite ?? s.loop, true),
    speed: num(s.speed, 500),
    gap: num(s.space_between?.size, defaults.gap ?? 10),
    arrows: s.navigation ? s.navigation !== 'none' && s.navigation !== 'dots' : bool(s.show_arrows ?? s.arrows, true),
    dots: s.navigation ? s.navigation === 'dots' || s.navigation === 'both' : bool(s.pagination ?? s.dots, false),
  };
}

/**
 * @param {import('node-html-parser').HTMLElement} root
 * @param {object} ctx
 */
export async function sanitizeFragment(root, ctx) {
  ctx.svgCount ??= 0;
  ctx.imgCount ??= 0;
  ctx.eagerImages ??= 1;
  ctx.extraCss ??= [];
  ctx.notes ??= [];

  root.querySelectorAll('script, noscript, link, meta, template').forEach((e) => e.remove());

  // ---- Widgets HTML embebido (formulario del CRM, Eventbrite) ----
  for (const w of root.querySelectorAll('.elementor-widget-html')) {
    const cont = w.querySelector('.elementor-widget-container');
    if (!cont) continue;
    const crm = w.querySelector('iframe[src*="access.welcomestudentsgroup.com/widget/form/"]');
    if (crm) {
      const src = crm.getAttribute('src');
      const title = crm.getAttribute('title') || 'Formulario de contacto';
      const h = crm.getAttribute('data-height') || '837';
      cont.set_content(
        `<div class="wsg-crm-form"><iframe src="${escapeAttr(src)}" title="${escapeAttr(title)}" loading="lazy" height="${escapeAttr(h)}"></iframe></div>`,
      );
      ctx.notes.push('crm-form:' + src);
      continue;
    }
    if (w.outerHTML.includes('eventbrite')) {
      const id = w.outerHTML.match(/eventbrite-widget-container-(\d+)/)?.[1];
      const url = id ? `https://www.eventbrite.com.au/e/${id}` : 'https://www.eventbrite.com.au/';
      cont.set_content(
        `<div class="elementor-button-wrapper wsg-eventbrite"><a class="elementor-button elementor-button-link elementor-size-md" href="${url}" target="_blank" rel="noopener"><span class="elementor-button-content-wrapper"><span class="elementor-button-text">Eventbrite</span></span></a></div>`,
      );
      ctx.notes.push('eventbrite:' + url);
      continue;
    }
    ctx.notes.push('html-widget-kept:' + (cont.text || '').trim().slice(0, 60));
  }

  // ---- Shortcodes de terceros (Google Translate) ----
  for (const w of root.querySelectorAll('.elementor-widget-shortcode')) {
    if (w.querySelector('#google_language_translator, #flags')) w.remove();
  }
  root.querySelectorAll('#divgtrad, #google_language_translator, #flags').forEach((e) => e.remove());

  // ---- Video (YouTube) → fachada con imagen; se carga al hacer clic ----
  for (const w of root.querySelectorAll('.elementor-widget-video')) {
    const s = readSettings(w) || {};
    const id = youtubeId(s.youtube_url || '');
    const cont = w.querySelector('.elementor-widget-container');
    if (!id || !cont) continue;
    const poster = s.image_overlay?.url || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
    const embed = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${s.loop === 'yes' ? `&loop=1&playlist=${id}` : ''}`;
    cont.set_content(
      `<div class="elementor-wrapper elementor-open-inline"><div class="elementor-video"></div><div class="elementor-custom-embed-image-overlay wsg-video-facade" data-video="${escapeAttr(embed)}" role="button" tabindex="0" aria-label="Reproducir vídeo"><img src="${escapeAttr(poster)}" alt="" class="wsg-video-poster" data-wsg-external="1"><div class="elementor-custom-embed-play">${eiconSvg('eicon-play')}</div></div></div>`,
    );
  }

  // ---- Fondos de sección: slideshow y video ----
  for (const sec of root.querySelectorAll('[data-settings]')) {
    const s = readSettings(sec);
    if (!s) continue;
    const id = (sec.getAttribute('class') || '').match(/elementor-element-([a-z0-9]+)/)?.[1];
    if (s.background_background === 'slideshow' && Array.isArray(s.background_slideshow_gallery) && s.background_slideshow_gallery.length) {
      const slides = s.background_slideshow_gallery
        .map((g, i) => {
          const cls = 'wsg-bg-' + hash(g.url, 6);
          ctx.bgImages.set(cls, g.url);
          return `<div class="elementor-background-slideshow__slide swiper-slide${i === 0 ? ' is-active' : ''}"><div class="elementor-background-slideshow__slide__image ${cls}"></div></div>`;
        })
        .join('');
      const kb = s.background_slideshow_ken_burns === 'yes' ? ' wsg-slideshow--kenburns' : '';
      sec.insertAdjacentHTML(
        'afterbegin',
        `<div class="elementor-background-slideshow swiper wsg-slideshow${kb}" data-duration="${s.background_slideshow_slide_duration || 5000}" data-transition="${s.background_slideshow_transition_duration || 500}" aria-hidden="true"><div class="swiper-wrapper">${slides}</div></div>`,
      );
    } else if (s.background_background === 'video' && s.background_video_link) {
      const vid = youtubeId(s.background_video_link);
      // Sin el video (requiere el reproductor de YouTube) se muestra un fotograma: el de la
      // imagen de respaldo configurada o, si no hay, un fotograma del video sin texto (hq1).
      const fallback = s.background_video_fallback?.url;
      const poster = fallback || (vid ? `https://i.ytimg.com/vi/${vid}/hq1.jpg` : null);
      if (poster) {
        sec.querySelectorAll(':scope > .elementor-background-video-container').forEach((e) => e.remove());
        sec.insertAdjacentHTML(
          'afterbegin',
          `<div class="elementor-background-video-container wsg-video-bg" aria-hidden="true"><img src="${escapeAttr(poster)}" alt="" class="wsg-video-bg__poster" data-wsg-external="1"${fallback ? '' : ' data-wsg-blur="1"'}></div>`,
        );
        ctx.notes.push('video-bg:' + s.background_video_link + ' → poster');
      }
    }
    // Carruseles: guardamos solo lo que usa nuestro script.
    if (sec.classList.contains('elementor-widget-image-carousel') || sec.classList.contains('elementor-widget-testimonial-carousel')) {
      const cfg = carouselSettings(s, { slides: 3 });
      const swiper = sec.querySelector('.swiper');
      if (swiper) swiper.setAttribute('data-wsg-carousel', JSON.stringify(cfg));
    }
    void id;
  }
  for (const wrap of root.querySelectorAll('.pp-testimonials-wrap[data-slider-settings]')) {
    let s = {};
    try {
      s = JSON.parse(wrap.getAttribute('data-slider-settings'));
    } catch {}
    const cfg = carouselSettings(s, { slides: 2 });
    const carousel = wrap.querySelector('.pp-testimonials-carousel') || wrap;
    carousel.setAttribute('data-wsg-carousel', JSON.stringify(cfg));
  }

  // ---- <style> dentro del contenido ----
  for (const st of root.querySelectorAll('style')) {
    if (insideSvg(st)) {
      // Se aplican después con applySvgCascade (cascada global, como en el navegador).
      st.remove();
    } else {
      const css = (st.text || '').trim();
      if (css) ctx.extraCss.push(css);
      st.remove();
    }
  }
  for (const svg of root.querySelectorAll('svg')) uniqueSvgIds(svg, ctx);

  // ---- Barras de progreso: el ancho pasa a CSS ----
  for (const w of root.querySelectorAll('.elementor-widget-progress')) {
    const wid = (w.getAttribute('class') || '').match(/elementor-element-([a-z0-9]+)/)?.[1];
    const bar = w.querySelector('.elementor-progress-bar[data-max]');
    if (wid && bar) {
      ctx.extraCss.push(`.elementor-element.elementor-element-${wid} .elementor-progress-bar{width:${Number(bar.getAttribute('data-max')) || 0}%}`);
      bar.removeAttribute('data-max');
    }
  }

  // ---- Listados de artículos → marcador que renderiza Astro ----
  for (const w of root.querySelectorAll('.elementor-widget-posts, .elementor-widget-archive-posts')) {
    const cont = w.querySelector('.elementor-widget-container');
    if (!cont) continue;
    const articles = w.querySelectorAll('article.elementor-post');
    const excerpt = w.querySelector('.elementor-post__excerpt p');
    const words = excerpt ? excerpt.text.trim().split(/\s+/).length : 25;
    const readMore = w.querySelector('.elementor-post__read-more')?.text.trim() || 'LEER MÁS »';
    const avatar = !!w.querySelector('.elementor-post-avatar');
    const paginate = !!w.querySelector('.elementor-pagination');
    const kind = w.classList.contains('elementor-widget-archive-posts') ? 'archive' : 'posts';
    cont.set_content(
      `<wsg-posts kind="${kind}" per-page="${articles.length || 9}" excerpt-words="${words}" read-more="${escapeAttr(readMore)}" avatar="${avatar ? 1 : 0}" paginate="${paginate ? 1 : 0}"></wsg-posts>`,
    );
  }

  // ---- Buscador: formulario GET hacia la página de búsqueda del sitio ----
  for (const form of root.querySelectorAll('.elementor-widget-search-form form')) {
    form.setAttribute('action', '/buscar/');
    form.setAttribute('method', 'get');
    form.removeAttribute('role');
    form.setAttribute('role', 'search');
    form.querySelectorAll('input[type="hidden"]').forEach((i) => i.remove());
  }

  // ---- Formulario del footer (newsletter) → componente propio ----
  for (const w of root.querySelectorAll('.elementor-widget-form')) {
    const cont = w.querySelector('.elementor-widget-container');
    if (cont) cont.set_content('<wsg-newsletter></wsg-newsletter>');
  }

  // ---- Plantilla de artículo / archivo: partes dinámicas ----
  if (ctx.mode === 'single' || ctx.mode === 'archive') {
    for (const w of root.querySelectorAll('.elementor-widget-theme-post-title')) {
      const h = w.querySelector('h1, h2, h3');
      if (h) h.set_content('<wsg-post-title></wsg-post-title>');
    }
    for (const w of root.querySelectorAll('.elementor-widget-theme-post-featured-image .elementor-widget-container')) w.set_content('<wsg-featured></wsg-featured>');
    for (const w of root.querySelectorAll('.elementor-widget-theme-post-content .elementor-widget-container')) w.set_content('<wsg-post-content></wsg-post-content>');
    // Última miga de pan = título dinámico. (En el archivo original la miga "Blog"
    // enlazaba por error al último artículo; aquí apunta al blog.)
    const crumbs = root.querySelector('.elementor-widget-icon-list .elementor-icon-list-items');
    if (crumbs) {
      const items = crumbs.querySelectorAll('li');
      for (const li of items) {
        const a = li.querySelector('a');
        if (a && li.text.trim() === 'Blog') a.setAttribute('href', '/blog/');
      }
      const last = items[items.length - 1];
      const a = last?.querySelector('a');
      const txt = last?.querySelector('.elementor-icon-list-text');
      if (a) a.setAttribute('href', '__WSG_CURRENT_URL__');
      if (txt) txt.set_content('<wsg-post-title></wsg-post-title>');
    }
  }

  // ---- Iconos de Elementor (fuente eicons) → SVG ----
  for (const i of root.querySelectorAll('i[class*="eicon-"]')) {
    const classes = (i.getAttribute('class') || '').split(/\s+/);
    const name = classes.find((c) => c.startsWith('eicon-'));
    const svg = eiconSvg(name, classes.filter((c) => c !== name).join(' '));
    if (svg) i.replaceWith(svg);
    else {
      ctx.notes.push('eicon-desconocido:' + name);
      i.remove();
    }
  }

  // ---- Limpieza genérica de atributos, clases, estilos, enlaces e imágenes ----
  for (const el of root.querySelectorAll('*')) {
    const tag = (el.rawTagName || '').toLowerCase();
    if (!tag) continue;
    const attrs = el.attributes;
    for (const name of Object.keys(attrs)) {
      const lower = name.toLowerCase();
      if (DROP_ATTRS.has(lower) || lower.startsWith('on')) el.removeAttribute(name);
    }
    if (attrs.class !== undefined) {
      const kept = attrs.class.split(/\s+/).filter((c) => c && !DROP_CLASSES.has(c) && !/^menu-item-\d+$/.test(c) && !/^page-item-\d+$/.test(c));
      if (kept.length) el.setAttribute('class', kept.join(' '));
      else el.removeAttribute('class');
    }
    if (attrs.style !== undefined && !insideSvg(el)) {
      const style = attrs.style;
      el.removeAttribute('style');
      if (/display\s*:\s*none/.test(style)) {
        el.remove();
        continue;
      }
      if (/background-image/.test(style) && el.classList.contains('elementor-custom-embed-image-overlay')) continue;
      const cls = styleToClass(style, ctx);
      if (cls) el.classList.add(cls);
    } else if (attrs.style !== undefined) {
      el.removeAttribute('style');
    }
    if (tag === 'li' && el.classList.contains('menu-item')) el.removeAttribute('id');

    if (tag === 'a' && attrs.href !== undefined) {
      let href = attrs.href.trim();
      if (href === '#whatsapp') href = ctx.whatsappUrl;
      else if (href.startsWith('#elementor-action')) href = ctx.privacyUrl;
      else if (href === '#') href = null;
      else if (/^https?:\/\/(www\.)?welcomestudentsgroup\.com\/wp-content\/uploads\//i.test(href)) {
        const r = await ctx.media.localize(href, { variants: false });
        href = r.src;
      } else if (/^https?:\/\/(www\.)?welcomestudentsgroup\.com/i.test(href)) {
        href = localizeUrl(href);
        const p = href.match(/^\/\?p=(\d+)$/);
        if (p && ctx.idToPath?.has(Number(p[1]))) href = ctx.idToPath.get(Number(p[1]));
      }
      if (href === null) el.removeAttribute('href');
      else el.setAttribute('href', href);
      if ((el.getAttribute('target') || '') === '_blank') {
        const rel = (el.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
        if (!rel.includes('noopener')) rel.push('noopener');
        el.setAttribute('rel', rel.join(' '));
      }
    }

    if (tag === 'img') {
      const src = attrs.src;
      if (src) {
        const external = attrs['data-wsg-external'] !== undefined || !ctx.media.isSiteAsset(src);
        const blur = attrs['data-wsg-blur'] !== undefined;
        el.removeAttribute('data-wsg-external');
        el.removeAttribute('data-wsg-blur');
        const r = src.startsWith('data:') ? { src } : external ? await ctx.media.localizeExternal(src, blur ? { upscaleTo: 1600, blur: 2.5 } : {}) : await ctx.media.localize(src);
        if (r?.missing) {
          ctx.notes.push('imagen-externa-eliminada:' + src);
          el.remove();
          continue;
        }
        if (r && !r.missing) {
          el.setAttribute('src', r.src);
          // Los SVG se dimensionan por CSS (como en el original): sin atributos width/height.
          const isSvg = /\.svg$/i.test(r.src);
          if (r.width && r.height && !isSvg && attrs.width === undefined && attrs.height === undefined) {
            el.setAttribute('width', String(r.width));
            el.setAttribute('height', String(r.height));
          }
          if (r.srcset) {
            el.setAttribute('srcset', r.srcset);
            el.setAttribute('sizes', '(max-width: 767px) 100vw, 1140px');
          }
        }
      }
      if (attrs.alt === undefined) el.setAttribute('alt', '');
      const eager = ctx.imgCount < ctx.eagerImages;
      el.setAttribute('loading', eager ? 'eager' : 'lazy');
      if (eager) el.setAttribute('fetchpriority', 'high');
      el.setAttribute('decoding', 'async');
      ctx.imgCount++;
    }

    if (tag === 'i') {
      const cls = attrs.class || '';
      const m = cls.match(/\b(fas|far|fab|fa)\b/);
      const icon = cls.match(/\bfa-[a-z0-9-]+\b/);
      if (m && icon) ctx.faUsed.add(`${m[1]}:${icon[0]}`);
    }
  }
}

/** Serializa el fragmento ya limpio. */
export function serialize(root) {
  return root.innerHTML
    .replace(/\n{3,}/g, '\n\n')
    .replace(/<img\b([^>]*?)\salt(?=[\s>])(?!=)/g, '<img$1 alt=""')
    .trim();
}
