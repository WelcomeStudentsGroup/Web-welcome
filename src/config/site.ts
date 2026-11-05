/**
 * FUENTE ÚNICA DE VERDAD de los datos del negocio.
 *
 * Todos los valores provienen del sitio WordPress original (welcomestudentsgroup.com):
 * footer, página de contacto, botón de WhatsApp (plugin Joinchat) y política de privacidad.
 * Se usan en los metadatos, los datos estructurados (JSON-LD), llms.txt y el feed RSS.
 * El header y el footer visibles vienen del HTML importado (src/content/wp/layout.json);
 * si cambia un teléfono o una dirección hay que actualizar ambos lugares.
 */

export const site = {
  name: 'Welcome Students Group',
  shortName: 'Welcome',
  tagline: 'Education & Migration',
  /** Descripción del sitio en WordPress (Ajustes → Generales). */
  wpTagline: 'Welcome Students Group is a registered education agency that has been helping international students since 2015',
  legalName: 'Welcome Students Group',
  foundingYear: 2015,
  locale: 'es_ES',
  lang: 'es',
  description:
    'Agencia de educación y migración registrada desde 2015. Asesoría gratuita para vivir, estudiar y trabajar en Australia, Nueva Zelanda y Dubái. Oficinas en Brisbane y Gold Coast.',

  contact: {
    phone: '(+61) 421 273 080',
    phoneHref: 'tel:+61421273080',
    whatsapp: '+61 404 315 695',
    whatsappNumber: '61404315695',
    whatsappHref: 'https://wa.me/61404315695',
    /** Mensaje predefinido del botón de WhatsApp del sitio original. */
    whatsappPrefill: '¡Hola Welcome! Quiero que me llamen, por favor.',
    email: 'info@welcomestudentsgroup.com.au',
    emailHref: 'mailto:info@welcomestudentsgroup.com.au',
  },

  offices: [
    {
      id: 'brisbane',
      name: 'Brisbane',
      streetAddress: 'Level 18, 324 Queen St',
      locality: 'Brisbane City',
      region: 'QLD',
      postalCode: '4000',
      country: 'AU',
      mapUrl:
        'https://www.google.com/maps/place/Welcome+Students+Group/@-27.4666127,153.0260324,17z/data=!3m1!4b1!4m6!3m5!1s0x6b915a1d3f655555:0x78bc009221ab2ae1!8m2!3d-27.4666175!4d153.0286127!16s%2Fg%2F11f0ky2pqq?entry=ttu',
    },
    {
      id: 'gold-coast',
      name: 'Gold Coast',
      streetAddress: 'Level 9, Wyndham Building, 1 Corporate Ct',
      locality: 'Bundall',
      region: 'QLD',
      postalCode: '4217',
      country: 'AU',
      mapUrl: '',
    },
  ],

  social: {
    facebook: 'https://www.facebook.com/Welcomestudentsgroup',
    instagram: 'https://www.instagram.com/welcomestudentsgroup/',
    tiktok: 'https://www.tiktok.com/@welcomestudentsgroup',
    linkedin: 'https://www.linkedin.com/company/welcome-students-group/',
    youtube: 'https://www.youtube.com/channel/UC6eUOrscDuFQC2WW6ezKKrA',
  },

  /** Certificaciones que muestra el carrusel "Certificaciones" del sitio. */
  accreditations: ['QEAC', 'ISEAA', 'ICEF', 'English Australia', 'Australia Future Unlimited'],

  destinations: ['Australia', 'Nueva Zelanda', 'Dubái'],
} as const;

export type Office = (typeof site.offices)[number];

export const formatAddress = (o: Office) => `${o.streetAddress}, ${o.locality} ${o.region} ${o.postalCode}`;

export const whatsappLink = (text: string = site.contact.whatsappPrefill) =>
  `${site.contact.whatsappHref}?text=${encodeURIComponent(text)}`;

export const socialLinks = (
  [
    { key: 'facebook', label: 'Facebook', url: site.social.facebook },
    { key: 'instagram', label: 'Instagram', url: site.social.instagram },
    { key: 'tiktok', label: 'TikTok', url: site.social.tiktok },
    { key: 'linkedin', label: 'LinkedIn', url: site.social.linkedin },
    { key: 'youtube', label: 'YouTube', url: site.social.youtube },
  ] as const
).filter((s) => Boolean(s.url));

export const yearsOfExperience = new Date().getFullYear() - site.foundingYear;

/**
 * Menú principal (misma estructura que el WordPress). El header visible se renderiza
 * desde src/content/wp/layout.json; esta copia alimenta llms.txt y la documentación.
 */
export const nav = [
  { href: '/', label: 'Inicio' },
  {
    href: '/destinos/',
    label: 'Destinos',
    children: [
      {
        href: '/estudiar-en-australia/',
        label: 'Australia',
        children: [
          { href: '/cursos-de-ingles/', label: 'Cursos de Inglés' },
          { href: '/vocacionales/', label: 'Vocacionales' },
          { href: '/educacion-superior/', label: 'Educación Superior' },
          { href: '/cursos-migratorios/', label: 'Cursos Migratorios' },
          { href: '/friends/', label: 'Friends' },
          {
            href: '',
            label: 'Elegir Vivir',
            children: [
              { href: '/adelaide/', label: 'Adelaide' },
              { href: '/brisbane/', label: 'Brisbane' },
              { href: '/canberra/', label: 'Canberra' },
              { href: '/darwin/', label: 'Darwin' },
              { href: '/gold-coast/', label: 'Gold Coast' },
              { href: '/hobart/', label: 'Hobart' },
              { href: '/melbourne/', label: 'Melbourne' },
              { href: '/perth/', label: 'Perth' },
              { href: '/sidney/', label: 'Sídney' },
              { href: '/sunshine-coast/', label: 'Sunshine Coast' },
            ],
          },
        ],
      },
      { href: '/dubai/', label: 'Dubái' },
      { href: '/nueva-zelanda/', label: 'Nueva Zelanda' },
    ],
  },
  { href: '/migracion/', label: 'Migración' },
  { href: '/nosotros/', label: 'Nosotros' },
  {
    href: '',
    label: 'Blog',
    children: [
      { href: '/blog/', label: 'Noticias' },
      { href: '/contenido-descargable/', label: 'Contenido Descargable' },
      { href: '/career/', label: 'Career' },
    ],
  },
  { href: '/contacto/', label: 'Contacto' },
] as const;
