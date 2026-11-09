# Welcome Students Group — Sitio web

Sitio oficial de **Welcome Students Group** (welcomestudentsgroup.com), agencia registrada
de educación y migración (desde 2015) que ayuda a estudiantes y profesionales a vivir,
estudiar y trabajar en **Australia, Nueva Zelanda y Dubái**. Oficinas en Brisbane y Gold Coast (QLD).

Es la **réplica estática del sitio WordPress + Elementor original**, construida con
[Astro](https://astro.build): mismas URLs, mismos textos, mismas imágenes y mismo diseño,
pero sin WordPress, sin plugins y sin JavaScript de terceros. Rápido, seguro (CSP estricta),
optimizado para buscadores (SEO) y motores de IA (GEO), y desplegable en cualquier hosting.

## Inicio rápido

Requisitos: Node.js 22 (`nvm use` lee `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:4321
npm run verify     # chequeo de tipos + build + control de calidad (antes de cada commit)
```

El sitio compilado queda en `dist/` y se puede publicar en Toolyx OS, Netlify, Cloudflare
Pages, Vercel, S3 o cualquier servidor web. Ver [docs/06-despliegue.md](docs/06-despliegue.md).

## Páginas (las mismas URLs que en WordPress)

| Ruta | Contenido |
|---|---|
| `/` | Portada |
| `/destinos/`, `/estudiar-en-australia/`, `/dubai/`, `/nueva-zelanda/` | Destinos |
| `/cursos-de-ingles/`, `/vocacionales/`, `/educacion-superior/`, `/cursos-migratorios/`, `/programa-vacacional-vet/` | Programas de estudio |
| `/adelaide/`, `/brisbane/`, `/canberra/`, `/darwin/`, `/gold-coast/`, `/hobart/`, `/melbourne/`, `/perth/`, `/sidney/`, `/sunshine-coast/` | Ciudades ("Elegir Vivir") |
| `/migracion/`, `/nosotros/`, `/friends/`, `/contacto/`, `/contenido-descargable/`, `/eventos/` | Servicios, empresa, comunidad, contacto, descargas |
| `/blog/`, `/blog/2/`, `/career/`, `/career/2/` | Listado de artículos (paginado) |
| `/<slug-del-articulo>/` | 16 artículos del blog, en la raíz como en WordPress |
| `/category/<categoria>/` (+ `/page/2/`), `/2023/05/`… | Archivos por categoría y por mes |
| `/buscar/?s=texto` | Búsqueda (en el navegador; WordPress la hacía en el servidor) |
| `/politica-de-privacidad/` | Política de privacidad (en WordPress era una ventana emergente) |
| `/feed.xml`, `/robots.txt`, `/sitemap-index.xml`, `/llms.txt` | RSS, rastreo, sitemap y resumen para IA |

## Para quien trabaje en este repo (personas o IA)

Lee **[AGENTS.md](AGENTS.md)**: propósito, stack, estructura, reglas y tareas frecuentes.
La documentación detallada está en [`docs/`](docs/); el relato de la migración en
[docs/08-migracion-wordpress.md](docs/08-migracion-wordpress.md) y los pendientes en
[docs/07-pendientes.md](docs/07-pendientes.md).

## Qué incluye

- **Contenido importado** del WordPress con un pipeline reproducible (`scripts/wp-import/`):
  30 páginas, 16 artículos, 4 categorías, 280 imágenes optimizadas (WebP) y 3 PDF.
- **Mismo diseño:** el CSS de Elementor, sus widgets, Essential Addons, Timeline Widget y el
  tema se vendorizan y se reescriben (fuentes auto-hospedadas, sin terceros).
- **JavaScript propio y mínimo** que reemplaza al de los plugins: menú con desplegables,
  carruseles, slideshows de fondo, pestañas, galería filtrable, video con fachada, búsqueda.
- **SEO técnico:** URLs y títulos originales, canonical, meta description, Open Graph,
  sitemap, robots.txt, RSS, datos estructurados schema.org (Organization, ProfessionalService
  ×2, WebSite con SearchAction, WebPage, BreadcrumbList, BlogPosting).
- **GEO:** `llms.txt` generado desde el contenido, rastreadores de IA permitidos.
- **Seguridad:** CSP estricta con hashes, HSTS y cabeceras en `public/_headers`, sin
  scripts de terceros, honeypot anti-spam, `security.txt`.
- **Calidad:** `npm run verify` + CI en GitHub Actions + `compare-text.mjs` (fidelidad
  frase a frase con el original).
