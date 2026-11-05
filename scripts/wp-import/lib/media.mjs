/**
 * Descarga y optimización de medios del WordPress.
 *
 * - Resuelve miniaturas de Elementor (`/elementor/thumbs/nombre-HASH.png`) y tamaños
 *   intermedios de WordPress (`nombre-300x200.jpg`) al archivo ORIGINAL de la biblioteca.
 * - Descarga el original al snapshot (caché) y genera una versión optimizada en
 *   `public/uploads/AAAA/MM/nombre.webp` (máx. 1600 px; 1920 px para fondos) con `sharp`.
 * - SVG, GIF y PDF se copian tal cual (los SVG sin scripts).
 * - Guarda un manifiesto para no repetir descargas ni conversiones.
 */
import sharp from 'sharp';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { basename, dirname, extname, join, posix } from 'node:path';
import { exists, log, SOURCE } from './util.mjs';

const execFileP = promisify(execFile);

const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.bmp', '.avif']);

export class MediaStore {
  /**
   * @param {object} o
   * @param {string} o.snapshotDir  carpeta del snapshot (originales en snapshot/media)
   * @param {string} o.publicDir    carpeta public/ del proyecto
   * @param {Array}  o.mediaIndex   respuesta de /wp-json/wp/v2/media
   */
  constructor({ snapshotDir, publicDir, mediaIndex }) {
    this.snapshotDir = snapshotDir;
    this.publicDir = publicDir;
    this.manifestFile = join(snapshotDir, 'media-manifest.json');
    this.manifest = {};
    // Índice nombre de archivo → URL original (solo para resolver miniaturas de Elementor,
    // que no conservan la carpeta). Ordenado por id para que el resultado sea determinista.
    this.byFile = new Map();
    for (const m of [...mediaIndex].sort((a, b) => a.id - b.id)) {
      const file = m.media_details?.file;
      if (file && !this.byFile.has(basename(file))) this.byFile.set(basename(file), m.source_url);
      const b = basename(new URL(m.source_url).pathname);
      if (!this.byFile.has(b)) this.byFile.set(b, m.source_url);
    }
    this.failed = new Set();
  }

  async load() {
    if (await exists(this.manifestFile)) this.manifest = JSON.parse(await readFile(this.manifestFile, 'utf8'));
  }

  async save() {
    await mkdir(dirname(this.manifestFile), { recursive: true });
    await writeFile(this.manifestFile, JSON.stringify(this.manifest, null, 1));
  }

