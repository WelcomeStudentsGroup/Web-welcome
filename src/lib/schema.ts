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
    telephone: site.contact.phone.replace(/\s/g, ''),
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
        telephone: site.contact.phone.replace(/\s/g, ''),
        email: site.contact.email,
        availableLanguage: ['English', 'Spanish'],
      },
    ],
    department: site.offices.map((o) => ({ '@id': abs(`/contact/#${o.id}`, base) })),
  };
}

export function offices(base: URL | string) {
  return site.offices.map((o) => ({
    '@type': 'ProfessionalService',
    '@id': abs(`/contact/#${o.id}`, base),
    name: `${site.name} — ${o.name.replace(' office', '')}`,
    url: abs('/contact/', base),
    image: abs('/og-default.png', base),
    telephone: site.contact.phone.replace(/\s/g, ''),
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
    description: site.description,
    inLanguage: site.lang,
    publisher: { '@id': orgId(base) },
  };
}

export function webPage(opts: { url: string; title: string; description: string; base: URL | string; type?: string }) {
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    inLanguage: site.lang,
    isPartOf: { '@id': websiteId(opts.base) },
    about: { '@id': orgId(opts.base) },
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

export function faqPage(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function serviceCatalog(name: string, services: { title: string; text: string }[], base: URL | string) {
  return {
    '@type': 'Service',
    name,
    provider: { '@id': orgId(base) },
    areaServed: 'Australia',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name,
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.text },
      })),
    },
  };
}

/** Serializa un grafo JSON-LD de forma segura para incrustarlo en HTML. */
export const toJsonLd = (graph: object[]) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
