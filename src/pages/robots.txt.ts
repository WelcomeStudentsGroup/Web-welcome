import type { APIRoute } from 'astro';

/**
 * robots.txt — permite el rastreo a buscadores y a los rastreadores de IA
 * (GPTBot, ClaudeBot, PerplexityBot…) porque queremos que los motores
 * generativos conozcan y citen a la empresa (GEO).
 * Las páginas que no deben indexarse usan <meta name="robots" content="noindex">.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).toString();
  const body = `User-agent: *
Allow: /
Disallow: /buscar/

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
