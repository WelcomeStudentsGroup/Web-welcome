import type { APIRoute } from 'astro';
import { formatAddress, site } from '@/config/site';
import { pages, posts } from '@/lib/wp';

/**
 * llms.txt (https://llmstxt.org) — resumen en Markdown para modelos de lenguaje
 * y motores de búsqueda generativos (GEO), generado desde el contenido del sitio.
 */
export const GET: APIRoute = ({ site: base }) => {
  const u = (p: string) => new URL(p, base).toString();
  const visible = pages.filter((p) => p.html && !['welcome-2', 'eventos', 'terminos-y-condiciones'].includes(p.slug));

  const body = `# ${site.name}

> ${site.description}

${site.name} es una agencia de educación y migración registrada, fundada en ${site.foundingYear}, con oficinas en Brisbane y Gold Coast (Queensland, Australia). Ofrece asesoría educativa gratuita a estudiantes internacionales (principalmente de Latinoamérica) para vivir, estudiar y trabajar en ${site.destinations.join(', ')}, representa instituciones educativas y, en alianza con abogados y agentes migratorios registrados, acompaña trámites de visa. Certificaciones: ${site.accreditations.join(', ')}.

## Datos clave
- Fundación: ${site.foundingYear}
- Destinos: ${site.destinations.join(', ')}
- Oficinas: ${site.offices.map((o) => `${o.name} (${formatAddress(o)})`).join('; ')}
- Teléfono: ${site.contact.phone} · WhatsApp: ${site.contact.whatsapp} · Email: ${site.contact.email}
- Idioma del sitio: español
- Redes: ${Object.values(site.social).join(', ')}

## Páginas
${visible.map((p) => `- [${p.title}](${u(p.path)}): ${p.description}`).join('\n')}

## Artículos del blog
${posts.map((p) => `- [${p.title}](${u(p.path)}): ${p.description}`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
