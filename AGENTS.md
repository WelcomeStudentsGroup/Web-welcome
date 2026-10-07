# AGENTS.md — Guía para personas y agentes de IA

> Este archivo es el **punto de entrada estándar** para cualquier asistente de IA
> (Claude Code, Cursor, GitHub Copilot, OpenAI Codex, Gemini, Windsurf…) y para
> cualquier desarrollador que trabaje en este repositorio. Léelo completo antes de
> hacer cambios. `CLAUDE.md` solo importa este archivo, así hay una única fuente de verdad.

## 1. Qué es este proyecto

Sitio web oficial de **Welcome Students Group** (welcomestudentsgroup.com.au):
agencia registrada de **educación y migración**, fundada en 2015, con oficinas en
**Brisbane y Gold Coast (Queensland, Australia)**. Ayuda a estudiantes y profesionales
—principalmente de Latinoamérica— a vivir, estudiar y trabajar en **Australia**,
**Nueva Zelanda** y **Dubái**.

Objetivos del sitio, en orden de prioridad:

1. **Generar consultas** (reservas de consulta gratuita, WhatsApp, formularios).
2. **Visibilidad** en buscadores (SEO) y en motores de IA generativa (GEO).
3. **Velocidad** (Core Web Vitals en verde) y **seguridad** (CSP estricta, sin terceros innecesarios).
4. **Portabilidad**: estándares abiertos, sin dependencia de ningún proveedor ni herramienta de IA.

Contexto completo del negocio: [`docs/01-negocio.md`](docs/01-negocio.md).

## 2. Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | [Astro](https://astro.build) 7, salida **estática** | HTML puro, 0 JS por defecto, SEO excelente, hosting en cualquier lugar |
| Lenguaje | TypeScript (strict) + `.astro` | Tipos para datos del negocio y contenido |
| Estilos | CSS propio con tokens (`src/styles/`) | Sin frameworks; liviano y compatible con CSP |
| Fuentes | Fraunces + Plus Jakarta Sans auto-hospedadas (`@fontsource-variable`) | Sin Google Fonts: privacidad, velocidad, CSP |
| Contenido | Colecciones de Astro (Markdown en `src/content/`) | Publicar = agregar un `.md` |
| Node | 22 (ver `.nvmrc`) | |

