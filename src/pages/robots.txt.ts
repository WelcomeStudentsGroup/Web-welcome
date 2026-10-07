import type { APIRoute } from 'astro';

/**
 * robots.txt — permite el rastreo a buscadores y a los rastreadores de IA
 * (GPTBot, ClaudeBot, PerplexityBot, Google-Extended...) porque queremos que
 * los motores generativos conozcan y citen a la empresa (GEO).
 * Si en algún momento se quiere bloquear a alguno, agrégalo aquí con Disallow.
 * Las páginas que no deben indexarse usan <meta name="robots" content="noindex">
 * (no Disallow: si se bloquea el rastreo, Google no puede leer el noindex).
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).toString();
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
