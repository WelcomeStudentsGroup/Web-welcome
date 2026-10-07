import type { APIRoute } from 'astro';
import { formatAddress, site } from '@/config/site';
import { destinations, educationPrograms, faqs, partners, visas } from '@/data/content';
import { getPublishedNews } from '@/lib/news';

/**
 * llms.txt (https://llmstxt.org) — resumen en Markdown para modelos de lenguaje
 * y motores de búsqueda generativos (GEO). Se genera desde los mismos datos que
 * el sitio, así nunca queda desactualizado.
 */
export const GET: APIRoute = async ({ site: base }) => {
  const u = (p: string) => new URL(p, base).toString();
  const posts = await getPublishedNews();

  const body = `# ${site.name}

> ${site.summary}

${site.name} is a registered education and migration agency founded in ${site.foundingYear}, with offices in Brisbane and the Gold Coast (Queensland, Australia). It offers free educational advisory for international students, represents education institutions in ${site.destinations.join(', ')}, and provides migration guidance through registered migration agents and lawyers. Accreditations: ${site.accreditations.join(', ')}.

## Key facts
- Founded: ${site.foundingYear}
- Destinations: ${site.destinations.join(', ')}
- Offices: ${site.offices.map((o) => `${o.name.replace(' office', '')} (${formatAddress(o)})`).join('; ')}
- Phone: ${site.contact.phone} · WhatsApp: ${site.contact.whatsapp} · Email: ${site.contact.email}
- Educational advisory is free for students (institutions cover the agency fee on enrolment).
- No visa outcome is guaranteed; applications are prepared with registered migration agents.
- Partner institutions include: ${partners.join(', ')}.

## Pages
- [Home](${u('/')}): overview, study destinations, programs and testimonials
- [About](${u('/about/')}): purpose, values, reasons to choose us and accreditations
- [Services](${u('/services/')}): education advisory, migration & visas, WelcomeHub, FAQ
- [Destinations](${u('/destinations/')}): Australia (Brisbane, Gold Coast, Sydney, Melbourne, Perth, Adelaide, Darwin, Hobart), New Zealand, Dubai
- [Contact](${u('/contact/')}): offices, phone, WhatsApp, email and enquiry form
- [News](${u('/news/')}): articles, guides and careers

## Education programs
${educationPrograms.map((p) => `- ${p.title}: ${p.text}`).join('\n')}

## Visa services
${visas.map((v) => `- ${v.title}: ${v.text}`).join('\n')}

## Destinations
${destinations.map((d) => `- ${d.name}: ${d.summary}`).join('\n')}

## FAQ
${faqs.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}
${posts.length ? `\n## Articles\n${posts.map((p) => `- [${p.data.title}](${u(`/news/${p.id}/`)}): ${p.data.description}`).join('\n')}\n` : ''}`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
