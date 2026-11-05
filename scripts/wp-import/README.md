# Importación del WordPress original

Herramientas con las que se migró el sitio WordPress + Elementor de
**welcomestudentsgroup.com** a este repositorio (Astro, estático). No necesitan
credenciales: usan la API REST pública (`/wp-json/wp/v2/`) y el HTML que ve cualquier
visitante.

```bash
node scripts/wp-import/fetch.mjs          # 1. descarga el snapshot (API + HTML + CSS + fuentes)
node scripts/wp-import/convert.mjs        # 2. convierte el snapshot en contenido del sitio
npm run verify                            # 3. compila y pasa el control de calidad
node scripts/wp-import/compare-text.mjs   # 4. comprueba que no falte ni una frase
```

## Qué genera `convert.mjs`

| Salida | Contenido |
|---|---|
| `src/content/wp/layout.json` | Header y footer (HTML limpio) y la política de privacidad (era un popup) |
| `src/content/wp/pages/<slug>.json` | Cada página: título, descripción, fechas, HTML limpio y su hoja de estilos |
| `src/content/wp/posts/<slug>.json` | Cada artículo: metadatos, categorías, imagen destacada, HTML y texto plano |
| `src/content/wp/templates/*.json` | Plantillas de Elementor del artículo individual y de los archivos (categorías, búsqueda) |
| `src/content/wp/site.json` | Categorías, índice de páginas y artículos, datos de WhatsApp |
| `public/uploads/**` | Imágenes optimizadas (WebP, máx. 1600 px; fondos 1920 px) y PDF, con las rutas originales |
| `public/wp-css/post-<id>.css` | CSS de Elementor específico de cada página (reescrito, minificado) |
| `public/wp-css/custom.css` | "CSS adicional" del personalizador de WordPress (se carga el último, como allí) |
| `src/styles/wp/vendor.css` | CSS base de Elementor, plugins y tema (una sola vez para todo el sitio) |
| `src/styles/wp/generated.css` | Clases generadas a partir de `style="…"` y fondos de slideshow |
| `src/styles/wp/fontawesome.css` + `fonts/` | Subconjunto de Font Awesome con solo los 35 iconos usados |

El snapshot vive en `scripts/wp-import/snapshot/` (ignorado por git) y hace de caché:
volver a ejecutar `convert.mjs` tarda segundos.

## Qué hace la limpieza (`lib/sanitize.mjs`)

- Elimina scripts, estilos inline, atributos de edición de Elementor y clases de animación
  (todo el contenido es visible sin JavaScript y cumple la CSP estricta).
- Convierte cada `style="…"` en una clase (`wsg-s-xxxx`) de `generated.css`.
- Aplica los `<style>` de los SVG como atributos, respetando la cascada global del
  documento (en WordPress el color real de un icono era el de la última regla `.st0` de la
  página).
- Reemplaza lo que dependía de JavaScript de terceros por equivalentes estáticos:
  video de YouTube → fachada con imagen (el iframe se crea al pulsar); fondo en slideshow →
  marcado propio; fondo de video → fotograma; formulario del CRM → iframe limpio;
  Eventbrite → enlace; Google Translate → eliminado.
- Deja marcadores (`<wsg-posts>`, `<wsg-post-title>`, `<wsg-newsletter>`…) donde el
  contenido es dinámico; los componentes de Astro los rellenan.
- Localiza enlaces (`https://welcomestudentsgroup.com/x/` → `/x/`, `#whatsapp` → wa.me,
  popup de privacidad → `/politica-de-privacidad/`) e imágenes (original optimizado, con
  el tamaño con que se mostraba en WordPress).

## Control de fidelidad

- `compare-text.mjs` compara frase a frase el texto visible de cada URL del snapshot con la
  página generada en `dist/`. El resultado esperado es 0 frases faltantes en todas las URLs
  (las únicas diferencias son de formato, no de contenido).
- Para una comparación visual, con Playwright instalado se pueden capturar las páginas del
  sitio original y de `npm run preview` y ponerlas lado a lado (ver `docs/08-migracion-wordpress.md`).

## Si cambia el WordPress antes del cambio de DNS

Mientras el WordPress siga publicado, cualquier cambio de contenido allí se trae con los
pasos 1 a 4. Una vez apagado el WordPress, el contenido se edita directamente en este
repositorio (ver `docs/03-arquitectura.md`).
