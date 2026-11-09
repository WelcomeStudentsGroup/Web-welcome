# 08 · Migración desde WordPress

En noviembre de 2026 el cliente pidió volver a su sitio WordPress + Elementor
(`welcomestudentsgroup.com`) en lugar del rediseño que había en este repositorio. Este
documento explica cómo se replicó ese sitio aquí, qué cambió y cómo se verificó.

## Origen

- **WordPress 7** con **Elementor Pro**, tema propio *JaGonzalez*, plugins Essential Addons,
  PowerPack, Timeline Widget, Joinchat (WhatsApp), Google Language Translator, GTM4WP,
  HubSpot, Contact Form 7 y LiteSpeed Cache.
- **30 páginas** publicadas (portada, destinos, 10 ciudades, programas, migración, nosotros,
  friends, contacto, blog, career, contenido descargable, eventos, términos, "welcome-2"),
  **16 artículos**, **4 categorías**, 433 medios, menú de 3 niveles, header y footer de
  Elementor y un popup con la política de privacidad.
- Idioma: español. Sin meta descriptions, con el sitemap roto (redirigía a la portada).

## Método

No se usó un exportador de WordPress (no había acceso al panel) sino la **API REST pública**
(`/wp-json/wp/v2/pages|posts|categories|media`) para los metadatos y el **HTML que ve el
visitante** para el contenido, ya que Elementor guarda las páginas como JSON propio y solo el
HTML renderizado refleja el resultado final. Todo está automatizado y es repetible:

1. `node scripts/wp-import/fetch.mjs` descarga el snapshot (API, HTML de todas las URLs,
   110 hojas de estilo, fuentes de iconos).
2. `node scripts/wp-import/convert.mjs` limpia el HTML de cada página, resuelve y optimiza
   las imágenes, reescribe el CSS y genera `src/content/wp/`, `public/uploads/`,
   `public/wp-css/` y `src/styles/wp/` (detalles en `scripts/wp-import/README.md`).
3. Astro renderiza ese contenido con la misma estructura de Elementor (`src/pages/[...slug].astro`,
   `WpContent.astro`, `PostsGrid.astro`) y el mismo header/footer.
4. JavaScript propio (`src/scripts/wp/`) reemplaza a Elementor, Swiper, Slick, Essential
   Addons y Joinchat para menús, carruseles, slideshows, pestañas, galería, video y WhatsApp.

## Qué es exactamente igual

- Las **URLs** (incluidos artículos en la raíz, categorías y paginación `/blog/2/`).
- Los **textos**: `compare-text.mjs` compara frase a frase el texto visible de las 56 URLs
  del snapshot con las generadas; resultado: **0 frases faltantes** (las únicas diferencias
  son de salto de línea, no de contenido).
- Las **imágenes** (originales de la biblioteca, optimizadas en WebP, con el mismo tamaño
  de visualización, `alt` y recortes) y los **PDF** descargables.
- El **diseño**: mismo CSS de Elementor por página, kit global, header, footer y "CSS
  adicional" del personalizador; mismas fuentes (auto-hospedadas); iconos de Font Awesome y
  SVG inline con el color efectivo que tenían (se reproduce la cascada global de los
  `<style>` de los SVG). Se comparó con capturas lado a lado en escritorio (1366 px) y móvil
  (390 px): portada, ciudades, contacto, blog, artículo, nosotros, destinos, cursos
  migratorios, friends y estudiar en Australia; medidas idénticas de cabecera, logo, tipografía
  del artículo y miniaturas del blog.
- Los **títulos** `<title>` originales, el menú de tres niveles, el botón de WhatsApp con su
  número y mensaje, los formularios del CRM (mismo iframe), las pestañas con la misma
  pestaña activa por defecto, la galería filtrable, los testimonios.

## Qué cambia (y por qué)

