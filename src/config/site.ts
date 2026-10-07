/**
 * FUENTE ÚNICA DE VERDAD de los datos del negocio.
 *
 * Nombre, dirección, teléfonos, email, redes y acreditaciones se usan en el
 * header, footer, página de contacto, datos estructurados (JSON-LD), llms.txt
 * y metadatos. Cambia un dato aquí y se actualiza en todo el sitio.
 * La consistencia de estos datos (NAP: Name, Address, Phone) es clave para el
 * SEO local y para que los motores de IA (GEO) citen información correcta.
 */

export const site = {
  name: 'Welcome Students Group',
  shortName: 'Welcome',
  tagline: 'Education & Migration',
  legalName: 'Welcome Students Group',
  foundingYear: 2015,
  locale: 'en_AU',
  lang: 'en-AU',
  description:
    'Registered education & migration agency helping students and professionals live, study and work in Australia, New Zealand and Dubai. Free consultation.',
  /** Resumen factual corto, reutilizado en llms.txt y en el footer. */
  summary:
    'Registered education & migration agency helping students and skilled professionals live, study and work in Australia, New Zealand & Dubai for over 10 years.',

  contact: {
    phone: '+61 421 273 080',
    phoneHref: 'tel:+61421273080',
    whatsapp: '+61 404 315 695',
    whatsappHref: 'https://wa.me/61404315695',
    whatsappPrefill:
      "Hi Welcome Students Group, I'd like to know more about studying in Australia.",
    email: 'info@welcomestudentsgroup.com.au',
    emailHref: 'mailto:info@welcomestudentsgroup.com.au',
    responseTime: 'within one business day',
  },

  offices: [
    {
      id: 'brisbane',
      name: 'Brisbane office',
      streetAddress: 'Level 18, 324 Queen St',
      locality: 'Brisbane City',
      region: 'QLD',
      postalCode: '4000',
      country: 'AU',
    },
    {
      id: 'gold-coast',
      name: 'Gold Coast office',
      streetAddress: 'Level 9, Wyndham Building, 1 Corporate Ct',
      locality: 'Bundall',
      region: 'QLD',
      postalCode: '4217',
      country: 'AU',
    },
  ],

  /**
   * Perfiles sociales oficiales. PENDIENTE: completar las URLs reales.
   * Solo se muestran (y se agregan a `sameAs` en JSON-LD) los que tienen URL.
   */
  social: {
    handle: '@WelcomeStudentsGroup',
    instagram: '',
    facebook: '',
    linkedin: '',
    youtube: '',
  },

  accreditations: ['QEAC', 'ISEAA', 'ICEF', 'English Australia', 'Australia Future Unlimited'],

  destinations: ['Australia', 'New Zealand', 'Dubai'],
} as const;

export type Office = (typeof site.offices)[number];

export const formatAddress = (o: Office) =>
  `${o.streetAddress}, ${o.locality} ${o.region} ${o.postalCode}`;

export const whatsappLink = (text: string = site.contact.whatsappPrefill) =>
  `${site.contact.whatsappHref}?text=${encodeURIComponent(text)}`;

export const socialLinks = (
  [
    { key: 'instagram', label: 'Instagram', url: site.social.instagram },
    { key: 'facebook', label: 'Facebook', url: site.social.facebook },
    { key: 'linkedin', label: 'LinkedIn', url: site.social.linkedin },
    { key: 'youtube', label: 'YouTube', url: site.social.youtube },
  ] as const
).filter((s) => s.url !== '');

export const yearsOfExperience = new Date().getFullYear() - site.foundingYear;

/** Navegación principal (header, menú móvil y footer). */
export const nav = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: '/services/', label: 'Services' },
  { href: '/destinations/', label: 'Destinations' },
  { href: '/news/', label: 'News' },
  { href: '/contact/', label: 'Contact' },
] as const;
