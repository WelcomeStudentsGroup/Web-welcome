# 02 · Marca y diseño

El diseño **no se rediseñó**: es el del sitio WordPress + Elementor original. El CSS de
Elementor (kit global, header, footer y cada página) se importa tal cual y se reescribe
solo lo imprescindible (fuentes auto-hospedadas, rutas locales de imágenes). Por eso no hay
un sistema de tokens propio: los colores y tipografías los define el **kit de Elementor**
(`.elementor-kit-5`, en `src/styles/wp/vendor.css`).

## Colores (kit de Elementor)

| Variable | Valor | Uso |
|---|---|---|
| `--e-global-color-primary` | `#EF7300` | Naranja de marca: botones, títulos, iconos |
| `--e-global-color-secondary` | `#003C39` | Verde oscuro: menú, títulos secundarios |
| `--e-global-color-text` | `#3A3A3A` | Texto |
| `--e-global-color-accent` | `#EF7300` | Acento |
| `--e-global-color-8a555f1` / `346a7db` | `#7C1E7D` | Morado de marca: fondos, menú móvil |
| Degradado de marca | `#EE7300 → #7C1E7D` | Superposiciones de las cabeceras |

## Tipografía

El kit usaba Google Fonts; aquí todas las familias se **auto-hospedan** con `@fontsource`
(el conversor renombra las familias en el CSS):

| En WordPress | En este sitio | Uso |
|---|---|---|
| Roboto | Roboto Variable | Primaria (títulos) |
| Roboto Slab | Roboto Slab Variable | Secundaria (títulos de sección) |
| Montserrat | Montserrat Variable | Texto |
| Raleway | Raleway Variable | Detalles |
| Slabo 13px / Slabo 27px | iguales | Títulos de widgets |
| Antic Slab | igual | Menú principal |
| Archer (TTF subido al WordPress, fuente comercial) | Zilla Slab (misma anchura de texto, ±1 %) | Enlaces, título "Síguenos" del footer, títulos de /nosotros/ y /eventos/ |
| Gotham Rounded | Montserrat Variable | Detalles |
| Font Awesome 5 Free | Subconjunto de 35 iconos (`src/styles/wp/fontawesome.css`) | Iconos de listas, redes, botones |
| eicons (Elementor) | SVG inline (`scripts/wp-import/lib/icons.mjs`) | Flechas de carrusel, estrellas, play, menú |

**Archer:** el WordPress servía archivos TTF de Archer descargados de un sitio de fuentes
gratuitas. Archer es una fuente comercial (Hoefler&Co.); no se copió al repositorio. Se
sustituye por **Zilla Slab**, elegida midiendo el ancho de los mismos títulos en ambas fuentes
(diferencia menor del 1 %, así que los saltos de línea se conservan). Si la empresa tiene
licencia web, se agregan los archivos y se quita el reemplazo en `scripts/wp-import/lib/css.mjs`
(`FONT_MAP` y `FONT_MAP_UNQUOTED`).

## Logo e íconos

- Logo del header y del footer: imágenes importadas del WordPress (`public/uploads/2022/05/`).
- Favicon, íconos PNG, `favicon.ico`, manifest e imagen Open Graph: se generan con
  `node scripts/generate-assets.mjs` a partir de `src/assets/favicon-512.png` (icono del sitio
  en WordPress) y `src/assets/logo-welcome.png`.

## Estilos propios

`src/styles/site.css` solo añade lo que en WordPress hacía JavaScript (estados del menú,
carruseles, slideshows, fachada de video) y las páginas nuevas (búsqueda, privacidad, 404).
Usa los colores de marca de arriba; no introduzcas una paleta paralela.