| Elemento | Antes | Ahora |
|---|---|---|
| Video de fondo de la portada (YouTube) | Reproductor de YouTube | Fotograma del video con el mismo degradado encima (sin scripts de YouTube) |
| Videos incrustados (portada, nosotros, eventos, welcome-2) | iframe de YouTube al cargar | Imagen de portada; el iframe (`youtube-nocookie.com`) se crea al pulsar play |
| Google Translate (EN/ES) | Banderas en el header | Eliminado (sitio en español; el formulario del CRM se muestra siempre en español) |
| Google Tag Manager, HubSpot | Cargados en todas las páginas | No (decisión pendiente, `docs/07-pendientes.md`) |
| Política de privacidad | Popup de Elementor | Página `/politica-de-privacidad/` enlazada desde el footer |
| Búsqueda | `/?s=texto` en el servidor | `/buscar/?s=texto` en el navegador (índice de páginas y artículos) |
| Newsletter del footer | Formulario de Elementor Pro | Formulario propio → `PUBLIC_FORM_ENDPOINT` (pendiente de configurar) |
| Eventbrite (`/eventos/`) | Widget de compra | Enlace al evento |
| Archer (fuente comercial sin licencia web en el repo) | TTF servidos por WordPress | Roboto Slab |
| Feed RSS | `/feed/` | `/feed.xml` |
| `?p=ID`, `/author/…`, páginas de adjuntos | Funcionaban en WordPress | No existen (no estaban enlazadas) |
| Páginas con varios `<h1>` o sin ninguno | Tal cual | Un solo `<h1>` por página (SEO) con el mismo estilo visual |
| Meta description, canonical, Open Graph, sitemap, JSON-LD, `llms.txt` | Ausentes o rotos | Generados |
| Animaciones de entrada de Elementor (fade, zoom) | Con JavaScript | Sin animación: el contenido es visible desde el primer momento |
| Peso | ~1 MB de JS de WordPress/Elementor + CSS y fuentes externas | ~13 KB de JS, CSS propio y fuentes auto-hospedadas |

## Cómo se verificó

- `npm run verify`: 59 páginas, sin errores (enlaces, anclas, metadatos, JSON-LD, CSP,
  `alt`, ids, `noopener`).
- `scripts/wp-import/compare-text.mjs`: 0 frases faltantes en las 56 URLs.
- Capturas de pantalla comparadas lado a lado con Playwright (sitio original vs
  `npm run preview`) en escritorio y móvil, y medidas de elementos clave con el DOM
  (cabecera 120 px, logo 110 px, texto de artículo 20 px, miniaturas 281×180 px).
- Pruebas de interacción: menú desplegable (escritorio y móvil, 3 niveles), pestañas,
  galería filtrable, fachada de video, búsqueda, paginación, 404.
- Sin errores de consola ni violaciones de CSP en `npm run preview`.

## Auditoría visual posterior (noviembre de 2026)

Tras la primera entrega, cinco revisiones independientes compararon todas las páginas (escritorio
y móvil) con el original, con `scripts/wp-import/qa-compare.cjs` y medidas del DOM. Se corrigió:

- Columnas con alineación vertical centrada (Elementor usa `[data-element_type="column"]` en su
  CSS; el conversor ya no elimina ese atributo).
- Orden de las hojas de estilo igual al de WordPress (tema antes que Elementor; CSS de página y
  "CSS adicional" después del paquete global) → títulos de tarjetas, carruseles, etiquetas del mapa.
- Altura del formulario del CRM: dinámica, con el protocolo de mensajes del propio formulario.
- Menú: flecha `fa-caret-down` de Font Awesome, desplegables de 130 px sin sombra, submenús
  anidados a la misma altura; menú móvil justo bajo el botón, con los paddings de Elementor.
- Carruseles: clase `swiper-initialized` (en móvil los logos salían a 62 px), sin separación entre
  logos, línea de tiempo con 15 px entre tarjetas, zoom Ken Burns 1→1,3 lineal en 20 s.
- Icono de comillas de los testimonios (glifo de Font Awesome puesto por CSS) y caret del menú
  añadidos al subconjunto de la fuente.
- Cursivas reales de Montserrat, Roboto y Raleway.
- Mapa "Elije tu destino": interacción al pulsar una ciudad (panel "Datos de…").
- Política de privacidad con el CSS y el ancho (640 px) de la ventana emergente original.
- Búsqueda: 10 resultados por página con paginación; páginas con fecha e imagen destacada.
- Paginación del blog con el espacio entre números.
- Testimonios PowerPack (portada, eventos): mostrados como estaban diseñados (ver `docs/07-pendientes.md`).

## Repetir la importación

Mientras el WordPress siga en línea, cualquier cambio allí se trae con `fetch.mjs` +
`convert.mjs` + `npm run verify` + `compare-text.mjs`. La conversión es determinista: con
el mismo snapshot genera los mismos archivos.
