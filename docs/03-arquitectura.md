# 03 · Arquitectura

## Principios

1. **Estático primero:** cada página se genera como HTML en el build. No hay servidor que
   mantener ni base de datos que atacar.
2. **El contenido es dato:** las páginas y artículos del WordPress viven como JSON en
   `src/content/wp/`, generados por `scripts/wp-import/convert.mjs` y editables a mano.
3. **Mismo diseño, sin su JavaScript:** el CSS de Elementor se vendoriza; lo que Elementor y
   los plugins hacían con JavaScript (menús, carruseles, pestañas…) lo hace código propio y
   mínimo en `src/scripts/wp/`.
4. **Estándares abiertos:** HTML, CSS, TypeScript y JSON. Nada atado a un proveedor.

## Flujo de una página

```
src/pages/[...slug].astro          (una entrada por página y por artículo)
  └─ BaseLayout.astro  → <head> (title, description, canonical, OG, JSON-LD), fuentes,
  │                       CSS global + CSS de la página, Header, Footer, WhatsApp, scripts
  └─ WpContent.astro   → HTML importado de src/content/wp/pages/<slug>.json
        └─ PostsGrid.astro  (donde había un widget de artículos: <wsg-posts>)
```

## Capas de CSS (en este orden)

1. Fuentes `@fontsource` + `src/styles/wp/vendor.css` (Elementor, widgets, plugins, tema, kit,
   header, footer) + `fontawesome.css` + `generated.css` + `src/styles/site.css` → un solo
   archivo empaquetado y cacheable por Astro.
2. `/wp-css/post-<id>.css` → CSS de Elementor específico de la página (se enlaza en el `<head>`).
3. `/wp-css/custom.css` → "CSS adicional" del personalizador de WordPress, el último, como allí.

## Rutas

| Archivo | URLs |
|---|---|
| `src/pages/[...slug].astro` | `/`, todas las páginas, `/blog/2/`, `/career/2/` y los artículos (`/<slug>/`) |
| `src/pages/category/[cat]/[...page].astro` | `/category/<slug>/` y `/category/<slug>/page/N/` |
| `src/pages/[year]/[month]/[...page].astro` | archivos mensuales `/2023/05/` |
| `src/pages/buscar.astro` | `/buscar/?s=texto` (búsqueda en el navegador con `/search-index.json`) |
| `src/pages/politica-de-privacidad.astro` | política de privacidad (era un popup de Elementor) |
| `src/pages/404.astro` | página no encontrada |
| `feed.xml.ts`, `llms.txt.ts`, `robots.txt.ts`, `search-index.json.ts` | endpoints generados en el build |

Con `trailingSlash: 'always'` y `format: 'directory'`, cada ruta termina en `/`, como en WordPress.

## Contenido importado (`src/content/wp/`)

Cada página es un JSON con `id` (id de WordPress), `slug`, `path`, `title`, `documentTitle`
(el `<title>` original), `description`, fechas, `css` (su hoja de estilos) y `html`. Los
artículos añaden `categories`, `excerpt`, `image` y `text` (texto plano para la búsqueda y
los extractos). `layout.json` tiene el header, el footer y la política de privacidad.

Dentro del `html` hay marcadores que rellena Astro:

| Marcador | Quién lo rellena |
|---|---|
| `<wsg-posts kind per-page excerpt-words read-more avatar paginate>` | `WpContent` → `PostsGrid` (listado de artículos con paginación) |
| `<wsg-post-title>`, `__WSG_CURRENT_URL__`, `<wsg-featured>`, `<wsg-post-content>` | `[...slug].astro` (plantilla de artículo) y archivos |
| `<wsg-newsletter>` | `Footer.astro` (formulario de newsletter) |

### Editar un texto

Abre `src/content/wp/pages/<slug>.json`, busca el texto dentro de `html` y cámbialo
conservando las etiquetas y clases. Ejecuta `npm run verify`. (El JSON escapa las comillas
dobles como `\"`.)

### Agregar o editar un artículo

Copia un archivo de `src/content/wp/posts/`, cambia `slug`, `path` (`/<slug>/`), `title`,
`date`, `modified`, `categories` (slugs de `site.json`), `excerpt`, `description`, `image`
(súbela a `public/uploads/AAAA/MM/` en WebP y pon `src`, `width`, `height`, `alt`), `html`
(el cuerpo, en HTML sencillo: `<p>`, `<h3>`, `<ul>`, `<a>`, `<img>`) y `text` (el mismo cuerpo
sin etiquetas). El listado del blog, las categorías, el feed, el sitemap, `llms.txt` y la
búsqueda se actualizan solos.

