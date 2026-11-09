import type { APIRoute } from 'astro';
import { pages, posts, stripTags } from '@/lib/wp';

/** Índice para la búsqueda en el navegador (/buscar/). */
export const GET: APIRoute = () => {
  const entries = [
    ...posts.map((p) => ({ type: 'post', title: p.title, path: p.path, date: p.date, image: p.image ? { src: p.image.src, width: p.image.width, height: p.image.height, alt: p.image.alt } : null, text: p.text.slice(0, 1500) })),
    ...pages
      .filter((p) => p.html && !['welcome-2', 'eventos'].includes(p.slug))
      .map((p) => ({ type: 'page', title: p.title, path: p.path, date: p.published, image: p.image ? { src: p.image.src, width: p.image.width, height: p.image.height, alt: p.image.alt } : null, text: stripTags(p.html).slice(0, 1500) })),
  ];
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
