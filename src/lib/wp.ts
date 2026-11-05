/**
 * Acceso al contenido importado del WordPress (src/content/wp, generado por
 * scripts/wp-import/convert.mjs). Páginas, artículos, categorías y plantillas.
 */
import layoutData from '@/content/wp/layout.json';
import siteData from '@/content/wp/site.json';
import singleTemplate from '@/content/wp/templates/single.json';
import archiveTemplate from '@/content/wp/templates/archive.json';

export interface WpImage {
  src: string;
  width: number | null;
  height: number | null;
  alt: string;
}

export interface WpPage {
  id: number;
  slug: string;
  /** Ruta pública, p. ej. "/brisbane/". La portada es "/". */
  path: string;
  title: string;
  /** <title> tal como lo tenía WordPress ("Brisbane – Welcome Students Group"). */
  documentTitle: string;
  description: string;
  modified: string;
  published: string;
  template: string;
  /** Hoja de estilos específica de la página (en public/wp-css). */
  css: string | null;
  html: string;
  notes: string[];
}

export interface WpPost {
  id: number;
  slug: string;
  path: string;
  title: string;
  date: string;
  modified: string;
  categories: string[];
  excerpt: string;
  description: string;
  image: WpImage | null;
  html: string;
  text: string;
  notes: string[];
}

export interface WpCategory {
  id: number;
  slug: string;
  name: string;
  count: number;
  description: string;
}

const pageModules = import.meta.glob<WpPage>('/src/content/wp/pages/*.json', { eager: true, import: 'default' });
const postModules = import.meta.glob<WpPost>('/src/content/wp/posts/*.json', { eager: true, import: 'default' });

export const pages: WpPage[] = Object.values(pageModules).sort((a, b) => a.path.localeCompare(b.path));
export const posts: WpPost[] = Object.values(postModules).sort((a, b) => (a.date < b.date ? 1 : -1));
export const categories: WpCategory[] = siteData.categories;
export const layout = layoutData as { header: string; footer: string; privacyHtml?: string; privacyCss?: string };
export const templates = {
  single: singleTemplate as { elementorId: number; html: string; css: string },
  archive: archiveTemplate as { elementorId: number; html: string; css: string },
};

export const pageByPath = (path: string) => pages.find((p) => p.path === path);
export const postsInCategory = (slug: string) => posts.filter((p) => p.categories.includes(slug));

/** Primeras N palabras del texto del artículo (como el extracto del widget de Elementor). */
export function excerptOf(post: WpPost, words: number) {
  const all = post.text.split(/\s+/).filter(Boolean);
  return all.slice(0, words).join(' ');
}

/** "16 de mayo de 2023", como mostraba WordPress en español. */
export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const toIso = (iso: string) => new Date(iso).toISOString();

/** Deja un solo <h1> por página: el resto pasa a <h2> (mismo estilo visual en Elementor). */
export function singleH1(html: string) {
  let seen = 0;
  return html.replace(/<(\/?)h1\b/gi, (m, slash) => {
    if (!slash) return seen++ === 0 ? m : '<h2';
    return seen <= 1 ? m : '</h2';
  });
}

export const hasH1 = (html: string) => /<h1\b/i.test(html);

/** Texto plano (para índices de búsqueda y descripciones). */
export const stripTags = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