  /** URL absoluta y normalizada de un recurso del sitio origen. */
  absolute(url) {
    let u = url.trim().replace(/^['"]|['"]$/g, '');
    if (u.startsWith('//')) u = 'https:' + u;
    if (u.startsWith('/')) u = SOURCE + u;
    u = u.replace(/^http:\/\//, 'https://').replace('https://www.welcomestudentsgroup.com', SOURCE);
    u = u.split('?')[0].split('#')[0];
    // Rutas con espacios u otros caracteres sin codificar (p. ej. "GOLD COAST.svg").
    return u.replace(/ /g, '%20');
  }

  isSiteAsset(url) {
    const u = this.absolute(url);
    return u.startsWith(SOURCE + '/wp-content/') || u.startsWith(SOURCE + '/wp-includes/');
  }

  /** Devuelve la URL del archivo original (sin recorte ni redimensión) para una URL de imagen. */
  resolveOriginal(url) {
    const u = this.absolute(url);
    const path = new URL(u).pathname;
    const base = basename(path);
    const ext = extname(base);
    if (path.includes('/elementor/thumbs/')) {
      const stem = base.slice(0, -ext.length);
      const parts = stem.split('-');
      for (let i = parts.length - 1; i > 0; i--) {
        const cand = parts.slice(0, i).join('-') + ext;
        if (this.byFile.has(cand)) return this.byFile.get(cand);
      }
      return null;
    }
    // Tamaños intermedios de WordPress: el original está en la misma carpeta.
    const sized = base.match(/^(.*)-\d+x\d+(\.[a-z0-9]+)$/i);
    if (sized) return u.replace(base, sized[1] + sized[2]);
    // URL directa: es el original (no se sustituye por otro archivo del mismo nombre).
    return u;
  }

  /** Ruta local (en el snapshot) de un archivo del origen; lo descarga si hace falta. */
  async download(url) {
    const u = this.absolute(url);
    const rel = decodeURIComponent(new URL(u).pathname).replace(/^\/wp-content\//, '').replace(/^\//, '');
    const dest = join(this.snapshotDir, 'media', rel);
    if (await exists(dest)) return dest;
    if (this.failed.has(u)) return null;
    await mkdir(dirname(dest), { recursive: true });
    try {
      await execFileP('curl', ['-sS', '-L', '--fail', '--retry', '3', '-A', 'Mozilla/5.0 (site-migration)', '-o', dest, u]);
      return dest;
    } catch (e) {
      this.failed.add(u);
      log('No se pudo descargar', u, e.message.split('\n')[0]);
      return null;
    }
  }

  /**
   * Localiza un recurso: devuelve { src, width, height, srcset } apuntando a public/.
   * @param {string} url  URL original (cualquier tamaño)
   * @param {object} opts { maxWidth, variants }
   */
  /**
   * Tamaño con el que WordPress mostraba la imagen: las miniaturas de Elementor
   * (`/elementor/thumbs/…`) y los tamaños intermedios (`nombre-300x200.jpg`) definen el
   * tamaño intrínseco del <img>; el original se recorta a esa proporción y se genera a 2x
   * para pantallas de alta densidad.
   */
  async displaySize(url) {
    const u = this.absolute(url);
    const base = basename(new URL(u).pathname);
    const sized = base.match(/-(\d+)x(\d+)\.[a-z0-9]+$/i);
    if (sized) return { width: Number(sized[1]), height: Number(sized[2]) };
    if (u.includes('/elementor/thumbs/')) {
      const local = await this.download(u);
      if (local) {
        try {
          const meta = await sharp(local).metadata();
          if (meta.width && meta.height) return { width: meta.width, height: meta.height };
        } catch {}
      }
    }
    return null;
  }

  async localize(url, opts = {}) {
    const maxWidth = opts.maxWidth ?? 1600;
    let original = this.resolveOriginal(url);
    if (!original) {
      // Miniatura cuyo original ya no está en la biblioteca: se usa la miniatura tal cual.
      log('Miniatura sin original, se usa tal cual:', url);
      original = this.absolute(url);
      opts = { ...opts, raw: true };
    }
    const display = opts.raw || opts.variants === false ? null : await this.displaySize(url);
    const key = `${original}|${maxWidth}|${display ? display.width + 'x' + display.height : 'full'}`;
    if (this.manifest[key]) return this.manifest[key];

    const src = opts.raw ? this.absolute(url) : original;
    const local = await this.download(src);
    if (!local) return { src: url, width: null, height: null, missing: true };

    const path = decodeURIComponent(new URL(src).pathname); // /wp-content/uploads/2022/10/x.png
    const relUploads = path.replace(/^\/wp-content\/uploads\//, '').replace(/^\/wp-content\//, '_wp/');
    const ext = extname(relUploads).toLowerCase();
    const stem = relUploads.slice(0, -ext.length);
    let result;

    if (RASTER.has(ext) && display) {
      const outRel = posix.join('uploads', `${stem}-${display.width}x${display.height}.webp`);
      const out = join(this.publicDir, outRel);
      const meta = await sharp(local).rotate().metadata();
      const ow = meta.width ?? display.width;
      const oh = meta.height ?? display.height;
      const scale = Math.min(1, ow / (2 * display.width), oh / (2 * display.height));
      const w = Math.max(1, Math.round(2 * display.width * scale));
      const h = Math.max(1, Math.round(2 * display.height * scale));
      await mkdir(dirname(out), { recursive: true });
      if (!(await exists(out))) await sharp(local).rotate().resize({ width: w, height: h, fit: 'cover' }).webp({ quality: 80, effort: 4 }).toFile(out);
      result = { src: encodeURI('/' + outRel), width: display.width, height: display.height };
    } else if (RASTER.has(ext)) {
      const outRel = posix.join('uploads', stem + '.webp');
      const out = join(this.publicDir, outRel);
      const img = sharp(local, { animated: false }).rotate();
      const meta = await img.metadata();
      let width = meta.width ?? 0;
      let height = meta.height ?? 0;
      let pipeline = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
        pipeline = pipeline.resize({ width: maxWidth });
      }
      await mkdir(dirname(out), { recursive: true });
      if (!(await exists(out))) await pipeline.webp({ quality: 80, effort: 4 }).toFile(out);
      result = { src: encodeURI('/' + outRel), width, height };
      // Variante pequeña para móviles cuando la imagen es grande.
      if (width >= 1000 && opts.variants !== false) {
        const smallRel = posix.join('uploads', stem + '-768.webp');
        const smallOut = join(this.publicDir, smallRel);
        if (!(await exists(smallOut))) await sharp(local).rotate().resize({ width: 768 }).webp({ quality: 78, effort: 4 }).toFile(smallOut);
        result.srcset = `${encodeURI('/' + smallRel)} 768w, ${encodeURI('/' + outRel)} ${width}w`;
      }
    } else {
      const outRel = posix.join('uploads', relUploads);
      const out = join(this.publicDir, outRel);
      await mkdir(dirname(out), { recursive: true });
      if (ext === '.svg') {
        let svg = await readFile(local, 'utf8');
        svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son[a-z]+="[^"]*"/gi, '');
        await writeFile(out, svg);
        const w = svg.match(/\swidth="(\d+(?:\.\d+)?)/)?.[1];
        const h = svg.match(/\sheight="(\d+(?:\.\d+)?)/)?.[1];
        const vb = svg.match(/viewBox="[\d.\s-]+"/i)?.[0].match(/[\d.]+/g);
        result = { src: encodeURI('/' + outRel), width: w ? Math.round(+w) : vb ? Math.round(+vb[2]) : null, height: h ? Math.round(+h) : vb ? Math.round(+vb[3]) : null };
      } else {
        if (!(await exists(out))) await copyFile(local, out);
        let width = null;
        let height = null;
        if (ext === '.gif') {
          try {
            const meta = await sharp(local).metadata();
            width = meta.width ?? null;
            height = meta.pageHeight ?? meta.height ?? null;
          } catch {}
        }
        result = { src: encodeURI('/' + outRel), width, height };
      }
    }
    this.manifest[key] = result;
    return result;
  }

  /**
   * Imagen externa (p. ej. miniatura de YouTube): se descarga y optimiza en /uploads/externo/.
   */
  async localizeExternal(url, opts = {}) {
    const maxWidth = opts.maxWidth ?? 1600;
    const key = `ext|${url}|${maxWidth}|${opts.upscaleTo || 0}|${opts.blur || 0}`;
    if (this.manifest[key]) return this.manifest[key];
    const id = basename(dirname(url)) + '-' + basename(url).replace(/\.[a-z]+$/i, '') + (opts.upscaleTo ? '-fondo' : '');
    const local = join(this.snapshotDir, 'media', 'externo', id);
    if (!(await exists(local))) {
      await mkdir(dirname(local), { recursive: true });
      const candidates = [url];
      if (/maxresdefault\.jpg$/.test(url)) candidates.push(url.replace('maxresdefault', 'hqdefault'));
      let ok = false;
      for (const c of candidates) {
        try {
          await execFileP('curl', ['-sS', '-L', '--fail', '--retry', '2', '-o', local, c]);
          ok = true;
          break;
        } catch {}
      }
      if (!ok) {
        log('No se pudo descargar la imagen externa', url);
        return { src: url, width: null, height: null, missing: true };
      }
    }
    const outRel = posix.join('uploads', 'externo', id + '.webp');
    const out = join(this.publicDir, outRel);
    const img = sharp(local).rotate();
    const meta = await img.metadata();
    let width = meta.width ?? 0;
    let height = meta.height ?? 0;
    let pipeline = img;
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
      pipeline = pipeline.resize({ width: maxWidth });
    } else if (opts.upscaleTo && width < opts.upscaleTo) {
      // Fotograma pequeño usado como fondo: se amplía y se suaviza (como un video en pausa).
      height = Math.round((height * opts.upscaleTo) / width);
      width = opts.upscaleTo;
      pipeline = pipeline.resize({ width: opts.upscaleTo, kernel: 'lanczos3' });
    }
    if (opts.blur) pipeline = pipeline.blur(opts.blur);
    await mkdir(dirname(out), { recursive: true });
    if (!(await exists(out))) await pipeline.webp({ quality: 80 }).toFile(out);
    const result = { src: '/' + outRel, width, height };
    this.manifest[key] = result;
    return result;
  }
}
