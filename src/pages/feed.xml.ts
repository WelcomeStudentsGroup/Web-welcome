import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { posts } from '@/lib/wp';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Feed RSS del blog (WordPress lo servía en /feed/). */
export const GET: APIRoute = ({ site: base }) => {
  const u = (p: string) => new URL(p, base).toString();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${u(p.path)}</link>
      <guid isPermaLink="true">${u(p.path)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.excerpt || p.description)}</description>
    </item>`,
    )
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${u('/')}</link>
    <atom:link href="${u('/feed.xml')}" rel="self" type="application/rss+xml" />
    <description>${esc(site.wpTagline)}</description>
    <language>${site.lang}</language>
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
