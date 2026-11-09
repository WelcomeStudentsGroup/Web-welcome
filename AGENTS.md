# AGENTS.md — Guía para personas y agentes de IA

> Este archivo es el **punto de entrada estándar** para cualquier asistente de IA
> (Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Gemini, Windsurf…) y para
> cualquier desarrollador que trabaje en este repositorio. Léelo completo antes de
> hacer cambios. `CLAUDE.md` solo importa este archivo, así hay una única fuente de verdad.

## 1. Qué es este proyecto

Sitio web oficial de **Welcome Students Group** (welcomestudentsgroup.com):
agencia registrada de **educación y migración**, fundada en 2015, con oficinas en
**Brisbane y Gold Coast (Queensland, Australia)**. Ayuda a estudiantes y profesionales
—principalmente de Latinoamérica— a vivir, estudiar y trabajar en **Australia**,
**Nueva Zelanda** y **Dubái**.

Este repositorio es la **réplica estática del sitio WordPress + Elementor original**
(`welcomestudentsgroup.com`), migrado en noviembre de 2026 a petición del cliente, que
prefirió conservar su sitio tal cual estaba. Se conservan **las mismas URLs, los mismos
textos, las mismas imágenes y el mismo diseño** (CSS de Elementor importado), sin
WordPress, sin plugins y sin JavaScript de terceros. Cómo se hizo:
[`docs/08-migracion-wordpress.md`](docs/08-migracion-wordpress.md).

Objetivos del sitio, en orden de prioridad:

1. **Fidelidad**: que el sitio se vea y se lea exactamente como el WordPress original.
2. **Generar consultas** (formulario del CRM, WhatsApp, newsletter).
3. **Velocidad y seguridad**: HTML estático, CSP estricta, sin terceros innecesarios.
4. **Portabilidad**: estándares abiertos, sin dependencia de ningún proveedor ni herramienta de IA.

Contexto completo del negocio: [`docs/01-negocio.md`](docs/01-negocio.md).

## 2. Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | [Astro](https://astro.build) 7, salida **estática** | HTML puro, JS mínimo, SEO excelente, hosting en cualquier lugar |
| Lenguaje | TypeScript (strict) + `.astro` | Tipos para el contenido importado |
| Contenido | JSON en `src/content/wp/` (generado por `scripts/wp-import/`) | Páginas y artículos tal como estaban en WordPress |
| Estilos | CSS de Elementor/plugins/tema vendorizado (`src/styles/wp/`) + `src/styles/site.css` | Mismo diseño que el original; sin frameworks |
| Fuentes | Roboto, Roboto Slab, Montserrat, Raleway, Slabo 13px/27px, Antic Slab y Zilla Slab (en lugar de Archer) auto-hospedadas (`@fontsource`) + subconjunto de Font Awesome | Sin Google Fonts: privacidad, velocidad, CSP |
| Node | 22 (ver `.nvmrc`) | |

