# Welcome Students Group — Sitio web

Sitio oficial de **Welcome Students Group**, agencia registrada de educación y migración
(desde 2015) que ayuda a estudiantes y profesionales a vivir, estudiar y trabajar en
**Australia, Nueva Zelanda y Dubái**. Oficinas en Brisbane y Gold Coast (QLD).

Construido con [Astro](https://astro.build) como sitio **estático**: rápido, seguro,
optimizado para buscadores (SEO) y motores de IA (GEO), y desplegable en cualquier hosting.

## Inicio rápido

Requisitos: Node.js 22 (`nvm use` lee `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:4321
npm run verify     # chequeo de tipos + build + control de calidad (antes de cada commit)
```

El sitio compilado queda en `dist/` y se puede publicar en Netlify, Cloudflare Pages,
Vercel, GitHub Pages, S3 o cualquier servidor web. Ver [docs/06-despliegue.md](docs/06-despliegue.md).

## Páginas

| Ruta | Contenido |
|---|---|
| `/` | Home: propuesta de valor, pilares, proceso en 6 pasos, destinos, programas, testimonios |
| `/about/` | Propósito, valores, 7 razones, acreditaciones |
| `/services/` | Educación, migración y visas, explorador de visas, WelcomeHub, soporte, FAQ |
| `/destinations/` | Australia (8 ciudades), Nueva Zelanda, Dubái |
| `/contact/` | Oficinas, teléfono, WhatsApp, email, formulario |
| `/news/` | Artículos (Markdown), recursos, empleo, newsletter |
| `/privacy/`, `/terms/` | Borradores legales (noindex hasta revisión legal) |
| `/robots.txt`, `/sitemap-index.xml`, `/llms.txt` | Rastreo, sitemap y resumen para IA |

## Para quien trabaje en este repo (personas o IA)

Lee **[AGENTS.md](AGENTS.md)**: propósito, stack, estructura, reglas y tareas frecuentes.
La documentación detallada está en [`docs/`](docs/) y los pendientes de contenido en
[docs/07-pendientes.md](docs/07-pendientes.md).

## Qué incluye

- **SEO técnico:** URLs limpias, canonical, meta por página, Open Graph/Twitter, sitemap,
  robots.txt, migas de pan, datos estructurados schema.org (Organization,
  EducationalOrganization, ProfessionalService ×2 oficinas, WebSite, BreadcrumbList,
  FAQPage, Service, Article).
- **GEO (IA generativa):** `llms.txt` generado desde los datos, rastreadores de IA
  permitidos, datos factuales consistentes y FAQ estructuradas.
- **Rendimiento:** HTML estático, JS mínimo y sin frameworks, fuentes auto-hospedadas con
  preload, CSS cacheable, sin terceros.
- **Seguridad:** CSP estricta con hashes, HSTS, X-Frame-Options, Permissions-Policy,
  honeypot anti-spam, sin secretos en el repo, `security.txt`.
- **Accesibilidad:** HTML semántico, contraste AA, `<dialog>` nativo, FAQ con
  `<details>`, foco visible, `prefers-reduced-motion`.
- **Calidad:** `npm run verify` + CI en GitHub Actions.