## 3. Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor local en http://localhost:4321
npm run build        # genera el sitio estático en dist/
npm run preview      # sirve dist/ (aquí sí aplica la CSP, en dev no)
npm run check        # chequeo de tipos de Astro/TypeScript
npm run verify       # check + build + control de calidad (OBLIGATORIO antes de commit)
node scripts/generate-assets.mjs   # regenera íconos PNG y la imagen Open Graph
```

`npm run verify` falla si hay: enlaces internos rotos, anclas inexistentes, falta de
title/description/canonical/og:image, más o menos de un `<h1>`, JSON-LD inválido,
atributos `style=""`, `onclick=""`, `href="#"`, textos `[Insert…]`, ids duplicados,
`target=_blank` sin `noopener`, fuentes incrustadas como `data:` o espacios faltantes junto a enlaces.
La CI de GitHub corre lo mismo en cada push y pull request.

## 4. Estructura

```
src/
  config/site.ts        ← FUENTE ÚNICA de datos del negocio (NAP, contacto, oficinas, redes, acreditaciones)
  data/content.ts       ← textos de secciones (servicios, visas, FAQ, destinos, testimonios…)
  content/news/*.md     ← artículos del blog/noticias (ver _template.md)
  content.config.ts     ← esquema del frontmatter de los artículos
  layouts/BaseLayout.astro ← <head> SEO, Open Graph, JSON-LD, header/footer
  components/           ← componentes reutilizables (Header, Footer, EnquiryForm, VisaExplorer…)
  pages/                ← una ruta por archivo (/, /about/, /services/, …, robots.txt, llms.txt)
  lib/schema.ts         ← generadores de datos estructurados schema.org
  lib/icons.ts          ← iconos SVG
  scripts/forms.ts      ← validación y envío de formularios
  styles/tokens.css     ← tokens de diseño (colores, espacios, tipografía)
  styles/global.css     ← estilos base y componentes compartidos
public/                 ← archivos estáticos (_headers, favicon, og-default.png, security.txt)
scripts/                ← verify-build.mjs (QA) y generate-assets.mjs
docs/                   ← documentación detallada (negocio, marca, arquitectura, SEO/GEO, seguridad, despliegue, pendientes)
.claude/skills/         ← skills (instrucciones expertas en Markdown) — ver sección 7
```

## 5. Reglas del proyecto (no negociables)

1. **Nunca inventar datos del negocio.** Teléfonos, direcciones, cifras, acreditaciones,
   testimonios, precios o logros solo pueden venir del equipo de Welcome. Si falta un
   dato, déjalo pendiente en `docs/07-pendientes.md`, no lo rellenes.
2. **Una sola fuente de verdad.** Datos del negocio → `src/config/site.ts`. Textos
   repetibles → `src/data/content.ts`. No dupliques un teléfono o una dirección en una página.
3. **CSP estricta.** Prohibido: atributos `style="..."`, `onclick`, scripts o estilos de
   CDNs externos, fuentes de Google, iframes/embeds de terceros sin actualizar la CSP y
   `docs/05-seguridad.md`. Usa clases CSS y `<script>` dentro de componentes (Astro los
   empaqueta y calcula sus hashes).
4. **Espacios en Astro 7.** Astro elimina los espacios en los saltos de línea junto a
   elementos. Si un texto continúa con un `<a>` en la línea siguiente, escribe `{' '}`
   al final de la línea anterior.
5. **SEO en cada página.** Toda página usa `BaseLayout` con `title` (≤ 50 caracteres +
   la marca), `description` única (120–160 caracteres) y exactamente un `<h1>`. Usa
   `SectionHead level={1}` o un `<h1>` explícito.
6. **Accesibilidad.** HTML semántico, `alt` en imágenes, contraste AA (usa
   `--brand-orange-ink` para texto o botones naranjas, no `--brand-orange`), foco visible,
   navegación con teclado.
7. **Rendimiento.** No agregues librerías JS de cliente sin una razón clara. Imágenes
   con `<Image>` de `astro:assets` (WebP/AVIF, dimensiones explícitas, `loading="lazy"`
   salvo la principal).
8. **Idioma.** El sitio público está en **inglés (en-AU)** porque compite en búsquedas
   en Australia; los testimonios se muestran en su idioma original. La documentación y
   los comentarios del código están en **español** (idioma del equipo).
9. **Antes de cada commit:** `npm run verify` en verde. Commits pequeños y descriptivos.

## 6. Tareas frecuentes

- **Cambiar un teléfono, email, dirección o red social:** `src/config/site.ts` (actualiza
  header, footer, contacto, JSON-LD y llms.txt a la vez).
- **Agregar o editar una visa, FAQ, destino o testimonio:** `src/data/content.ts`.
- **Publicar un artículo:** copia `src/content/news/_template.md`, cámbiale el nombre
  (será la URL), completa el frontmatter y pon `draft: false`.
- **Agregar una página:** crea `src/pages/nombre.astro` usando `BaseLayout` y agrégala a
  `nav` en `src/config/site.ts` si va en el menú.
- **Reemplazar un placeholder por una foto:** ver `docs/03-arquitectura.md` → "Imágenes".
- **Conectar los formularios:** define `PUBLIC_FORM_ENDPOINT` (ver `.env.example` y
  `docs/06-despliegue.md`).

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
| [docs/02-marca-y-diseno.md](docs/02-marca-y-diseno.md) | Colores, tipografía, componentes visuales |
| [docs/03-arquitectura.md](docs/03-arquitectura.md) | Cómo está construido y cómo extenderlo |
| [docs/04-seo-y-geo.md](docs/04-seo-y-geo.md) | Estrategia SEO técnico, local y GEO |
| [docs/05-seguridad.md](docs/05-seguridad.md) | CSP, cabeceras, formularios, dependencias |
| [docs/06-despliegue.md](docs/06-despliegue.md) | Hosting, variables de entorno, dominio, migración |
| [docs/07-pendientes.md](docs/07-pendientes.md) | Contenido y tareas pendientes |