## 3. Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor local en http://localhost:4321
npm run build        # genera el sitio estático en dist/
npm run preview      # sirve dist/ (aquí sí aplica la CSP, en dev no)
npm run check        # chequeo de tipos de Astro/TypeScript
npm run verify       # check + build + control de calidad (OBLIGATORIO antes de commit)
node scripts/generate-assets.mjs        # regenera favicon, íconos PNG, manifest e imagen Open Graph
node scripts/wp-import/fetch.mjs        # descarga un snapshot del WordPress original (API REST + HTML)
node scripts/wp-import/convert.mjs      # convierte el snapshot en el contenido del sitio
node scripts/wp-import/compare-text.mjs # comprueba que no falte texto respecto al WordPress
```

`npm run verify` falla si hay: enlaces internos rotos, anclas inexistentes, falta de
title/description/canonical/og:image, más o menos de un `<h1>`, JSON-LD inválido,
atributos `style=""`, `onclick=""`, `href="#"`, textos `[Insert…]`, ids duplicados,
`target=_blank` sin `noopener`, fuentes incrustadas como `data:` o espacios faltantes junto a enlaces.
La CI de GitHub corre lo mismo en cada push y pull request.

**Despliegue:** cada push a `main` ejecuta `.github/workflows/deploy.yml`, que verifica, compila y
copia `dist/` a la rama `deploy`; **Toolyx OS** publica esa rama automáticamente. No edites la
rama `deploy` a mano. Detalles en `docs/06-despliegue.md`.

## 4. Estructura

```
src/
  config/site.ts            ← datos del negocio (NAP, contacto, redes, oficinas) para SEO, JSON-LD, llms.txt y feed
  content/wp/               ← CONTENIDO IMPORTADO DEL WORDPRESS (generado; se puede editar a mano)
    pages/<slug>.json       ← cada página (HTML limpio + metadatos); la portada es home.json
    posts/<slug>.json       ← cada artículo del blog
    templates/single.json   ← plantilla del artículo individual (Elementor 21)
    templates/archive.json  ← plantilla de categorías y búsqueda (Elementor 5472)
    layout.json             ← header, footer y política de privacidad
    site.json               ← categorías e índices
  layouts/BaseLayout.astro  ← <head> SEO, Open Graph, JSON-LD, header/footer, WhatsApp, scripts
  components/               ← Header, Footer, WhatsAppFloat, WpContent (renderiza el HTML importado), PostsGrid
  pages/                    ← rutas: [...slug] (páginas y artículos), category/, [year]/[month]/, buscar, politica-de-privacidad, 404, feed.xml, llms.txt, robots.txt, search-index.json
  lib/wp.ts                 ← acceso tipado al contenido importado
  lib/schema.ts             ← datos estructurados schema.org
  scripts/wp/*.ts           ← JS propio que reemplaza al de Elementor/plugins (menú, carruseles, pestañas, video, galería, búsqueda, listados)
  scripts/forms.ts          ← envío del formulario de newsletter
  styles/site.css           ← estilos propios (complementan al CSS importado)
  styles/wp/                ← CSS importado: vendor.css, generated.css, fontawesome.css (generados, no editar a mano)
public/
  uploads/                  ← imágenes y PDF del WordPress, optimizados (generado)
  wp-css/                   ← CSS por página de Elementor + custom.css (generado)
  _headers, favicon.ico, íconos, og-default.png, security.txt, site.webmanifest
scripts/
  wp-import/                ← fetch.mjs, convert.mjs, compare-text.mjs, lib/ (ver su README)
  verify-build.mjs          ← control de calidad del build
  generate-assets.mjs       ← favicon, íconos y Open Graph a partir de src/assets/
docs/                       ← documentación detallada
.claude/skills/             ← skills (instrucciones expertas en Markdown) — ver sección 7
```

## 5. Reglas del proyecto (no negociables)

1. **Nunca inventar datos del negocio.** Teléfonos, direcciones, cifras, acreditaciones,
   testimonios, precios o logros solo pueden venir del equipo de Welcome (o del WordPress
   original). Si falta un dato, déjalo pendiente en `docs/07-pendientes.md`, no lo rellenes.
2. **Fidelidad con el original.** Los textos, imágenes y URLs vienen del WordPress. Un cambio
   de contenido lo pide el cliente; no "mejores" textos por iniciativa propia.
3. **Datos del negocio en dos lugares conocidos.** El header y el footer visibles están en
   `src/content/wp/layout.json`; los metadatos, JSON-LD, `llms.txt` y feed leen
   `src/config/site.ts`. Si cambia un teléfono, un email o una dirección, actualiza ambos.
4. **CSP estricta.** Prohibido: atributos `style="..."`, `onclick`, scripts o estilos de
   CDNs externos, fuentes de Google, iframes/embeds de terceros sin actualizar la CSP y
   `docs/05-seguridad.md`. Usa clases CSS y `<script>` dentro de componentes (Astro los
   empaqueta y calcula sus hashes). Los únicos iframes permitidos son el formulario del CRM
   (`access.welcomestudentsgroup.com`) y YouTube (`youtube-nocookie.com`, al pulsar play).
5. **No edites los archivos generados a mano si vas a volver a importar.** `src/content/wp/`,
   `public/uploads/`, `public/wp-css/` y `src/styles/wp/` los escribe `convert.mjs`. Una vez
   apagado el WordPress, se editan directamente (ver `docs/03-arquitectura.md`).
6. **Espacios en Astro 7.** Astro elimina los espacios en los saltos de línea junto a
   elementos. Si un texto continúa con un `<a>` en la línea siguiente, escribe `{' '}`
   al final de la línea anterior.
7. **SEO en cada página.** Toda página usa `BaseLayout` con `title`, `description` única y
   exactamente un `<h1>` (si el HTML importado no trae uno, se añade uno oculto con el título).
8. **Accesibilidad.** HTML semántico, `alt` en imágenes, foco visible, navegación con
   teclado (menús, pestañas, carruseles y galería responden a Enter/Espacio/Escape).
9. **Rendimiento.** No agregues librerías JS de cliente. Las imágenes van en WebP con
   dimensiones explícitas y `loading="lazy"` (salvo la primera de cada página).
10. **Idioma.** El sitio público está en **español** (como el original). La documentación y
    los comentarios del código están en **español**.
11. **Antes de cada commit:** `npm run verify` en verde. Commits pequeños y descriptivos.

## 6. Tareas frecuentes

- **Cambiar un texto de una página:** edita el campo `html` en `src/content/wp/pages/<slug>.json`
  (busca el texto; conserva las clases de Elementor). Luego `npm run verify`.
- **Cambiar un teléfono, email, dirección o red social:** `src/content/wp/layout.json`
  (footer visible) y `src/config/site.ts` (metadatos, JSON-LD, llms.txt).
- **Publicar un artículo:** copia un archivo de `src/content/wp/posts/`, cambia `slug`,
  `path`, `title`, `date`, `modified`, `categories`, `excerpt`, `description`, `image`
  (sube la imagen a `public/uploads/AAAA/MM/`), `html` y `text`. La URL será `/<slug>/`,
  como en WordPress.
- **Agregar una página nueva:** crea `src/pages/nombre.astro` con `BaseLayout` (ver
  `src/pages/politica-de-privacidad.astro` como ejemplo mínimo) y enlázala desde el menú
  en `src/content/wp/layout.json` y en `nav` de `src/config/site.ts`.
- **Cambiar el menú:** `src/content/wp/layout.json` → `header` (es el HTML del menú de
  Elementor; los dos bloques `<ul>` —escritorio y móvil— deben quedar iguales).
- **Conectar el formulario de newsletter:** define `PUBLIC_FORM_ENDPOINT` (ver `.env.example`
  y `docs/06-despliegue.md`). El formulario de contacto principal es un iframe del CRM y no
  necesita configuración.
- **Volver a traer cambios del WordPress** (mientras siga publicado): `node scripts/wp-import/fetch.mjs`
  y `node scripts/wp-import/convert.mjs`.

## 7. Skills (conocimiento experto reutilizable)

`.claude/skills/<nombre>/SKILL.md` contiene instrucciones expertas (SEO, GEO,
rendimiento, seguridad, redacción, etc.). Son **Markdown plano**: Claude Code las carga
automáticamente, y cualquier otra herramienta o persona puede leerlas y seguirlas.
Antes de trabajar en un área, revisa si existe una skill para ella. Ver
[`.claude/skills/README.md`](.claude/skills/README.md).

## 8. Documentación detallada

| Documento | Contenido |
|---|---|
| [docs/01-negocio.md](docs/01-negocio.md) | Empresa, público, servicios, tono de voz |
| [docs/02-marca-y-diseno.md](docs/02-marca-y-diseno.md) | Colores, tipografía y de dónde sale el diseño |
| [docs/03-arquitectura.md](docs/03-arquitectura.md) | Cómo está construido, cómo editar contenido y cómo extenderlo |
| [docs/04-seo-y-geo.md](docs/04-seo-y-geo.md) | Estrategia SEO técnico, local y GEO |
| [docs/05-seguridad.md](docs/05-seguridad.md) | CSP, cabeceras, formularios, dependencias |
| [docs/06-despliegue.md](docs/06-despliegue.md) | Hosting, variables de entorno, dominio, cambio de DNS |
| [docs/07-pendientes.md](docs/07-pendientes.md) | Decisiones y tareas pendientes |
| [docs/08-migracion-wordpress.md](docs/08-migracion-wordpress.md) | Qué se migró, cómo, qué cambió y cómo se verificó |