### Agregar una página nueva

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
---
<BaseLayout title="Becas" description="120–160 caracteres únicos…" breadcrumbs={[{ name: 'Becas', href: '/becas/' }]}>
  <div class="elementor">
    <section class="elementor-section elementor-top-section elementor-section-boxed">
      <div class="elementor-container"><div class="elementor-column elementor-col-100"><div class="elementor-widget-wrap elementor-element-populated">
        <h1 class="elementor-heading-title elementor-size-default">Becas</h1>
        <p>…</p>
      </div></div></div>
    </section>
  </div>
</BaseLayout>
```

Usar las clases de Elementor (`elementor-section`, `elementor-container`, `elementor-column`,
`elementor-heading-title`, `elementor-button`…) hace que la página herede el diseño del sitio.
Luego enlázala desde el menú (`layout.json` → `header`, en los dos `<ul>`) y en `nav` de
`src/config/site.ts`.

## Componentes y scripts

| Pieza | Función |
|---|---|
| `BaseLayout.astro` | Metadatos SEO, JSON-LD (Organization, ProfessionalService ×2, WebSite, WebPage, BreadcrumbList), fuentes, CSS, header, footer, WhatsApp, scripts |
| `Header.astro` / `Footer.astro` | HTML importado de `layout.json`; el header marca el ítem activo y añade flechas a los submenús; el footer inserta el formulario de newsletter |
| `WpContent.astro` | Renderiza el HTML importado y reemplaza los marcadores |
| `PostsGrid.astro` | Listado de artículos con el marcado del widget Posts de Elementor Pro (paginación incluida) |
| `WhatsAppFloat.astro` | Botón flotante de WhatsApp (equivalente al plugin Joinchat) |
| `scripts/wp/nav.ts` | Menú: hamburguesa, desplegables (hover en escritorio, flechas en táctil/teclado) |
| `scripts/wp/carousel.ts` | Carruseles de imágenes, testimonios y línea de tiempo (reemplaza Swiper/Slick) |
| `scripts/wp/slideshow.ts` | Fondos de sección en slideshow con efecto Ken Burns |
| `scripts/wp/tabs.ts`, `gallery.ts`, `video.ts`, `posts.ts`, `search.ts` | Pestañas, galería filtrable, fachada de YouTube, recorte de miniaturas, búsqueda |
| `scripts/forms.ts` | Envío del newsletter (POST JSON a `PUBLIC_FORM_ENDPOINT`, honeypot) |

Todo funciona sin JavaScript (contenido visible, enlaces, formulario del CRM en iframe); el JS
solo añade interacción.

## Formularios

- **Contacto principal ("Quiero ser contactado", "Contáctanos"):** iframe del CRM de la agencia
  (`https://access.welcomestudentsgroup.com/widget/form/8iTy04H9NYBRRRvX72in`). Los leads
  siguen llegando al mismo sistema que con WordPress. En WordPress también existía una versión
  en inglés (`…/Xp5ZbV4wSiM5wYytw1eq`) que se mostraba al cambiar de idioma con Google
  Translate; al eliminar el traductor, se muestra siempre la versión en español.
- **Newsletter (footer):** `src/scripts/forms.ts` envía `{ email, form: "newsletter", page }` a
  `PUBLIC_FORM_ENDPOINT`. Sin endpoint configurado no se finge éxito: se muestra el email de
  contacto. En WordPress era un formulario de Elementor Pro cuyo destino se configuraba allí;
  hay que decidir el nuevo destino (ver `docs/07-pendientes.md`).

## Imágenes

Las imágenes del WordPress están en `public/uploads/AAAA/MM/` (la misma ruta que en
`wp-content/uploads`), optimizadas en WebP: máximo 1600 px (1920 px los fondos), con una
variante de 768 px (`srcset`) para las grandes. Las miniaturas que Elementor mostraba a un
tamaño fijo (logo, logos de aliados, galería) se generan recortadas a ese tamaño y a 2x.
Para una imagen nueva: conviértela a WebP (p. ej. con `sharp` o Squoosh), ponla en
`public/uploads/AAAA/MM/` y referénciala con `width`, `height`, `alt` y `loading="lazy"`.

## Regenerar desde el WordPress

Mientras el WordPress siga publicado: `node scripts/wp-import/fetch.mjs` y
`node scripts/wp-import/convert.mjs` (ver `scripts/wp-import/README.md`). Ojo: sobrescribe
`src/content/wp/`, `public/uploads/`, `public/wp-css/` y `src/styles/wp/`; los cambios
hechos a mano en esos archivos se pierden.
