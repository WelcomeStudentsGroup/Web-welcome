// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Dominio de producción. Cámbialo aquí (o con SITE_URL) si el dominio cambia:
// se usa para canonical, sitemap, Open Graph y datos estructurados.
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const SITE_URL = env.SITE_URL || 'https://welcomestudentsgroup.com.au';

// Endpoint opcional para formularios (Formspree, Web3Forms, API propia...).
// Su origen se agrega a la CSP para permitir el envío.
const formOrigin = (() => {
  try {
    return env.PUBLIC_FORM_ENDPOINT ? new URL(env.PUBLIC_FORM_ENDPOINT).origin : '';
  } catch {
    return '';
  }
})();

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS en archivos externos cacheables; la CSP no necesita 'unsafe-inline'.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      // Nunca incrustar assets como data: URI (la CSP solo permite fuentes de 'self').
      assetsInlineLimit: 0,
    },
  },
  markdown: {
    // Shiki usa estilos inline incompatibles con la CSP estricta.
    syntaxHighlight: false,
  },
  integrations: [
    sitemap({
      // Las páginas legales en borrador y la 404 no se indexan.
      filter: (page) => !/\/(privacy|terms|404)\/?$/.test(page),
    }),
  ],
  security: {
    csp: {
      // os.toolyx.com: píxel de estadísticas/atribución de Toolyx OS (hosting actual).
      scriptDirective: {
        resources: ["'self'", 'https://os.toolyx.com'],
      },
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        `connect-src 'self' https://os.toolyx.com${formOrigin ? ' ' + formOrigin : ''}`,
        `form-action 'self'${formOrigin ? ' ' + formOrigin : ''}`,
        "base-uri 'self'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },
});
