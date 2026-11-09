import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname } from 'node:path';

export const SOURCE = 'https://welcomestudentsgroup.com';

export const hash = (s, n = 8) => createHash('sha1').update(s).digest('hex').slice(0, n);

export async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function writeText(p, content) {
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, content);
}

export async function readJson(p) {
  return JSON.parse(await readFile(p, 'utf8'));
}

export async function writeJson(p, data) {
  await writeText(p, JSON.stringify(data, null, 2) + '\n');
}

/** Decodifica entidades HTML básicas (títulos de la API REST llegan con &#8211; etc.). */
export function decodeEntities(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

export function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Convierte una URL absoluta del WordPress en ruta relativa del sitio nuevo. */
export function localizeUrl(href) {
  if (!href) return href;
  let h = href.trim();
  h = h.replace(/^https?:\/\/(www\.)?welcomestudentsgroup\.com(?=\/|$)/i, '');
  if (h === '') h = '/';
  // ?p=ID no existe en un sitio estático: se resuelve en el conversor si hay mapa.
  return h;
}

export function slugFromPath(path) {
  return path.replace(/^\/|\/$/g, '') || 'index';
}

/** Texto visible de un nodo (para descripciones y control de calidad). */
export function visibleText(node) {
  return node.structuredText
    ? node.structuredText.replace(/\s+/g, ' ').trim()
    : String(node.text || '').replace(/\s+/g, ' ').trim();
}

export function truncateWords(text, maxChars = 155) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= maxChars) return t;
  const cut = t.slice(0, maxChars);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 80)).replace(/[,;:.\-–]+$/, '') + '…';
}

export function log(...args) {
  console.log('[wp-import]', ...args);
}
