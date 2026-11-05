/**
 * Datos estructurados schema.org (JSON-LD).
 * Ayudan a Google (resultados enriquecidos, panel de empresa) y a los motores
 * de IA generativa (GEO) a entender quiénes somos, dónde estamos y qué ofrecemos.
 * Todo sale de src/config/site.ts para mantener una única fuente de verdad.
 */
import { site, socialLinks } from '@/config/site';

const abs = (path: string, base: URL | string) => new URL(path, base).toString();

export const orgId = (base: URL | string) => abs('/#organization', base);
export const websiteId = (base: URL | string) => abs('/#website', base);

export function organization(base: URL | string) {
  return {
    '@type': ['Organization', 'EducationalOrganization'],
    '@id': orgId(base),
    name: site.name,
    legalName: site.legalName,
    url: abs('/', base),
    logo: abs('/icon-512.png', base),
    image: abs('/og-default.png', base),
    description: site.description,
    foundingDate: String(site.foundingYear),
    email: site.contact.email,
    telephone: '+61421273080',
    areaServed: ['Australia', 'New Zealand', 'United Arab Emirates'],
    knowsAbout: [
      'International education',
      'Study in Australia',
      'English courses',
      'Vocational education and training (VET)',
      'Higher education',
      'Australian student visas',
      'Australian migration pathways',
    ],
    memberOf: site.accreditations.map((name) => ({ '@type': 'Organization', name })),
    sameAs: socialLinks.map((s) => s.url),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+61421273080',
        email: site.contact.email,
        availableLanguage: ['Spanish', 'English'],
      },
    ],
    department: site.offices.map((o) => ({ '@id': abs(`/contacto/#${o.id}`, base) })),
  };
}

export function offices(base: URL | string) {
  return site.offices.map((o) => ({
    '@type': 'ProfessionalService',
    '@id': abs(`/contacto/#${o.id}`, base),
    name: `${site.name} — ${o.name}`,
    url: abs('/contacto/', base),
    image: abs('/og-default.png', base),
    telephone: '+61421273080',
    email: site.contact.email,
    parentOrganization: { '@id': orgId(base) },
    address: {
      '@type': 'PostalAddress',
      streetAddress: o.streetAddress,
      addressLocality: o.locality,
      addressRegion: o.region,
      postalCode: o.postalCode,
      addressCountry: o.country,
    },
  }));
}

export function website(base: URL | string) {
  return {
    '@type': 'WebSite',
    '@id': websiteId(base),
    url: abs('/', base),
    name: site.name,
    description: site.wpTagline,
    inLanguage: site.lang,
    publisher: { '@id': orgId(base) },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: abs('/buscar/?s={search_term_string}', base) },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webPage(opts: { url: string; title: string; description: string; base: URL | string; type?: string; modified?: string; published?: string }) {
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    inLanguage: site.lang,
    isPartOf: { '@id': websiteId(opts.base) },
    about: { '@id': orgId(opts.base) },
    ...(opts.published ? { datePublished: opts.published } : {}),
    ...(opts.modified ? { dateModified: opts.modified } : {}),
  };
}

export function breadcrumbs(items: { name: string; href: string }[], base: URL | string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.href, base),
    })),
  };
}

export function blogPosting(opts: { url: string; title: string; description: string; published: string; modified: string; image?: string; base: URL | string }) {
  return {
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    datePublished: opts.published,
    dateModified: opts.modified,
    author: { '@type': 'Organization', name: site.name, url: abs('/', opts.base) },
    publisher: { '@id': orgId(opts.base) },
    mainEntityOfPage: opts.url,
    image: opts.image ? abs(opts.image, opts.base) : abs('/og-default.png', opts.base),
    inLanguage: site.lang,
  };
}

/** Serializa un grafo JSON-LD de forma segura para incrustarlo en HTML. */
export const toJsonLd = (graph: object[]) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
