# 03 · Arquitectura

## Principios

1. **Estático primero:** cada página se genera como HTML en el build. No hay servidor que
   mantener ni base de datos que atacar.
2. **Datos separados de la presentación:** el negocio en `src/config/site.ts`, los textos
   en `src/data/content.ts`, los artículos en `src/content/news/`.
3. **JavaScript mínimo y progresivo:** todo funciona sin JS (enlaces, FAQ, contenido). El
   JS solo mejora la experiencia: ventana de reserva, menú móvil, buscador, carrusel,
   explorador de visas y envío de formularios.
4. **Estándares abiertos:** HTML, CSS, TypeScript y Markdown. Nada atado a un proveedor.

## Flujo de una página

```
src/pages/services.astro
  └─ BaseLayout.astro  → <head> (title, description, canonical, OG, JSON-LD), Header, Footer,
  │                       WhatsAppFloat, BookingModal, init de formularios
  ├─ componentes (SectionHead, VisaExplorer, Faq, ImagePlaceholder, Icon…)
  └─ datos (src/data/content.ts, src/config/site.ts) + schema (src/lib/schema.ts)
```

## Rutas

Archivo en `src/pages/` = URL. Con `trailingSlash: 'always'` y `format: 'directory'`:
`about.astro` → `/about/`. Los endpoints `robots.txt.ts` y `llms.txt.ts` generan texto
plano en el build.

## Componentes clave

| Componente | Función |
|---|---|
| `BaseLayout.astro` | Metadatos SEO, JSON-LD base (Organization, WebSite, WebPage, BreadcrumbList), estructura global |
| `Header.astro` | Navegación, buscador interno (índice en el mismo archivo), menú móvil |
| `Footer.astro` | Navegación, contacto, newsletter, enlaces legales |
| `BookingModal.astro` | `<dialog>` nativo; cualquier elemento con `data-open-booking` lo abre (sin JS, el enlace va a `/contact/`) |
| `EnquiryForm.astro` | Formulario reutilizable (`full`, `short`, `booking`), honeypot, consentimiento |
| `NewsletterForm.astro` | Suscripción por email |
| `VisaExplorer.astro` | Herramienta orientativa de 2 pasos (las reglas están en su `<script>`) |
| `Faq.astro` | `<details>` nativo (el schema FAQPage lo agrega la página) |
| `Testimonials.astro` | Carrusel con scroll-snap |
| `ImagePlaceholder.astro` | Espacio reservado para una foto real (`data-photo-needed` describe la foto) |
| `Icon.astro` + `lib/icons.ts` | Iconos SVG inline |

## Formularios

`src/scripts/forms.ts` valida y envía un **POST JSON** a `PUBLIC_FORM_ENDPOINT`. Campos:
`name`, `email`, `phone`, `interest`, `message`, `consent`, más `form` (identificador:
`booking`, `contact`, `about-contact`, `newsletter`) y `page` (ruta de origen).

- Sin endpoint configurado **no se finge éxito**: se muestra WhatsApp y email.
- El campo oculto `_gotcha` es un honeypot: si viene lleno, se descarta.
- Sin JavaScript, el formulario hace POST nativo al mismo endpoint.

## Artículos (blog y noticias)

1. Copia `src/content/news/_template.md` a `src/content/news/mi-articulo.md`.
2. Completa el frontmatter (validado por `src/content.config.ts`: título ≤ 70 caracteres,
   descripción de 50 a 160).
3. `draft: false` para publicar. Se genera `/news/mi-articulo/` con schema
   `BlogPosting`/`NewsArticle`, y se agrega al sitemap y a `llms.txt`.

## Imágenes

Hoy los espacios de fotos son `ImagePlaceholder`. Para poner una foto real:

1. Guarda la imagen original (JPG/PNG de buena calidad) en `src/assets/images/`.
2. Reemplaza el placeholder por:
   ```astro
   ---
   import { Image } from 'astro:assets';
   import hero from '@/assets/images/hero-sydney.jpg';
   ---
   <Image src={hero} alt="Two students laughing in front of the Sydney Opera House" widths={[480, 800, 1200]} sizes="(max-width: 900px) 100vw, 50vw" class="photo" loading="eager" fetchpriority="high" />
   ```
   Astro genera WebP/AVIF optimizados con dimensiones fijas (sin saltos de diseño).
3. Usa `loading="eager"` + `fetchpriority="high"` **solo** en la imagen principal de la
   página; el resto queda con lazy loading por defecto.
4. `alt` descriptivo y en inglés (accesibilidad + SEO de imágenes).

La lista de fotos necesarias está en `docs/07-pendientes.md`.

## Agregar una página

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import SectionHead from '@/components/SectionHead.astro';
---
<BaseLayout title="Student Visa Guide" description="120–160 caracteres únicos…" breadcrumbs={[{ name: 'Student Visa Guide', href: '/student-visa/' }]}>
  <section class="section section--tight-top">
    <div class="container">
      <SectionHead level={1} eyebrow="Guide" title="Student visa guide" />
    </div>
  </section>
</BaseLayout>
```

Luego `npm run verify`.

## Internacionalización (futuro)

El sitio está en inglés (en-AU). Si se agrega español, usar el sistema i18n de Astro
(`/es/...`) con `hreflang` alternos en `BaseLayout`, y traducir `src/data/content.ts`
creando un archivo por idioma.
