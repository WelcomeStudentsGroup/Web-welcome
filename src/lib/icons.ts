/**
 * Iconos de línea (24×24, stroke = currentColor). Se renderizan con <Icon name="..."/>.
 * Para agregar uno: añade aquí su markup SVG interno.
 */
export const icons = {
  cap: '<path d="M2 8 12 3l10 5-10 5L2 8Z"/><path d="M6 10.3V15c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.7"/><path d="M21 9v6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-6-3.8-9s1.3-6.5 3.8-9Z"/>',
  people: '<circle cx="8.5" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M2.5 20c.6-3.8 3-6 6-6s5.4 2.2 6 6"/><path d="M14.8 14.2c2.4.2 4.2 2.2 4.7 5.3"/>',
  passport: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="9" r="2.6"/><path d="M8.5 17c.7-2 2-3 3.5-3s2.8 1 3.5 3"/>',
  briefcase: '<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M8.5 7.5V6a2.5 2.5 0 0 1 2.5-2.5h2A2.5 2.5 0 0 1 15.5 6v1.5"/><path d="M3 12.5h18"/>',
  heart: '<path d="M12 20.5S3.5 15.4 3.5 9.3A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.5 2.9c0 6.1-8.5 11.2-8.5 11.2Z"/>',
  'doc-check': '<path d="M7 2.5h7l4 4V21a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3.5A1 1 0 0 1 7 2.5Z"/><path d="M14 2.5V7h4"/><path d="M8.5 14.5l2 2 4-4.4"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  pin: '<path d="M12 21.5s7-6.6 7-12.2A7 7 0 0 0 5 9.3c0 5.6 7 12.2 7 12.2Z"/><circle cx="12" cy="9.2" r="2.6"/>',
  phone: '<path d="M4.5 3.5h4l1.6 5-2.3 1.8a13 13 0 0 0 6 6l1.8-2.3 5 1.6v4a1.5 1.5 0 0 1-1.6 1.5A17 17 0 0 1 3 5.1a1.5 1.5 0 0 1 1.5-1.6Z"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 6.5 12 13l9-6.5"/>',
  message: '<path d="M3 4.5h18v12H8l-5 4V4.5Z"/>',
  plane: '<path d="M10.5 3.5 3 12l3 1 2-1.8 1 4.2 1.6-.6.4-6.4 5-5.5c1-1.1 3-.4 2.7 1.1-.2 1-3.9 5.2-3.9 5.2l.7 5.4-1.6.6-2.4-3.9-6.4.4-.5-1.6Z"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h6"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14.2 7 21l5-2.6 5 2.6-1.5-6.8"/>',
  hub: '<circle cx="12" cy="6" r="2.6"/><circle cx="6" cy="17" r="2.6"/><circle cx="18" cy="17" r="2.6"/><path d="M12 8.6v3.4M9.6 15.3 11 12M14.4 15.3 13 12"/>',
  'user-check': '<circle cx="10" cy="8" r="4"/><path d="M2.5 20c.7-4 3.6-6.5 7.5-6.5 1 0 1.9.15 2.7.45"/><path d="M15.5 17.2 18 19.6l4-4.2"/>',
  download: '<path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  suitcase: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/>',
  facebook: '<path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v6h3v-6h3l1-3h-4V9c0-.5.5-1 1-1Z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10.5v6M7.5 7.7v.1M11 16.5v-3.7c0-1.4 1-2.3 2.3-2.3 1.3 0 2.2.9 2.2 2.3v3.7"/>',
  youtube: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="m10.5 10 4 2-4 2v-4Z"/>',
} as const;

export type IconName = keyof typeof icons;
