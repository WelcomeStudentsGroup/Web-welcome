# 02 · Marca y sistema de diseño

Los tokens están en `src/styles/tokens.css`. Úsalos siempre (`var(--...)`): no
escribas colores sueltos en los componentes.

## Colores

| Token | Valor | Uso |
|---|---|---|
| `--brand-purple` | `#722679` | Color principal: eyebrows, enlaces, secciones destacadas |
| `--brand-orange` | `#eb7a25` | Acento **decorativo** (líneas, brillos, números grandes) |
| `--brand-orange-ink` | `#b8580f` | Naranja **accesible** para botones y texto (contraste AA 4.7:1 con blanco) |
| `--brand-teal` | `#033b39` | Superficie oscura (footer, secciones "How we help", valores) |
| `--brand-grey` / `--ink-soft` | `#5d5c63` | Texto secundario |
| `--ink` | `#211926` | Texto principal (negro con tinte morado) |
| `--bg` / `--bg-alt` | `#faf7f2` / `#f2ece2` | Fondo marfil y su variante para alternar secciones |

> Regla de accesibilidad: el naranja de marca (`#eb7a25`) sobre blanco tiene un contraste
> de 2.9:1 y **no** cumple WCAG AA para texto. Para botones y texto naranja usa siempre
> `--brand-orange-ink`.

## Tipografía

- **Display / títulos:** Fraunces (serif editorial), alternativa libre a *Archer*.
- **Texto / interfaz:** Plus Jakarta Sans, alternativa libre a *Gotham*.
- Ambas auto-hospedadas vía `@fontsource-variable` (sin Google Fonts), con `font-display: swap`
  y preload del subconjunto latino.
- Si la empresa compra la licencia web de Archer y Gotham, reemplazar los imports en
  `BaseLayout.astro` y las variables `--font-display` / `--font-body`.

Escala: `.h1` (2.4–4.2rem), `.h2` (1.9–2.75rem), `.h3`, `.h4`, `.lede`, `.body-sm`,
`.caption`, `.eyebrow` (etiqueta en mayúsculas con línea naranja).

## Componentes visuales

- **Botones:** `.btn` + `.btn-primary` (naranja accesible), `.btn-secondary` (contorno),
  `.btn-ghost` (texto con flecha), `.btn-sm`, `.btn-block`.
- **Tarjetas:** `.card` (+ `--hover`, `--compact`, `--row`, `--on-dark`), `.icon-tile`.
- **Secciones:** `.section` (+ `--alt`, `--purple`, `--teal`, `--tight-top`), `.section-head`.
- **Grillas:** `.grid` + `.grid-2|3|4` (responsive automático), `.two-col`.
- **Chips y etiquetas:** `.chip`, `.chip--on-dark`, `.tag`, `.cert-chip`.
- **Listas:** `.check-list` (✓ naranja), `.why-list` + `.why-item` + `.why-num`.
- **Banda CTA:** componente `CtaBand.astro`.

## Logo

El logo actual es **provisional** (una "w" con degradado morado a naranja, en
`src/components/Logo.astro` y `public/favicon.svg`). Cuando exista el SVG oficial:
1. Reemplazar el SVG en `Logo.astro` y `public/favicon.svg`.
2. Ejecutar `node scripts/generate-assets.mjs` para regenerar los PNG y la imagen OG.

## Tema

Tema claro único, por decisión de diseño: es un sitio de marca pintado explícitamente y no
se invierte con el modo oscuro del sistema.
